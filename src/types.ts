export type FormValues<T> = {
  items: T[];
};

/**
 * ユーザーが選択したライブに関連する会場とライブ名の型
 */
export type LiveAndVenuesInfo = {
  liveName: string;
  venues: {
    id: string;
    name: string;
  }[];
};

export type LiveName = {
  id: string;
  name: string;
  liveType: string;
};

export type Venue = {
  id: string;
  name: string;
};

/**
 * 各曲の歌唱情報を表す型(会場IDをキーに動的にプロパティを持つ)
 */
export type SongInfo = {
  name: string;
  count: number;
  [venueId: string]: string | number;
};
