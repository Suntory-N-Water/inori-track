import { venues } from '@/data';

/**
 * 会場ID配列をビットマスクとしてbase64urlエンコードする
 * @returns base64url文字列(パディングなし、最大11文字)
 */
export function encodeVenueIds(venueIds: string[]): string {
  const venueIdSet = new Set(venueIds);
  let bitmask = BigInt(0);
  for (let i = 0; i < venues.length; i++) {
    if (venueIdSet.has(venues[i].id)) {
      bitmask |= BigInt(1) << BigInt(i);
    }
  }

  const byteLength = Math.ceil(venues.length / 8);
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = Number((bitmask >> BigInt(i * 8)) & BigInt(0xff));
  }

  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * base64urlエンコードされたビットマスクを会場ID配列にデコードする
 * @returns デコードされた会場ID配列。不正な入力の場合はnullを返す
 */
export function decodeVenueIds(encoded: string): string[] | null {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    return null;
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  let bitmask = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    bitmask |= BigInt(bytes[i]) << BigInt(i * 8);
  }

  const venueIds: string[] = [];
  for (let i = 0; i < venues.length; i++) {
    if (bitmask & (BigInt(1) << BigInt(i))) {
      venueIds.push(venues[i].id);
    }
  }

  return venueIds;
}

/**
 * クエリパラメータから会場ID文字列を解決する(新旧両形式に対応)
 * - `v`: base64urlエンコードされたビットマスク(新形式)
 * - `venue_id`: カンマ区切りの会場IDスラッグ(旧形式、後方互換)
 * @returns カンマ区切りの会場ID文字列。パラメータが無い場合は空文字列
 */
export function resolveVenueIdsFromParams(params: {
  v?: string;
  venue_id?: string;
}): string {
  if (params.v) {
    const decoded = decodeVenueIds(params.v);
    if (decoded && decoded.length > 0) {
      return decoded.join(',');
    }
  }

  return params.venue_id ?? '';
}
