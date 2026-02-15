# データ定数リファクタリング 詳細実装計画

> 本ドキュメントは `docs/ai/refactor-data-constants.md` の方針を具体化したものである。
> 元計画の Step 1〜5 をそのまま踏襲しつつ、調査結果に基づいて実装レベルまで落とし込む。

---

## クリティカルパス分析

### 依存関係図

```
Step 1 (songs.ts)  ──┐
      ↕ 並列可能      ├──→ Step 3 (songsSung.ts) ──→ 完了
Step 2 (venues.ts) ──┤
                     └──→ Step 4 (SongInfo型)    ──→ 完了
```

- **Step 1 と Step 2 は並列実行可能**: 触るフィールドが完全に独立(songId vs venueId/shortId)
- **Step 3 は Step 1 + Step 2 の両方が前提**: songsSung.ts は song スラッグと venue スラッグの両方を使う
- **Step 4 は Step 2 だけが前提**: SongInfo のキーが venue ID(ケバブケース)に変わるため
- **Step 3 と Step 4 の並列は避ける**: 両方とも `utils.ts` の `getSongsData` を変更するためコンフリクトする

### 最短クリティカルパス

```
Step 1 + Step 2(並列) → Step 3 → Step 4
```

所要ステップ数: 3段階(直列換算で4ステップ分の作業を3段階に圧縮可能)

### 実施スコープ(決定済み)

**全Step実施**: `Step 1 + Step 2(並列)→ Step 3 → Step 4`(3段階)

| 対応 | Step | 必要性 |
|---|---|---|
| venues shortId 未対応の解消 + 新規会場の反映 | Step 2 | **必須** |
| SongInfo 型の動的化 | Step 4 | **推奨(拡張性)** |
| songs.ts の可読性向上 | Step 1 | 実施する |
| songsSung.ts の構造改善 | Step 3 | 実施する |

---

## 調査で判明した既存の問題点

### 1. `venues.ts` の shortId 未対応

venues 48〜51(町民集会2025の4会場)が全て同一の `shortId: 'chomin2025Cinema'` を持つ。
これにより `getSongsData` で異なる会場のデータが同一キーに上書きされ、テーブル上で区別できない。
(町民集会2025は4会場あり、shortIdが未分化の状態。新アーキテクチャで各会場にユニークなスラッグを振ることで自然に解消される。)

```ts
// 現在: 4つの異なる会場が同じ shortId(未対応状態)
{ id: '48', name: '埼玉昼公演', shortId: 'chomin2025Cinema' }
{ id: '49', name: '埼玉夜公演', shortId: 'chomin2025Cinema' }
{ id: '50', name: '大阪',       shortId: 'chomin2025Cinema' }
{ id: '51', name: '仙台',       shortId: 'chomin2025Cinema' }
```

### 2. `SongInfo` 型・`columns.tsx` に新規会場が未反映

`chomin2025Cinema` と `trHyogo` が `SongInfo` 型にも `columns.tsx` にもない。
テーブルにこれらの会場の列が表示されていない。

### 3. `getSongsData` の数値ID依存ソート

```ts
// src/lib/utils.ts:56
.sort((a, b) => Number(a.id) - Number(b.id));
```

venue の `id` がスラッグになると `Number()` で `NaN` になり、ソート順が壊れる。

### 4. `songsSung.ts` のデータ規模

- 全 865 レコード(id: '1' 〜 '865')
- 52 会場分のセットリスト
- 平均 約16.6 曲/会場

---

## Step 1: `songs.ts` — 数値IDをスラッグ化

### TODO

- [x] `src/data/songs.ts` の全89曲の `id` をスラッグに変更
- [x] `src/test/app/(list)/result/page.test.tsx` のモックデータを更新
- [x] `pnpm run test` 通過を確認
- [x] `pnpm run ai-check` 通過を確認

### スラッグ生成ルール

| タイトルの言語 | 変換ルール | 例 |
|---|---|---|
| 英語のみ | そのまま kebab-case | `Dreaming Girls` → `dreaming-girls` |
| 日本語のみ | ヘボン式ローマ字で kebab-case | `コイセヨオトメ` → `koiseyootome` |
| 日本語+記号 | ローマ字化し、記号は除去 | `まっすぐに、トウメイに。` → `massuguni-toumeini` |
| 混在(英語+日本語) | そのまま混在で kebab-case | `風色Letter` → `kazeiro-letter` |
| 記号含み(！等) | 記号は除去 | `Catch the Rainbow！` → `catch-the-rainbow` |

### 全89曲のスラッグマッピング

| 現ID | title | 新ID(スラッグ) |
|---|---|---|
| 1 | くらりのうた | kurari-no-uta |
| 2 | While We Walk | while-we-walk |
| 3 | スクラップアート | scrap-art |
| 4 | アイオライト | iolite |
| 5 | identity | identity |
| 6 | アイマイモコ | aimaimoko |
| 7 | 茜色ノスタルジア | akaneiro-nostalgia |
| 8 | あの日の空へ | anohi-no-sora-e |
| 9 | アルペジオ | arpeggio |
| 10 | いつもずっと | itsumo-zutto |
| 11 | Innocent flower | innocent-flower |
| 12 | 今を僕らしく生きてくために | ima-wo-boku-rashiku |
| 13 | Will | will |
| 14 | Winter Wonder Wander | winter-wonder-wander |
| 15 | We Are The Music | we-are-the-music |
| 16 | Well Wishing Word | well-wishing-word |
| 17 | 運命の赤い糸 | unmei-no-akai-ito |
| 18 | 笑顔が似合う日 | egao-ga-niau-hi |
| 19 | 思い出のカケラ | omoide-no-kakera |
| 20 | 風色Letter | kazeiro-letter |
| 21 | Kitty Cat Adventure | kitty-cat-adventure |
| 22 | 君色プロローグ | kimiiro-prologue |
| 23 | Catch the Rainbow！ | catch-the-rainbow |
| 24 | クリスタライズ | crystallize |
| 25 | クータスタ | kutasuta |
| 26 | glow | glow |
| 27 | コイセヨオトメ | koiseyootome |
| 28 | ココロソマリ | kokoro-somari |
| 29 | 心つかまえて | kokoro-tsukamaete |
| 30 | ココロはMerry-Go-Round | kokoro-wa-merry-go-round |
| 31 | これからも。 | korekaramo |
| 32 | 三月と群青 | sangatsu-to-gunjou |
| 33 | シネマチックダイアリー | cinematic-diary |
| 34 | Shoo-Bee-Doo-Wap-Wap! | shoo-bee-doo-wap-wap |
| 35 | 水彩メモリー | suisai-memory |
| 36 | Sweet Melody | sweet-melody |
| 37 | Starlight Museum | starlight-museum |
| 38 | Starry Wish | starry-wish |
| 39 | Step Up！ | step-up |
| 40 | Snow White | snow-white |
| 41 | ソライロ | sorairo |
| 42 | 旅の途中 | tabi-no-tochuu |
| 43 | TRUST IN ETERNITY | trust-in-eternity |
| 44 | Dreaming Girls | dreaming-girls |
| 45 | 夏の約束 | natsu-no-yakusoku |
| 46 | 夏夢 | natsuyume |
| 47 | 涙のあとは | namida-no-atowa |
| 48 | 八月のスーベニア | hachigatsu-no-souvenir |
| 49 | Happy Birthday | happy-birthday |
| 50 | 春空 | harusora |
| 51 | HELLO HORIZON | hello-horizon |
| 52 | ハートノイロ | heart-no-iro |
| 53 | harmony ribbon | harmony-ribbon |
| 54 | パレオトピア | paleotopia |
| 55 | ピュアフレーム | pure-frame |
| 56 | Future Seeker | future-seeker |
| 57 | BLUE COMPASS | blue-compass |
| 58 | brave climber | brave-climber |
| 59 | 星屑のコントレイル | hoshikuzu-no-contrail |
| 60 | 僕らだけの鼓動 | bokura-dake-no-kodou |
| 61 | 僕らは今 | bokura-wa-ima |
| 62 | My Graffiti | my-graffiti |
| 63 | Million Futures | million-futures |
| 64 | Melty night | melty-night |
| 65 | MELODY FLAG | melody-flag |
| 66 | Morning Prism | morning-prism |
| 67 | 約束のアステリズム | yakusoku-no-asterism |
| 68 | 夢のつぼみ | yume-no-tsubomi |
| 69 | Lucky Clover | lucky-clover |
| 70 | REAL-EYES | real-eyes |
| 71 | リトルシューゲイザー | little-shoegazer |
| 72 | Ring of Smile | ring-of-smile |
| 73 | Ready Steady Go! | ready-steady-go |
| 74 | Wonder Caravan！ | wonder-caravan |
| 75 | まっすぐに、トウメイに。 | massuguni-toumeini |
| 76 | Loop Slider Cider | loop-slider-cider |
| 77 | Milky Star | milky-star |
| 78 | heart bookmark | heart-bookmark |
| 79 | フラーグム | fragum |
| 80 | ほしとね、 | hoshitone |
| 81 | グラデーション | gradation |
| 82 | 燈籠光柱 | tourou-kouchuu |
| 83 | Turquoise | turquoise |
| 84 | 夢のつづき | yume-no-tsuzuki |
| 85 | まだ、言わないで。 | mada-iwanaide |
| 86 | アニバーサリー | anniversary |
| 87 | NEXT DECADE | next-decade |
| 88 | My Orchestra | my-orchestra |
| 89 | 海踏みのスピカ | umifumi-no-spica |

### 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `src/data/songs.ts` | 全89曲の `id` をスラッグに変更 |

### 影響を受けるが変更不要なファイル

| ファイル | 理由 |
|---|---|
| `src/lib/utils.ts` (`getResultSongs`) | `song.id` で比較しているだけ。ID形式が変わっても動作ロジックに影響なし |
| `src/components/features/result/ResultInfo.tsx` | `param.id` を React の `key` に使用。スラッグでも問題なし |
| `src/app/api/og/route.tsx` | `songs.length` のみ参照。ID形式に依存なし |
| `src/app/(list)/result/page.tsx` | `songs.length` のみ参照。ID形式に依存なし |

### このStepで触らないファイル

- `songsSung.ts` の `songId` → Step 3 で一括対応

### テスト

- `getResultSongs` のテストで使うモックデータの `songId` をスラッグに更新
- `ResultInfo` のテストで使うモックデータの `id` をスラッグに更新

---

## Step 2: `venues.ts` — `shortId` を `id` に昇格・数値ID廃止

### TODO

- [x] `src/data/venues.ts` の全52会場の `id` をスラッグに変更
- [x] `src/data/venues.ts` の `shortId` フィールドを全て削除
- [x] 会場48〜51の shortId 未対応を解消(個別スラッグを付与)
- [x] コメントアウトされている会場(53〜59)のIDもスラッグ形式に変換
- [x] `src/lib/utils.ts` の `getSongsData`: `venue.shortId` → `venue.id` に変更
- [x] `src/lib/utils.ts` の `getSongsData`: `.sort((a, b) => Number(a.id) - Number(b.id))` を削除
- [x] `src/components/features/report/columns.tsx` の `accessorKey` をケバブケースに更新
- [x] `src/components/features/report/columns.tsx` に新規会場5列を追加
- [x] `src/test/app/(list)/venue/page.test.tsx` のモックデータを更新(任意)
- [x] `pnpm run test` 通過を確認
- [x] `pnpm run ai-check` 通過を確認

### shortId → ケバブケース変換ルール

既存の `shortId`(キャメルケース)をケバブケースに変換し、`id` として使用する。

### 全52会場のスラッグマッピング

| 現ID | name | liveNameId | 現shortId | 新ID(スラッグ) |
|---|---|---|---|---|
| 1 | 東京 | 1st-live-ready-steady-go | rsgTokyo | rsg-tokyo |
| 2 | 愛知 | live-tour-2018-blue-compass | bcAichi | bc-aichi |
| 3 | 石川 | live-tour-2018-blue-compass | bcIshikawa | bc-ishikawa |
| 4 | 兵庫 | live-tour-2018-blue-compass | bcHyogo | bc-hyogo |
| 5 | 千葉 | live-tour-2018-blue-compass | bcChiba | bc-chiba |
| 6 | 大阪 | live-tour-2019-catch-the-rainbow | ctrOsaka | ctr-osaka |
| 7 | 愛知 | live-tour-2019-catch-the-rainbow | ctrAichi | ctr-aichi |
| 8 | 東京1日目 | live-tour-2019-catch-the-rainbow | ctrTokyo1 | ctr-tokyo-1 |
| 9 | 東京2日目 | live-tour-2019-catch-the-rainbow | ctrTokyo2 | ctr-tokyo-2 |
| 10 | 神奈川 | 5th-anniversary-live-starry-wishes | sw | sw |
| 11 | 大阪 | live-tour-2021-hello-horizon | hh-osaka | hh-osaka |
| 12 | 愛知 | live-tour-2021-hello-horizon | hhAichi | hh-aichi |
| 13 | 福岡 | live-tour-2021-hello-horizon | hhFukuoka | hh-fukuoka |
| 14 | 宮城 | live-tour-2021-hello-horizon | hhMiyagi | hh-miyagi |
| 15 | 神奈川 | live-tour-2021-hello-horizon | hhKanagawa | hh-kanagawa |
| 16 | 愛知 | live-tour-2022-glow | glowAichi | glow-aichi |
| 17 | 宮城 | live-tour-2022-glow | glowMiyagi | glow-miyagi |
| 18 | 福岡 | live-tour-2022-glow | glowFukuoka | glow-fukuoka |
| 19 | 神奈川 | live-tour-2022-glow | glowKanagawa | glow-kanagawa |
| 20 | 兵庫 | live-tour-2022-glow | glowHyogo | glow-hyogo |
| 21 | 兵庫 | live-tour-2023-scrap-art | saHyogo | sa-hyogo |
| 22 | 宮城 | live-tour-2023-scrap-art | saMiyagi | sa-miyagi |
| 23 | 愛知 | live-tour-2023-scrap-art | saAichi | sa-aichi |
| 24 | 福岡 | live-tour-2023-scrap-art | saFukuoka | sa-fukuoka |
| 25 | 神奈川1日目 | live-tour-2023-scrap-art | saKanagawa1 | sa-kanagawa-1 |
| 26 | 神奈川2日目 | live-tour-2023-scrap-art | saKanagawa2 | sa-kanagawa-2 |
| 27 | 東京昼公演 | inorimachi-town-meeting-2018 | chomin2018TokyoDay | chomin-2018-tokyo-day |
| 28 | 東京夜公演 | inorimachi-town-meeting-2018 | chomin2018TokyoNight | chomin-2018-tokyo-night |
| 29 | 兵庫昼公演 | inorimachi-town-meeting-2019 | chomin2019HyogoDay | chomin-2019-hyogo-day |
| 30 | 兵庫夜公演 | inorimachi-town-meeting-2019 | chomin2019HyogoNight | chomin-2019-hyogo-night |
| 31 | 東京昼公演 | inorimachi-town-meeting-2019 | chomin2019TokyoDay | chomin-2019-tokyo-day |
| 32 | 東京夜公演 | inorimachi-town-meeting-2019 | chomin2019TokyoNight | chomin-2019-tokyo-night |
| 33 | 横浜昼公演 | inorimachi-town-meeting-2021-second-helping | chomin2021YokohamaDay | chomin-2021-yokohama-day |
| 34 | 横浜夜公演 | inorimachi-town-meeting-2021-second-helping | chomin2021YokohamaNight | chomin-2021-yokohama-night |
| 35 | 東京昼公演 | inorimachi-town-meeting-2023 | chomin2023TokyoDay | chomin-2023-tokyo-day |
| 36 | 東京夜公演 | inorimachi-town-meeting-2023 | chomin2023TokyoNight | chomin-2023-tokyo-night |
| 37 | 埼玉昼公演 | inorimachi-town-meeting-2024-acoustic-live-wonder-caravan!- | chomin2024SaitamaDay | chomin-2024-saitama-day |
| 38 | 埼玉夜公演 | inorimachi-town-meeting-2024-acoustic-live-wonder-caravan!- | chomin2024SaitamaNight | chomin-2024-saitama-night |
| 39 | 滋賀 | inorimachi-town-meeting-2024-acoustic-live-wonder-caravan!- | chomin2024Shiga | chomin-2024-shiga |
| 40 | 愛知 | inorimachi-town-meeting-2024-acoustic-live-wonder-caravan!- | chomin2024Aichi | chomin-2024-aichi |
| 41 | 兵庫 | live-tour-2024-heart-bookmark | hbHyogo | hb-hyogo |
| 42 | 広島 | live-tour-2024-heart-bookmark | hbHiroshima | hb-hiroshima |
| 43 | 愛知 | live-tour-2024-heart-bookmark | hbAichi | hb-aichi |
| 44 | 福岡 | live-tour-2024-heart-bookmark | hbFukuoka | hb-fukuoka |
| 45 | 北海道 | live-tour-2024-heart-bookmark | hbHokkaido | hb-hokkaido |
| 46 | 千葉1日目 | live-tour-2024-heart-bookmark | hbChiba1 | hb-chiba-1 |
| 47 | 千葉2日目 | live-tour-2024-heart-bookmark | hbChiba2 | hb-chiba-2 |
| 48 | 埼玉昼公演 | inorimachi-town-meeting-2025-acoustic-live-cinemati-diary- | chomin2025Cinema | chomin-2025-saitama-day |
| 49 | 埼玉夜公演 | inorimachi-town-meeting-2025-acoustic-live-cinemati-diary- | chomin2025Cinema | chomin-2025-saitama-night |
| 50 | 大阪 | inorimachi-town-meeting-2025-acoustic-live-cinemati-diary- | chomin2025Cinema | chomin-2025-osaka |
| 51 | 仙台 | inorimachi-town-meeting-2025-acoustic-live-cinemati-diary- | chomin2025Cinema | chomin-2025-sendai |
| 52 | 兵庫 | live-tour-2025-travel-record | trHyogo | tr-hyogo |

**注意**: 会場48〜51は現状 `shortId` が未分化(全て `chomin2025Cinema`)。このStepで個別のスラッグIDを付与し、解消する。

### コメントアウトされている会場(53〜59)

```ts
// live-tour-2025-travel-record の未公演分
// 53: 静岡 → tr-shizuoka
// 54: 福岡 → tr-fukuoka
// 55: 岡山 → tr-okayama
// 56: 北海道 → tr-hokkaido
// 57: 愛知 → tr-aichi
// 58: 神奈川1日目 → tr-kanagawa-1
// 59: 神奈川2日目 → tr-kanagawa-2
```

コメントアウトのまま維持し、IDだけスラッグ形式に変換する。

### 変更対象ファイル

| ファイル | 変更内容 | 具体的な修正 |
|---|---|---|
| `src/data/venues.ts` | `id` をスラッグ化、`shortId` 廃止 | 52箇所の `id` 変更、`shortId` フィールド削除 |
| `src/lib/utils.ts` (`getSongsData`) | `venue.shortId` → `venue.id` に変更 | L77: `venue.shortId ? venue.shortId : venue.name` → `venue.id` |
| `src/lib/utils.ts` (`getSongsData`) | ソート順の変更 | L56: `Number(a.id) - Number(b.id)` → 会場配列の定義順を維持する方式に変更 |

### `getSongsData` のソート順問題の解決

現状: `Number(a.id)` で数値ソートしている。スラッグ化後は `NaN` になるため壊れる。

**解決策**: `venues` 配列の定義順をそのまま使う。`venues` は既に時系列順に定義されているため、`filter` の結果がそのまま正しい順序になる。`.sort()` を削除する。

```ts
// 変更前
const relevantVenues = venues
  .filter((venue) => allVenueIdsInSongs.has(venue.id))
  .sort((a, b) => Number(a.id) - Number(b.id));

// 変更後
const relevantVenues = venues
  .filter((venue) => allVenueIdsInSongs.has(venue.id));
```

### URLクエリパラメータの変化

```
// 変更前
/result?venue_id=21,22,23
/report?venue_id=21,22,23

// 変更後
/result?venue_id=sa-hyogo,sa-miyagi,sa-aichi
/report?venue_id=sa-hyogo,sa-miyagi,sa-aichi
```

既存の共有URLは破壊される(元計画で許容済み)。

### 影響を受けるが変更不要なファイル

| ファイル | 理由 |
|---|---|
| `src/app/(list)/venue/page.tsx` | `venue.id` と `venue.name` のみ使用。型がスラッグに変わるだけ |
| `VenueCheckBoxForm.tsx` | `item.id` をフォーム値に使用。スラッグでも同じ動作 |
| `src/app/report/page.tsx` | `params.venue_id` をそのまま渡すだけ |
| `src/app/(list)/result/page.tsx` | `venue_id` クエリパラメータの形式に依存しない |

### Venue 型の変更

```ts
// 変更前(src/types.ts 由来ではなく venues.ts の実データ構造)
type VenueData = {
  id: string;
  name: string;
  liveNameId: string;
  shortId: string;
};

// 変更後
type VenueData = {
  id: string;
  name: string;
  liveNameId: string;
};
```

`src/types.ts` の `Venue` 型(`{ id: string; name: string }`)は変更不要。`shortId` はここに含まれていない。

### テスト

- `VenueCheckBoxForm` のテスト: モックデータの `venue.id` が `'2', '3'` 等。これをスラッグに変更する必要がある
  - ただし、テストで使っているのは `LiveAndVenuesInfo` 型のモックで、本物のデータを使っていないため、テスト自体のロジックは影響を受けない。IDの値だけスラッグ形式に更新する

---

## Step 3: `songsSung.ts` — フラットリストからセットリスト構造へ

### TODO

- [x] 変換スクリプトを作成(一時利用、コミットしない)
- [x] `src/data/songsSung.ts` を865レコード → 約52セットリストに再構成
- [x] 変換後データの検証: `songsSung.flatMap(s => s.songIds).length === 865`
- [x] 変換後データの検証: `songsSung.length === 52`
- [x] `src/lib/utils.ts` の `getResultSongs`: `.map(s => s.songId)` → `.flatMap(s => s.songIds)`
- [x] `src/lib/utils.ts` の `getSongsData`: `songsSungMap` の構築をネストループに変更
- [x] `pnpm run test` 通過を確認
- [x] `pnpm run ai-check` 通過を確認

### 前提条件

- Step 1(song ID スラッグ化)完了済み
- Step 2(venue ID スラッグ化)完了済み

### データ構造の変更

```ts
// 変更前: 865行のフラットリスト
export const songsSung = [
  { id: '1', liveNameId: '1st-live-ready-steady-go', venueId: '1', songId: '44' },
  { id: '2', liveNameId: '1st-live-ready-steady-go', venueId: '1', songId: '65' },
  // ... 865エントリ
];

// 変更後: 会場ごとのセットリスト(約52エントリ)
export const songsSung = [
  {
    liveNameId: '1st-live-ready-steady-go',
    venueId: 'rsg-tokyo',
    songIds: [
      'dreaming-girls',
      'melody-flag',
      'koiseyootome',
      // ... 歌唱順で配列
    ],
  },
  // ... 約52セットリスト
];
```

### 型定義

```ts
// 新しい型(src/data/songsSung.ts 内、または別途定義)
type Setlist = {
  liveNameId: string;
  venueId: string;
  songIds: string[];
};
```

`src/types.ts` にこの型を追加するかどうかは、他ファイルからの参照有無で判断する。
`songsSung` は `src/lib/utils.ts` からのみ参照されるため、`songsSung.ts` 内でローカルに定義するのが妥当。

### 削除されるフィールド

- `id`(連番): セットリスト単位では不要
- 個別の `songId`: `songIds` 配列に統合

### 残すフィールド

- `liveNameId`: `venueId` から `venues.ts` 経由で逆引き可能だが、可読性のために残す(元計画の方針)

### `songIds` の配列順序

歌唱順(セトリ順)を保持する。将来的に「セトリ順表示」機能を追加できる設計余地を残す。

### 変更対象ファイル

| ファイル | 変更内容 | 具体的な修正 |
|---|---|---|
| `src/data/songsSung.ts` | 構造変更 | 865レコード → 約52セットリストに再構成 |
| `src/lib/utils.ts` (`getResultSongs`) | `songId` → `songIds` 対応 | 後述 |
| `src/lib/utils.ts` (`getSongsData`) | `songsSungMap` の構築方法変更 | 後述 |

### `getResultSongs` の変更

```ts
// 変更前 (src/lib/utils.ts:28-31)
const sungSongIds = songsSung
  .filter((songSung) => venueIdsSet.has(songSung.venueId))
  .map((songSung) => songSung.songId);

// 変更後
const sungSongIds = songsSung
  .filter((setlist) => venueIdsSet.has(setlist.venueId))
  .flatMap((setlist) => setlist.songIds);
```

### `getSongsData` の変更

```ts
// 変更前 (src/lib/utils.ts:52-63)
const allVenueIdsInSongs = new Set(songsSung.map((record) => record.venueId));
// ...
const songsSungMap = new Map<string, boolean>();
for (const record of songsSung) {
  songsSungMap.set(`${record.songId}-${record.venueId}`, true);
}

// 変更後
const allVenueIdsInSongs = new Set(songsSung.map((setlist) => setlist.venueId));
// ...
const songsSungMap = new Map<string, boolean>();
for (const setlist of songsSung) {
  for (const songId of setlist.songIds) {
    songsSungMap.set(`${songId}-${setlist.venueId}`, true);
  }
}
```

`songsSungMap` のキー形式 `"songId-venueId"` は維持される。構築方法がネストループになるだけ。

### データ変換の検証方法

変換後のデータの正しさを以下で検証する：

1. **レコード数の保存**: `songsSung.flatMap(s => s.songIds).length === 865`(変換前の総レコード数)
2. **会場数の保存**: `songsSung.length === 52`(venueId のユニーク数)
3. **テスト**: 既存の `getResultSongs` / `getSongsData` テストが同じ結果を返すこと

---

## Step 4: `SongInfo` 型 — ハードコードを動的対応へ

### TODO

- [x] `src/types.ts` の `SongInfo` 型をインデックスシグネチャに変更
- [x] `src/lib/utils.ts` の `getSongsData`: `as keyof SongInfo` キャストを解消
- [x] `src/lib/utils.ts` の `getSongsData`: `songData` の型定義を簡素化
- [x] `src/test/components/SongsDataTable.test.tsx` のモックデータを新型に合わせて更新
- [x] `pnpm run test` 通過を確認
- [x] `pnpm run ai-check` 通過を確認

### 現状の問題

`SongInfo` 型に 48 個の会場プロパティが列挙されている(`src/types.ts:30-80`)。
新しい会場を追加するたびに型定義の更新が必要。

### 変更内容

```ts
// 変更前 (src/types.ts)
export type SongInfo = {
  name: string;
  count: number;
  rsgTokyo: string;
  bcAichi: string;
  // ... 46個の会場プロパティ
  chomin2024Aichi: string;
};

// 変更後
export type SongInfo = {
  name: string;
  count: number;
  [venueId: string]: string | number;
};
```

### `getSongsData` のキャスト解消

```ts
// 変更前 (src/lib/utils.ts:80)
songData[rawKey as keyof SongInfo] = '◯';

// 変更後(Step 2 で venue.shortId → venue.id に変更済み)
songData[venue.id] = '◯';
```

`as keyof SongInfo` のキャストが不要になる。

```ts
// 変更前 (src/lib/utils.ts:69)
const songData: Partial<Record<keyof SongInfo, string | number>> = {

// 変更後
const songData: SongInfo = {
  name: song.title,
  count: 0,
};
```

### `columns.tsx` への影響(スコープ外)

`columns.tsx` はこのStepでは変更しない(元計画の方針)。

ただし、`accessorKey` がキャメルケース(`rsgTokyo` など)からケバブケース(`rsg-tokyo` など)に変わるため、**Step 2 完了後に `columns.tsx` の `accessorKey` もケバブケースに更新する必要がある**。

これは元計画で「スコープ外」とされている列ヘッダー略称の変更とは別問題。`accessorKey` が `SongInfo` のキーと一致しなくなるため、動作が壊れる。

### `columns.tsx` の `accessorKey` 更新(Step 2 の追加作業として必須)

```ts
// 変更前
{ accessorKey: 'rsgTokyo', header: 'RSG東京' },

// 変更後
{ accessorKey: 'rsg-tokyo', header: 'RSG東京' },
```

全列の `accessorKey` をケバブケースに変更。`header`(表示名)は変更しない。

**加えて、新規会場の列を追加する**:
```ts
{ accessorKey: 'chomin-2025-saitama-day', header: '町25埼昼' },
{ accessorKey: 'chomin-2025-saitama-night', header: '町25埼夜' },
{ accessorKey: 'chomin-2025-osaka', header: '町25大阪' },
{ accessorKey: 'chomin-2025-sendai', header: '町25仙台' },
{ accessorKey: 'tr-hyogo', header: 'TR兵庫' },
```

### テスト

- `SongsDataTable.test.tsx` のモックデータを `SongInfo` の新しい型に合わせて更新
  - 48個の個別プロパティ → 任意の `[venueId: string]` キーに変更
  - テストの本質(テーブル描画、フィルタ、行の色分け)には影響なし

---

## Step 5: テスト修正(各Step横断)

### テストファイル一覧と影響

| テストファイル | 影響するStep | 必要な変更 |
|---|---|---|
| `src/test/app/(list)/live/page.test.tsx` | なし | `liveNames` のデータ構造は変更しないため影響なし |
| `src/test/app/(list)/venue/page.test.tsx` | Step 2 | モックデータの `venue.id` をスラッグに更新(任意。モック値なので動作影響なし) |
| `src/test/app/(list)/result/page.test.tsx` | Step 1 | モックデータの `song.id` をスラッグに更新 |
| `src/test/components/SongsDataTable.test.tsx` | Step 4 | モックデータの `SongInfo` を新型に更新 |
| `src/test/app/page.test.tsx` | なし | `liveNames` の表示テストのみ。影響なし |

### 各Stepごとのテスト実行タイミング

元計画では Step 5 として最後にまとめる方針だが、TDD方針(CLAUDE.md)に従い、**各Step完了時にテストを修正・実行する**のが望ましい。

- **Step 1 完了時**: `pnpm run test` で `result/page.test.tsx` を確認
- **Step 2 完了時**: `pnpm run test` で全テスト通過を確認(`getSongsData` のソート変更含む)
- **Step 3 完了時**: `pnpm run test` で `getResultSongs` / `getSongsData` の動作確認
- **Step 4 完了時**: `pnpm run test` で `SongsDataTable.test.tsx` の型変更確認
- **全Step完了時**: `pnpm run ai-check`(lint + 型チェック)で最終確認

---

## 実施順序と依存関係の詳細

### 全Step実施の場合(推奨)

```
段階1(並列実行可能):
  ┌─ Step 1: songs.ts スラッグ化
  │    変更: songs.ts のみ
  │    テスト: result/page.test.tsx のモック更新
  │    検証: pnpm run test && pnpm run ai-check
  │
  └─ Step 2: venues.ts スラッグ化 + shortId 廃止
       変更: venues.ts, utils.ts (getSongsData), columns.tsx (accessorKey)
       テスト: venue/page.test.tsx のモック更新(任意)
       対応: venues 48-51 の shortId 未対応を解消
       検証: pnpm run test && pnpm run ai-check
         ↓
段階2:
  Step 3: songsSung.ts 構造変更(Step 1 + Step 2 前提)
    変更: songsSung.ts, utils.ts (getResultSongs, getSongsData)
    テスト: 変換後データの件数検証
    検証: pnpm run test && pnpm run ai-check
         ↓
段階3:
  Step 4: SongInfo 型の動的化(Step 2 前提。Step 3 と utils.ts が競合するため直列)
    変更: types.ts, utils.ts (キャスト解消)
    テスト: SongsDataTable.test.tsx のモック更新
    検証: pnpm run test && pnpm run ai-check
```

### ~~MVPのみの場合~~(不採用)

全Step実施で決定済みのため、MVPのみの実施パスは使用しない。

---

## GAS・スプレッドシートについて

- GASは別管理(このリポジトリ外)
- スプレッドシートのデータ構造は現在のTSファイルと同じフラット構造で、GASはそれをそのままTSに出力しているだけ
- 本リファクタリング完了後、TSファイルを直接編集する運用に切り替え、スプレッドシート→GAS→貼り付けの運用フローを廃止する
- GAS側の調整は本リファクタリングのスコープ外

---

## リスク・注意事項

### 1. スラッグの一意性

89曲のスラッグが全て一意であることを確認する。同名曲がある場合はサフィックスで区別する。
現状の89曲には重複タイトルはないため問題なし。

### 2. `columns.tsx` と `SongInfo` のキー整合性

Step 2 で venue ID がケバブケースになると、`columns.tsx` の `accessorKey` と `getSongsData` が返す `SongInfo` のキーが不一致になる。
**Step 2 の作業範囲に `columns.tsx` の `accessorKey` 更新を含める必要がある**(元計画ではスコープ外としていたが、`accessorKey` の変更は機能維持に必須)。

### 3. ヘッダー略称は変更しない

`columns.tsx` の `header`(`'RSG東京'`, `'BC愛知'` 等)は変更しない。これは元計画通りスコープ外。

### 4. `songsSung.ts` の変換精度

865レコードをプログラム的にセットリスト構造に変換するスクリプトを用意し、手動変換のミスを防ぐ。変換スクリプトは一時的なもので、リポジトリにはコミットしない。

### 5. NEXT_PUBLIC_SPOILER_VENUE_ID 環境変数

この環境変数に設定されているのは `liveNameId`(ライブ名のID)であり、`venue.id` ではない。
`LiveCheckBoxForm.tsx:34` で `params.find((param) => param.id === spoilerVenueId)` と比較しており、`params` は `LiveName[]` 型。
よって venue ID のスラッグ化はこの機能に影響しない。

### 6. 型のエクスポート構造

`src/data/index.ts` は `export * from './songsSung'` で再エクスポートしている。
`songsSung` の型が変わっても export 文自体は変更不要。ただし、利用側(`utils.ts`)でのプロパティアクセスは変更が必要。
