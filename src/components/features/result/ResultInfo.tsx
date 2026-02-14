import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Confetti from '@/components/ui/confetti';
import { songs } from '@/data';

type Props = {
  params: {
    id: string;
    title: string;
  }[];
  url: string;
};

export default function ResultInfo({ params, url }: Props) {
  const tweetText =
    params.length === 0
      ? `全ての曲をライブで聴きました！🎉\r\n${url}\r\n#いのなび`
      : `あなたが聴いたことのない曲は${songs.length}曲中、${params.length}曲でした！\r\n${url}\r\n#いのなび`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const queryParams = new URL(url).search;

  return (
    <div>
      <div className='mt-4 mb-2'>
        <h2 className='font-bold text-xl'>
          {params.length === 0
            ? '全ての曲をライブで聴きました！おめでとうございます🎉'
            : `あなたが聴いたことのない曲は${songs.length}曲中、${params.length}曲でした！`}
        </h2>
      </div>
      {params.map((param) => (
        <ul key={param.id} className='list-disc list-outside mt-1 ml-6'>
          <li className='marker:text-primary'>{param.title}</li>
        </ul>
      ))}
      <div>
        <p className='pt-4 pb-2'>
          次のページで、あなたがライブで聴いたことのある曲の一覧も確認することができます✨️
        </p>
        <Link href={`report/${queryParams}`}>
          <Button
            variant='default'
            className='w-full items-center justify-center p-6 my-2 tracking-tight'
          >
            曲の一覧を見る👀
          </Button>
        </Link>
        <a href={tweetUrl} target='_blank' rel='noreferrer'>
          <Button
            variant='outline'
            className='w-full items-center justify-center p-6 my-2 tracking-tight border-primary border-2'
          >
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
