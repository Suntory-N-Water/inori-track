import { Eye, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Confetti from '@/components/ui/confetti';
import FadeIn from '@/components/ui/FadeIn';
import { songs } from '@/data';

type Props = {
  params: {
    id: string;
    title: string;
  }[];
  url: string;
};

/** 結果表示コンポーネント */
export default function ResultInfo({ params, url }: Props) {
  const tweetText =
    params.length === 0
      ? `全ての曲をライブで聴きました！\r\n${url}\r\n#いのなび`
      : `あなたが聴いたことのない曲は${songs.length}曲中、${params.length}曲でした！\r\n${url}\r\n#いのなび`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const queryParams = new URL(url).search;

  return (
    <div>
      <FadeIn>
        <div className='rounded-2xl bg-section-bg p-6 mt-4 mb-4'>
          <h2 className='font-bold text-xl text-heading'>
            {params.length === 0
              ? '全ての曲をライブで聴きました！おめでとうございます'
              : `あなたが聴いたことのない曲は${songs.length}曲中、${params.length}曲でした！`}
          </h2>
        </div>
      </FadeIn>
      <FadeIn>
        <ul className='list-disc list-outside ml-6'>
          {params.map((param) => (
            <li key={param.id} className='mt-1 marker:text-primary'>
              {param.title}
            </li>
          ))}
        </ul>
      </FadeIn>
      <div className='mt-6 space-y-3'>
        <p className='pt-2 pb-2'>
          次のページで、あなたがライブで聴いたことのある曲の一覧も確認することができます
        </p>
        <Link href={`report/${queryParams}`}>
          <Button
            variant='default'
            className='w-full items-center justify-center gap-2 p-6 my-2 tracking-tight hover:scale-[1.02]'
          >
            <Eye className='h-5 w-5' aria-hidden='true' />
            曲の一覧を見る
          </Button>
        </Link>
        <a href={tweetUrl} target='_blank' rel='noreferrer'>
          <Button
            variant='outline'
            className='w-full items-center justify-center gap-2 p-6 my-2 tracking-tight'
          >
            <Share2 className='h-5 w-5' aria-hidden='true' />
            結果をX(Twitter)で共有する
          </Button>
        </a>
        <Link href='/'>
          <Button
            variant='secondary'
            className='w-full items-center justify-center p-6 my-2 tracking-tight'
          >
            最初に戻る
          </Button>
        </Link>
        {params.length === 0 && <Confetti />}
      </div>
    </div>
  );
}
