/**
 * OGP画像で使用する春テーマのカラーパレット
 * globals.css の HSL値から変換した HEX値（ImageResponseはCSS変数を使えないため）
 */
export const OG_COLORS = {
  primary: '#f4adcf',
  secondary: '#b8b9de',
  accent: '#92cadf',
  foreground: '#493628',
  white: '#ffffff',
} as const;

/** OGP画像の背景グラデーション */
export const OG_GRADIENT =
  'linear-gradient(135deg, #f4adcf 0%, #b8b9de 50%, #92cadf 100%)';
