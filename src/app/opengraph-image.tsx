import { ImageResponse } from 'next/og';
import { OG_COLORS, OG_GRADIENT } from '@/lib/og-theme';

export const alt = 'いのなび';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** ルートページ用のOGP画像を生成する */
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        background: OG_GRADIENT,
        width: '100%',
        height: '100%',
        display: 'flex',
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
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '32px',
          width: '100%',
        }}
      >
        <p
          style={{
            fontSize: '96px',
            fontWeight: 'bold',
            margin: '0 0 24px 0',
          }}
        >
          いのなび
        </p>
        <p
          style={{
            fontSize: '36px',
            margin: 0,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {'水瀬いのりさんのライブで\nまだ聴いたことのない曲を見つけよう'}
        </p>
      </div>
    </div>,
    { ...size },
  );
}
