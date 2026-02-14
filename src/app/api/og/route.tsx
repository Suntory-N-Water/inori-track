import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { songs } from '@/data';

export const runtime = 'edge';

type OgImageProps = {
  count: string;
};

const querySchema = z.object({
  count: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => !Number.isNaN(val), { message: 'Count must be a number' })
    .refine((val) => val >= 0 && val < songs.length, {
      message: 'Count out of range',
    }),
});

const OgImage = ({ count }: OgImageProps) => (
  <div
    style={{
      position: 'relative',
      fontSize: 128,
      background: 'linear-gradient(to bottom right, #9BD4FF, #FFFA9B)', // 背景グラデーション
      width: '100%',
      height: '100%',
      display: 'flex',
      textAlign: 'left',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px', // 角を丸く
      padding: '32px', // 外枠の余白
      fontFamily: "'Noto Sans JP', sans-serif", // フォントファミリー
      color: '#333333', // テキストの色
    }}
  >
    {/* 背景の白いボックス */}
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        top: '32px',
        left: '32px',
        right: '32px',
        bottom: '32px',
        backgroundColor: 'white',
        borderRadius: '16px', // 背景ボックスの角を丸く
        zIndex: 0, // テキストの下に配置
      }}
    />

    {/* 中央のテキスト */}
    <div
      style={{
        display: 'flex',
        position: 'relative',
        zIndex: 1, // テキストを前面に
        width: '100%',
      }}
    >
      <p
        style={{
          margin: 32,
          fontSize: '64px',
          wordBreak: 'keep-all', // 日本語の改行防止
          whiteSpace: 'pre-wrap', // 不要な改行を防止し、長い文を整形
          width: '92%', // テキストコンテナの幅を指定
        }}
      >
        {count === '0'
          ? '全ての曲をライブで聴きました！おめでとうございます🎉'
          : `あなたがまだ聴いたことのない曲は${count}曲でした！`}
      </p>
    </div>
    {/* 右下の#いのなびテキスト */}
    <div
      style={{
        position: 'absolute',
        bottom: '48px',
        right: '48px',
        zIndex: 1, // 前面に
        fontSize: '32px', // テキストサイズ
        color: '#333333',
      }}
    >
      ＃いのなび
    </div>
  </div>
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータをオブジェクトに変換
    const queryParams = Object.fromEntries(searchParams.entries());

    // Zodでバリデーション
    const parseResult = querySchema.safeParse(queryParams);

    if (!parseResult.success) {
      return new Response(
        `入力値が不正です。設定値：${searchParams.get('count')}`,
        {
          status: 400,
        },
      );
    }

    const { count } = parseResult.data;

    return new ImageResponse(<OgImage count={String(count) ?? ''} />);
  } catch (e) {
    return new Response(`エラーが発生しました。${e}`, { status: 500 });
  }
}
