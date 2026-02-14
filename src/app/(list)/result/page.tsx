export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ResultInfo from '@/components/features/result/ResultInfo';
import { songs } from '@/data';
import { getResultSongs } from '@/lib/utils';

type Props = {
  searchParams?: Promise<{
    venue_id?: string;
  }>;
};

async function currentUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host');
  if (!host) {
    throw new Error('host is not defined');
  }
  const prefix = process.env.HTTP_PREFIX;
  if (!prefix) {
    throw new Error('HTTP_PREFIX is not set');
  }
  return prefix + host;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const unsungSongs = getResultSongs({ searchParams: params });
  const apiUrl = await currentUrl();
  return {
    openGraph: {
      url: apiUrl,
      type: 'article',
      images: {
        // 作ったAPIのURLを指定
        url: `${apiUrl}/api/og?count=${unsungSongs.length}`,
        width: 1200,
        height: 630,
      },
    },
    twitter: {
      description:
        'いのなびは水瀬いのりさんの曲で、ライブでまだ聴いたことのない曲を見つけることができるサービスです。',
      card: 'summary_large_image',
      images: {
        // 作ったAPIのURLを指定
        url: `${apiUrl}/api/og?count=${unsungSongs.length}`,
        width: 1200,
        height: 630,
      },
    },
  };
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const unsungSongs = getResultSongs({ searchParams: params });
  // クエリパラメータが設定されているが、該当するライブがない場合は404ページを表示
  if (unsungSongs.length === songs.length) {
    notFound();
  }

  const pathname = '/result';
  const queryString = new URLSearchParams(params).toString();
  const apiUrl = await currentUrl();
  const url = `${apiUrl + pathname}?${queryString}`;

  return (
    <div>
      {unsungSongs.length === 0 ? (
        ''
      ) : (
        <h1 className='pb-4 font-bold text-2xl'>
          ライブで聴いたことのない曲一覧♪✨️
        </h1>
      )}
      <ResultInfo params={unsungSongs} url={url} />
    </div>
  );
}
