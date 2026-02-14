# データ定数リファクタリング計画

## 背景

スプレッドシートから自動生成したデータ定数が、正規化された数値IDの羅列になっており、以下の問題がある。

- `songsSung.ts` が5,192行で、`songId: '44'` のように意味が読めない
- 会場追加のたびに `SongInfo` 型・`columns.tsx` を手動で更新する必要がある
- AIに「セトリ追加して」と頼む際、数値IDでは正確な操作が困難

## ゴール

- データファイルを見ただけで「どの会場でどの曲が歌われたか」がわかる
- 会場・曲の追加時にデータファイル以外の変更が不要になる
- AIがセットリストを直接編集できる構造にする

## 影響範囲

現在データ定数を参照しているファイル一覧：

| ファイル | 使用データ | 用途 |
|---|---|---|
| `src/lib/utils.ts` | `songs`, `songsSung`, `venues` | 未聴曲の算出 / テーブルデータ生成 |
| `src/app/(list)/live/page.tsx` | `liveNames` | ライブ選択画面 |
| `src/app/(list)/venue/page.tsx` | `liveNames`, `venues` | 会場選択画面 |
| `src/app/(list)/result/page.tsx` | `songs` | 結果画面 |
| `src/app/api/og/route.tsx` | `songs` | OGP画像生成 |
| `src/components/features/result/ResultInfo.tsx` | `songs` | 結果表示 |
| `src/components/features/report/columns.tsx` | (型のみ) | テーブル列定義 **※ハードコード** |
| `src/components/features/report/SongsDataTable.tsx` | (型のみ) | テーブル表示 |
| `src/types.ts` | - | `SongInfo` 型定義 **※ハードコード** |

## Step 1: `songs.ts` — 数値IDをスラッグ化

### 現状

```ts
{ id: '44', title: 'Dreaming Girls' }
```

### 変更後

```ts
{ id: 'dreaming-girls', title: 'Dreaming Girls' }
```

### 作業内容

- `songs.ts` の全89曲のIDをタイトルベースのスラッグに変更
- スプシ側(GAS)の出力を合わせて変更

### 影響箇所と対応

- `songsSung.ts` の `songId` → Step 3で一括対応
- `utils.ts` の `getResultSongs` → `songsSung` の `songId` でフィルタしているだけなので、ID形式が変わっても動作に影響なし
- `ResultInfo.tsx` → `song.id` をkeyに使っているが、スラッグでも問題なし

---

## Step 2: `venues.ts` — `shortId` を `id` に昇格・数値ID廃止

### 現状

```ts
{ id: '1', name: '東京', liveNameId: '1st-live-ready-steady-go', shortId: 'rsgTokyo' }
```

### 変更後

```ts
{ id: 'rsg-tokyo', name: '東京', liveNameId: '1st-live-ready-steady-go' }
```

### 作業内容

- `shortId` の値をケバブケース化して `id` に昇格
- `shortId` フィールドを廃止

### 影響箇所と対応

- **URLクエリパラメータ `venue_id`**: 現在 `venue_id=21,22,23` のように数値で渡されている。スラッグに変わると **既存の共有URLが壊れる**
  - 対応案: 移行期間中は旧IDも受け付けるマッピングを用意するか、破壊的変更として許容するか → **要ユーザー判断**
- `VenueCheckBoxForm.tsx` → `item.id` をフォーム値に使用。スラッグになるだけで動作は同じ
- `utils.ts` の `getSongsData` → `venue.shortId` 参照を `venue.id` に変更
- `venue/page.tsx` → `venue.id` を使ったMap操作。型が変わるだけ

---

## Step 3: `songsSung.ts` — フラットリストからセットリスト構造へ

### 現状

```ts
// 5,192行のフラットリスト
{ id: '1', liveNameId: '1st-live-ready-steady-go', venueId: '1', songId: '44' },
{ id: '2', liveNameId: '1st-live-ready-steady-go', venueId: '1', songId: '65' },
```

### 変更後

```ts
// 会場ごとのセットリスト（推定50件 × 平均20曲 = 1,000行程度）
{
  liveNameId: '1st-live-ready-steady-go',
  venueId: 'rsg-tokyo',
  songIds: ['dreaming-girls', 'melody-flag', 'koiseyootome', ...]
}
```

### 作業内容

- データ構造を `{ liveNameId, venueId, songIds: string[] }` に変更
- セットリストごとの連番 `id` は不要なので廃止
- `liveNameId` も会場から一意に引けるため冗長だが、可読性のために残す
- スプシ側(GAS)の出力を合わせて変更

### 影響箇所と対応

- `utils.ts` の `getResultSongs`:
  - 現在: `songsSung.filter(s => venueIdsSet.has(s.venueId)).map(s => s.songId)`
  - 変更後: `songsSung.filter(s => venueIdsSet.has(s.venueId)).flatMap(s => s.songIds)`
- `utils.ts` の `getSongsData`:
  - 現在: `songsSungMap.set(\`${record.songId}-${record.venueId}\`, true)`
  - 変更後: セットリスト構造からMapを構築するように変更

---

## Step 4: `SongInfo` 型と `columns.tsx` — ハードコードを動的生成へ

### 現状

`SongInfo` 型に全会場の `shortId` を個別プロパティとして列挙（約50個）。
`columns.tsx` にも全会場を個別の `ColumnDef` として列挙。

### 変更後

**`types.ts`**:

```ts
type SongInfo = {
  name: string;
  count: number;
  [venueId: string]: string | number;
};
```

**`columns.tsx`**: `venues` データから動的に列を生成する。

```ts
// 固定列
const fixedColumns: ColumnDef<SongInfo>[] = [
  { accessorKey: 'name', header: '曲名' },
  { accessorKey: 'count', header: '回数' },
];

// 会場列はデータから動的生成
function buildColumns(venues: { id: string; name: string; liveNameId: string }[]): ColumnDef<SongInfo>[] {
  const venueColumns = venues.map((venue) => ({
    accessorKey: venue.id,
    header: venue.name, // ヘッダー表示名の生成ロジックは要検討
  }));
  return [...fixedColumns, ...venueColumns];
}
```

### 作業内容

- `SongInfo` 型をインデックスシグネチャに変更
- `columns.tsx` を動的生成に変更
- `getSongsData` 内の `rawKey as keyof SongInfo` キャストを解消
- テーブルの列ヘッダー表示名（例: 'BC愛知', 'SA神奈1'）の生成ロジックを検討
  - 現在は手動で略称を付けている → `liveNames` の略称をデータに持たせるか、生成ロジックで対応

### 列ヘッダー表示名の課題

現在の `columns.tsx` では以下のように人間が読みやすい略称がついている：

```ts
{ accessorKey: 'bcAichi', header: 'BC愛知' }
{ accessorKey: 'saKanagawa1', header: 'SA神奈1' }
{ accessorKey: 'chomin2024SaitamaDay', header: '町24埼昼' }
```

動的生成にする場合、この略称をどこから生成するかを決める必要がある：

- 案A: `liveNames` に `shortLabel`（例: 'BC', 'SA', '町24'）を追加し、`{shortLabel}{venueName}` で生成
- 案B: `venues` に `headerLabel` を追加してスプシから直接出力

→ **要ユーザー判断**

---

## Step 5: テスト修正

### 作業内容

- 各Stepの変更に合わせてテストを修正
- 特に `getSongsData` と `getResultSongs` のテストで使用しているモックデータをスラッグ形式に更新

---

## 実施順序

```
Step 1: songs.ts スラッグ化
  ↓
Step 2: venues.ts スラッグ化
  ↓
Step 3: songsSung.ts 構造変更
  ↓
Step 4: SongInfo型 + columns.tsx 動的化
  ↓
Step 5: テスト修正（各Step内で随時実施）
```

各Stepは独立してマージ可能だが、Step 3 は Step 1・2 が前提。

## 実施前に確認が必要な事項

1. **既存共有URLの破壊**: `venue_id=21,22,23` → スラッグに変わると既存URLが無効になる。許容するか？
2. **列ヘッダーの略称**: 動的生成時にどこからヘッダー表示名を取るか（案A: liveNamesに追加 / 案B: venuesに追加）
3. **スプシ(GAS)側の修正タイミング**: コード側の構造確定後にGASを合わせるか、並行で進めるか
