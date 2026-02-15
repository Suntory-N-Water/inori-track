'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import CheckBoxList from '@/components/ui/CheckBoxForm';
import { Form, FormItem, FormLabel } from '@/components/ui/form';
import Popup from '@/components/ui/popup';
import { encodeVenueIds } from '@/lib/venueEncoding';
import type { FormValues, LiveName, Venue } from '@/types';

type VenueWithLiveNameId = Venue & { liveNameId: string };

type Props = {
  liveNames: readonly LiveName[];
  venues: readonly VenueWithLiveNameId[];
};

const STORAGE_KEY = 'inori-track-selection';

type StoredSelection = {
  liveIds: string[];
  venueIds: string[];
};

/** ライブ選択と会場選択を1ページで行う統合ウィザード */
export default function SelectWizard({ liveNames, venues }: Props) {
  const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);
  const router = useRouter();

  const liveForm = useForm<FormValues<string>>({
    defaultValues: { items: [] },
  });

  const venueForm = useForm<FormValues<string>>({
    defaultValues: { items: [] },
  });

  const selectedLiveIds = liveForm.watch('items');
  const selectedVenueIds = venueForm.watch('items');

  // sessionStorage から選択状態を復元
  const isRestoredRef = useRef(false);
  useEffect(() => {
    if (isRestoredRef.current) {
      return;
    }
    isRestoredRef.current = true;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: StoredSelection = JSON.parse(stored);
      liveForm.setValue('items', parsed.liveIds);
      venueForm.setValue('items', parsed.venueIds);
    }
  }, [liveForm, venueForm]);

  // ライブの選択が解除されたとき、対応する会場IDを venueForm から除外
  const prevLiveIdsRef = useRef<string[]>([]);
  useEffect(() => {
    const prev = prevLiveIdsRef.current;
    const removedLiveIds = prev.filter((id) => !selectedLiveIds.includes(id));
    if (removedLiveIds.length > 0) {
      const removedVenueIds = new Set(
        venues
          .filter((v) => removedLiveIds.includes(v.liveNameId))
          .map((v) => v.id),
      );
      const currentVenues = venueForm.getValues('items');
      const filtered = currentVenues.filter((id) => !removedVenueIds.has(id));
      if (filtered.length !== currentVenues.length) {
        venueForm.setValue('items', filtered);
      }
    }
    prevLiveIdsRef.current = selectedLiveIds;
  }, [selectedLiveIds, venues, venueForm]);

  const spoilerVenueId = process.env.NEXT_PUBLIC_SPOILER_VENUE_ID;
  const spoilerLive = spoilerVenueId
    ? liveNames.find((live) => live.id === spoilerVenueId)
    : undefined;

  const selectedLivesWithVenues = liveNames
    .filter((live) => selectedLiveIds.includes(live.id))
    .map((live) => ({
      liveName: live.name,
      liveId: live.id,
      venues: venues
        .filter((venue) => venue.liveNameId === live.id)
        .map((venue) => ({ id: venue.id, name: venue.name })),
    }));

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const hasSpoiler =
      spoilerVenueId && selectedLiveIds.includes(spoilerVenueId);

    if (hasSpoiler) {
      setAlertDialogOpen(true);
    } else {
      proceedToResult();
    }
  }

  function proceedToResult() {
    const selection: StoredSelection = {
      liveIds: selectedLiveIds,
      venueIds: selectedVenueIds,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));

    const encoded = encodeVenueIds(selectedVenueIds);
    router.push(`/result?v=${encoded}`);
  }

  function confirmSpoiler() {
    proceedToResult();
    setAlertDialogOpen(false);
  }

  function cancelSpoiler() {
    setAlertDialogOpen(false);
  }

  const inoriMinaseLives = liveNames.filter(
    (live) => live.liveType === '水瀬いのり個人名義',
  );
  const townMeetingLives = liveNames.filter(
    (live) => live.liveType === '町民集会',
  );

  const hasSelectedVenues = selectedVenueIds.length > 0;

  return (
    <div>
      <Form {...liveForm}>
        <FormItem>
          <div className='mt-4 mb-2'>
            <FormLabel className='font-bold text-xl'>
              水瀬いのり個人名義
            </FormLabel>
          </div>
          <CheckBoxList<LiveName>
            form={liveForm}
            name='items'
            items={inoriMinaseLives}
            itemKey={(item) => item.id}
            itemLabel={(item) => item.name}
          />
          <div className='mt-4 mb-2'>
            <FormLabel className='font-bold text-xl'>町民集会</FormLabel>
          </div>
          <CheckBoxList<LiveName>
            form={liveForm}
            name='items'
            items={townMeetingLives}
            itemKey={(item) => item.id}
            itemLabel={(item) => item.name}
          />
        </FormItem>
      </Form>

      {selectedLivesWithVenues.length > 0 && (
        <div className='mt-8 border-t pt-6'>
          <h2 className='pb-4 font-bold text-xl'>参加した会場を選ぼう</h2>
          <Form {...venueForm}>
            {selectedLivesWithVenues.map((liveInfo) => (
              <fieldset key={liveInfo.liveId} aria-label={liveInfo.liveName}>
                <div className='mt-4 mb-2'>
                  <FormLabel className='font-bold text-lg'>
                    {liveInfo.liveName}
                  </FormLabel>
                </div>
                <CheckBoxList<Venue>
                  form={venueForm}
                  name='items'
                  items={liveInfo.venues}
                  itemKey={(item) => item.id}
                  itemLabel={(item) => item.name}
                />
              </fieldset>
            ))}
          </Form>
        </div>
      )}

      <div className='mt-6'>
        <Button
          variant='default'
          className='w-full items-center justify-center p-6 mt-6 mb-2 tracking-tight'
          disabled={!hasSelectedVenues}
          onClick={handleSubmit}
        >
          結果を見る
        </Button>
        <Link href='/'>
          <Button
            variant='secondary'
            className='w-full items-center justify-center p-6 my-2 tracking-tight'
          >
            最初に戻る
          </Button>
        </Link>
      </div>

      <Popup
        isOpen={isAlertDialogOpen}
        onClose={cancelSpoiler}
        description={
          spoilerLive
            ? `${spoilerLive.name}のネタバレが含まれますが、よろしいですか？`
            : 'ネタバレが含まれますが、よろしいですか？'
        }
        okText='結果を見る'
        cancelText='選び直す'
        onConfirm={confirmSpoiler}
        onCancel={cancelSpoiler}
      />
    </div>
  );
}
