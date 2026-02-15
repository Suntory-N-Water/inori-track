import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SongsDataTable } from '@/components/features/report/SongsDataTable';
import { Button } from '@/components/ui/button';
import { getSongsData } from '@/lib/utils';
import { encodeVenueIds, resolveVenueIdsFromParams } from '@/lib/venueEncoding';

type Props = {
  searchParams?: Promise<{
    v?: string;
    venue_id?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const venueIdsCsv = resolveVenueIdsFromParams(params ?? {});
  if (!venueIdsCsv) {
    notFound();
  }

  const data = getSongsData(params ?? {});

  return (
    <div className='relative min-h-screen flex flex-col'>
      <div className='flex flex-col flex-1'>
        <div className='flex flex-col'>
          <h1 className='text-xl md:text-2xl font-bold text-heading flex items-center gap-2'>
            <ClipboardList
              className='h-6 w-6 text-primary'
              aria-hidden='true'
            />
            ライブで聴いたことのある曲一覧
          </h1>
          <p className='py-2'>
            あなたが参加したライブで、聴いたことのある曲の一覧と回数を確認できます。
          </p>
          <SongsDataTable data={data} />
        </div>
      </div>
      <div className='py-2'>
        <Link href={`result?v=${encodeVenueIds(venueIdsCsv.split(','))}`}>
          <Button
            variant='default'
            className='w-full items-center justify-center p-6 my-2 tracking-tight'
          >
            前の画面に戻る
          </Button>
        </Link>
        <Link href='/'>
          <Button
            variant='secondary'
            className='w-full items-center justify-center p-6 my-2 tracking-tight'
          >
            最初に戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
