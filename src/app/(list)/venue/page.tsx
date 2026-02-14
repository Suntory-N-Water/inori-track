export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import VenueCheckBoxForm from '@/components/features/venue/VenueCheckBoxForm';
import { liveNames, venues } from '@/data';
import type { LiveAndVenuesInfo } from '@/types';

type Props = {
  searchParams?: Promise<{
    live_id: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const liveId = params?.live_id || '';
  // クエリパラメータが設定されていない場合は404ページを表示
  if (!liveId) {
    notFound();
  }

  const lives = liveNames.filter((live) => liveId.includes(live.id));

  // クエリパラメータが設定されているが、該当するライブがない場合は404ページを表示
  if (lives.length === 0) {
    notFound();
  }

  // venues を liveNameId でグルーピング
  const venuesByLiveId = new Map<string, { id: string; name: string }[]>();
  for (const venue of venues) {
    const existing = venuesByLiveId.get(venue.liveNameId) || [];
    existing.push({ id: venue.id, name: venue.name });
    venuesByLiveId.set(venue.liveNameId, existing);
  }

  // 各ライブに対して対応する会場を検索
  const liveDetails: LiveAndVenuesInfo[] = lives.map((live) => ({
    liveName: live.name,
    venues: venuesByLiveId.get(live.id) || [],
  }));

  return (
    <div>
      <h1 className='pb-4 font-bold text-2xl'>参加した会場を選ぼう🏟️✨️</h1>
      <VenueCheckBoxForm params={liveDetails} />
    </div>
  );
}
