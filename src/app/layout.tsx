import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import Footer from './Footer';
import Header from './Header';

export const metadata: Metadata = {
  metadataBase: new URL('https://inori-track.vercel.app/'),
  title: {
    template: '%s - いのなび',
    default: 'いのなび',
  },
  description:
    'いのなびは水瀬いのりさんの曲で、ライブでまだ聴いたことのない曲を見つけることができるサービスです。',
  openGraph: {
    title: 'いのなび',
    description:
      'いのなびは水瀬いのりさんの曲で、ライブでまだ聴いたことのない曲を見つけることができるサービスです。あなたがまだ聴いたことのない曲を見つけて、もっとライブを楽しみましょう',
    images: '/opengraph-image.png?timestamp=20250216',
  },
  twitter: {
    title: 'いのなび',
    description:
      'いのなびは水瀬いのりさんの曲で、ライブでまだ聴いたことのない曲を見つけることができるサービスです。あなたがまだ聴いたことのない曲を見つけて、もっとライブを楽しみましょう',
    card: 'summary_large_image',
    images: '/opengraph-image.png?timestamp=20250216',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja'>
      <body className='flex flex-col min-h-screen bg-background text-foreground'>
        <Header />
        {children}
        <Footer />
      </body>
      <GoogleAnalytics gaId='G-PYJ1PLPMVE' />
    </html>
  );
}
