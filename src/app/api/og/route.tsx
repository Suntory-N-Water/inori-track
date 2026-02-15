import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { songs } from '@/data';
import { OG_COLORS, OG_GRADIENT } from '@/lib/og-theme';

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

/** 結果ページ用の動的OGP画像コンポーネント */
const OgImage = ({ count }: OgImageProps) => (
  <div
    style={{
      position: 'relative',
      fontSize: 128,
      background: OG_GRADIENT,
      width: '100%',
      height: '100%',
      display: 'flex',
      textAlign: 'left',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
      padding: '32px',
      fontFamily: "'Noto Sans JP', sans-serif",
      color: OG_COLORS.foreground,
    }}
  >
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        top: '32px',
        left: '32px',
        right: '32px',
        bottom: '32px',
        backgroundColor: OG_COLORS.white,
        borderRadius: '16px',
        zIndex: 0,
      }}
    />

    <div
      style={{
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        width: '100%',
      }}
    >
      <p
        style={{
          margin: 32,
          fontSize: '64px',
          wordBreak: 'keep-all',
          whiteSpace: 'pre-wrap',
          width: '92%',
        }}
      >
        {count === '0'
          ? '全ての曲をライブで聴きました！おめでとうございます🎉'
          : `あなたがまだ聴いたことのない曲は${songs.length}曲中、${count}曲でした！`}
      </p>
    </div>
    <div
      style={{
        position: 'absolute',
        bottom: '48px',
        right: '48px',
        zIndex: 1,
        fontSize: '32px',
        color: OG_COLORS.foreground,
      }}
    >
      ＃いのなび
    </div>
  </div>
);

/** 結果ページ用のOGP画像を生成するAPIエンドポイント */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = Object.fromEntries(searchParams.entries());

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

    return new ImageResponse(<OgImage count={String(count)} />);
  } catch (e) {
    return new Response(`エラーが発生しました。${e}`, { status: 500 });
  }
}
