import { describe, expect, it } from 'vitest';
import { venues } from '@/data';
import {
  decodeVenueIds,
  encodeVenueIds,
  resolveVenueIdsFromParams,
} from '@/lib/venueEncoding';

describe('encodeVenueIds / decodeVenueIds', () => {
  it('単一会場のエンコード→デコードが一致すること', () => {
    const input = ['rsg-tokyo'];
    const encoded = encodeVenueIds(input);
    const decoded = decodeVenueIds(encoded);
    expect(decoded).toEqual(input);
  });

  it('複数会場のエンコード→デコードが一致すること', () => {
    const input = ['rsg-tokyo', 'bc-aichi', 'sw', 'hh-osaka'];
    const encoded = encodeVenueIds(input);
    const decoded = decodeVenueIds(encoded);
    expect(decoded).toEqual(input);
  });

  it('全会場(60個)のエンコード→デコードが一致すること', () => {
    const allIds = venues.map((v) => v.id);
    const encoded = encodeVenueIds(allIds);
    const decoded = decodeVenueIds(encoded);
    expect(decoded).toEqual(allIds);
  });

  it('空配列をエンコードすると空配列にデコードされること', () => {
    const encoded = encodeVenueIds([]);
    const decoded = decodeVenueIds(encoded);
    expect(decoded).toEqual([]);
  });

  it('エンコード結果が最大11文字であること', () => {
    const allIds = venues.map((v) => v.id);
    const encoded = encodeVenueIds(allIds);
    expect(encoded.length).toBeLessThanOrEqual(11);
  });

  it('入力順序に依存せず同じ結果を返すこと', () => {
    const input1 = ['rsg-tokyo', 'bc-aichi', 'sw'];
    const input2 = ['sw', 'rsg-tokyo', 'bc-aichi'];
    expect(encodeVenueIds(input1)).toBe(encodeVenueIds(input2));
  });

  it('不正なbase64入力でnullを返すこと', () => {
    expect(decodeVenueIds('!!!invalid!!!')).toBeNull();
  });

  it('venues配列に存在しないIDは無視されること', () => {
    const input = ['rsg-tokyo', 'nonexistent-venue'];
    const encoded = encodeVenueIds(input);
    const decoded = decodeVenueIds(encoded);
    expect(decoded).toEqual(['rsg-tokyo']);
  });

  it('エンコード結果がURL安全な文字のみを含むこと', () => {
    const allIds = venues.map((v) => v.id);
    const encoded = encodeVenueIds(allIds);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('resolveVenueIdsFromParams', () => {
  it('vパラメータが存在する場合はデコード結果を返すこと', () => {
    const venueIds = ['rsg-tokyo', 'bc-aichi'];
    const encoded = encodeVenueIds(venueIds);
    const result = resolveVenueIdsFromParams({ v: encoded });
    expect(result).toBe('rsg-tokyo,bc-aichi');
  });

  it('venue_idパラメータのみの場合はそのまま返すこと', () => {
    const result = resolveVenueIdsFromParams({
      venue_id: 'rsg-tokyo,bc-aichi',
    });
    expect(result).toBe('rsg-tokyo,bc-aichi');
  });

  it('vとvenue_idが両方ある場合はvを優先すること', () => {
    const venueIds = ['sw'];
    const encoded = encodeVenueIds(venueIds);
    const result = resolveVenueIdsFromParams({
      v: encoded,
      venue_id: 'rsg-tokyo,bc-aichi',
    });
    expect(result).toBe('sw');
  });

  it('パラメータが空の場合は空文字列を返すこと', () => {
    expect(resolveVenueIdsFromParams({})).toBe('');
  });

  it('vが不正な値の場合はvenue_idにフォールバックすること', () => {
    const result = resolveVenueIdsFromParams({
      v: '!!!invalid!!!',
      venue_id: 'rsg-tokyo',
    });
    expect(result).toBe('rsg-tokyo');
  });
});
