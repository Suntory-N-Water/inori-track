import { type ClassValue, clsx } from 'clsx';
import { notFound } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { songs, songsSung, venues } from '@/data';
import { resolveVenueIdsFromParams } from '@/lib/venueEncoding';
import type { SongInfo } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Props = {
  searchParams?: {
    v?: string;
    venue_id?: string;
  };
};

export function getResultSongs({ searchParams }: Props) {
  const venueIdsQuery = resolveVenueIdsFromParams(searchParams ?? {});

  // クエリパラメータが設定されていない場合は、404 ページを表示
  if (!venueIdsQuery) {
    notFound();
  }

  // venue_id をカンマで区切って配列に変換し、Set化(パフォーマンス改善)
  const venueIdsSet = new Set(venueIdsQuery.split(','));

  const sungSongIds = songsSung
    .filter((setlist) => venueIdsSet.has(setlist.venueId))
    .flatMap((setlist) => setlist.songIds);

  const uniqueSungSongIds = new Set(sungSongIds);
  const unsungSongs = songs.filter((song) => !uniqueSungSongIds.has(song.id));
  return unsungSongs;
}

/**
 * クエリパラメータから参加会場IDに基づいて、SongsDataTable に渡すデータを生成する関数
 * @param queryParams - クエリパラメータ(例: { venue_id: "21,22,23" })
 * @returns SongInfo[] - テーブル表示用のデータ配列
 */
export function getSongsData(queryParams: {
  v?: string;
  venue_id?: string;
}): SongInfo[] {
  const venueIdsCsv = resolveVenueIdsFromParams(queryParams);
  if (!venueIdsCsv) {
    throw new Error('会場IDが指定されていません');
  }
  // ユーザーが参加した会場IDの配列を生成し、Set化(パフォーマンス改善)
  const participatedVenueIdsSet = new Set(
    venueIdsCsv.split(',').map((id) => id.trim()),
  );

  // songsSung のデータから、歌唱が行われたすべての会場IDの集合を取得
  const allVenueIdsInSongs = new Set(
    songsSung.map((setlist) => setlist.venueId),
  );
  // venues から、歌唱記録のある会場のみを抽出(配列は時系列順に定義済み)
  const relevantVenues = venues.filter((venue) =>
    allVenueIdsInSongs.has(venue.id),
  );

  // songsSung を効率的に検索できるようにMap化(パフォーマンス改善)
  // キー: "songId-venueId", 値: true
  const songsSungMap = new Map<string, boolean>();
  for (const setlist of songsSung) {
    for (const songId of setlist.songIds) {
      songsSungMap.set(`${songId}-${setlist.venueId}`, true);
    }
  }

  // 各曲について、参加して歌唱された会場に対して ◯ を、その他は - を付与する
  return songs.map((song) => {
    let count = 0;
    const songData: SongInfo = {
      name: song.title,
      count: 0,
    };

    // for...of を使用してループ処理を実施
    for (const venue of relevantVenues) {
      const isSung = songsSungMap.has(`${song.id}-${venue.id}`);
      if (participatedVenueIdsSet.has(venue.id) && isSung) {
        songData[venue.id] = '◯';
        count += 1;
      }
    }
    songData.count = count;
    return songData;
  });
}
