import { type ClassValue, clsx } from 'clsx';
import { notFound } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { songs, songsSung, venues } from '@/data';
import type { SongInfo } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Props = {
  searchParams?: {
    venue_id?: string;
  };
};

export function getResultSongs({ searchParams }: Props) {
  const venueIdsQuery = searchParams?.venue_id || '';

  // クエリパラメータが設定されていない場合は、404 ページを表示
  if (!venueIdsQuery) {
    notFound();
  }

  // venue_id をカンマで区切って配列に変換し、Set化(パフォーマンス改善)
  const venueIdsSet = new Set(venueIdsQuery.split(','));

  const sungSongIds = songsSung
    .filter((songSung) => venueIdsSet.has(songSung.venueId))
    .map((songSung) => songSung.songId);

  const uniqueSungSongIds = new Set(sungSongIds);
  const unsungSongs = songs.filter((song) => !uniqueSungSongIds.has(song.id));
  return unsungSongs;
}

/**
 * クエリパラメータから参加会場IDに基づいて、SongsDataTable に渡すデータを生成する関数
 * @param queryParams - クエリパラメータ(例: { venue_id: "21,22,23" })
 * @returns SongInfo[] - テーブル表示用のデータ配列
 */
export function getSongsData(queryParams: { venue_id?: string }): SongInfo[] {
  if (!queryParams.venue_id) {
    throw new Error('会場IDが指定されていません');
  }
  // ユーザーが参加した会場IDの配列を生成し、Set化(パフォーマンス改善)
  const participatedVenueIdsSet = new Set(
    queryParams.venue_id.split(',').map((id) => id.trim()),
  );

  // songsSung のデータから、歌唱が行われたすべての会場IDの集合を取得
  const allVenueIdsInSongs = new Set(songsSung.map((record) => record.venueId));
  // venues.json から、歌唱記録のある会場のみを抽出し、ID順にソートする
  const relevantVenues = venues
    .filter((venue) => allVenueIdsInSongs.has(venue.id))
    .sort((a, b) => Number(a.id) - Number(b.id));

  // songsSung を効率的に検索できるようにMap化(パフォーマンス改善)
  // キー: "songId-venueId", 値: true
  const songsSungMap = new Map<string, boolean>();
  for (const record of songsSung) {
    songsSungMap.set(`${record.songId}-${record.venueId}`, true);
  }

  // 各曲について、参加して歌唱された会場に対して ◯ を、その他は - を付与する
  return songs.map((song) => {
    let count = 0;
    // songData の型を Partial<Record<keyof SongInfo, string | number>> に変更
    const songData: Partial<Record<keyof SongInfo, string | number>> = {
      name: song.title,
      count: 0,
    };

    // for...of を使用してループ処理を実施
    for (const venue of relevantVenues) {
      // venue.json の shortId プロパティを利用してキーを生成(存在しなければ name をフォールバック)
      const rawKey = venue.shortId ? venue.shortId : venue.name;
      const isSung = songsSungMap.has(`${song.id}-${venue.id}`);
      if (participatedVenueIdsSet.has(venue.id) && isSung) {
        songData[rawKey as keyof SongInfo] = '◯';
        count += 1;
      }
    }
    songData.count = count;
    return songData as SongInfo;
  });
}
