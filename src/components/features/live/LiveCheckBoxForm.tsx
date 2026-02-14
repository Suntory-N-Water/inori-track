'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import CheckBoxList from '@/components/ui/CheckBoxForm';
import { Form, FormItem, FormLabel } from '@/components/ui/form';
import Popup from '@/components/ui/popup';
import type { FormValues, LiveName } from '@/types';

type Props = {
  params: LiveName[];
};

export default function LiveCheckBoxForm({ params }: Props) {
  const [isAlertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);

  const router = useRouter();

  const form = useForm<FormValues<string>>({
    defaultValues: {
      items: [],
    },
  });

  // 環境変数からネタバレ対象のライブIDを取得
  const spoilerVenueId = process.env.NEXT_PUBLIC_SPOILER_VENUE_ID;

  // ネタバレ対象のライブ情報を取得
  const spoilerVenue = spoilerVenueId
    ? params.find((param) => param.id === spoilerVenueId)
    : undefined;

  function handleButtonClick(e: React.SyntheticEvent) {
    e.preventDefault();
    const selectedItems = form.watch('items');
    // ネタバレ防止対象のライブが選択されているかチェック
    const hasAlertLive =
      spoilerVenueId && selectedItems.includes(spoilerVenueId);

    if (hasAlertLive) {
      // ネタバレ防止対象のライブが選択されていた場合、Popup を表示
      setAlertDialogOpen(true);
    } else {
      // 選択されていない場合は通常の処理を実行
      proceedWithNavigation(selectedItems);
    }
  }

  // 選択されたアイテムでナビゲーションを実行する関数
  function proceedWithNavigation(selectedItems: string[]) {
    const queryParams = new URLSearchParams();
    queryParams.append('live_id', selectedItems.join(','));
    router.push(`/venue?${queryParams.toString()}`);
  }

  // 'はい' ボタンがクリックされた時に実行する関数
  //  画面遷移する
  function confirmAcousticLive() {
    const selectedItems = form.watch('items');
    proceedWithNavigation(selectedItems);
    setAlertDialogOpen(false);
  }

  // 'いいえ' ボタンがクリックされた時に実行する関数
  // POPUPを非表示にする
  function cancelAcousticLive() {
    setAlertDialogOpen(false);
  }

  const inoriMinaseLives = params.filter(
    (param) => param.liveType === '水瀬いのり個人名義',
  );
  const townMeetingLives = params.filter(
    (param) => param.liveType === '町民集会',
  );

  return (
    <Form {...form}>
      <FormItem>
        <div className='mt-4 mb-2'>
          <FormLabel className='font-bold text-xl'>
            水瀬いのり個人名義
          </FormLabel>
        </div>
        <CheckBoxList<LiveName>
          form={form}
          name='items'
          items={inoriMinaseLives}
          itemKey={(item) => item.id}
          itemLabel={(item) => item.name}
        />
        <div className='mt-4 mb-2'>
          <FormLabel className='font-bold text-xl'>町民集会</FormLabel>
        </div>
        <CheckBoxList<LiveName>
          form={form}
          name='items'
          items={townMeetingLives}
          itemKey={(item) => item.id}
          itemLabel={(item) => item.name}
        />
      </FormItem>
      <Button
        variant='default'
        className='w-full items-center justify-center p-6 mt-6 mb-2 tracking-tight'
        disabled={form.watch('items').length === 0}
        onClick={handleButtonClick}
      >
        会場を選択する
      </Button>
      <Link href='/'>
        <Button
          variant='secondary'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          最初に戻る
        </Button>
      </Link>
      <Popup
        isOpen={isAlertDialogOpen}
        onClose={cancelAcousticLive}
        description={
          spoilerVenue
            ? `${spoilerVenue.name}のネタバレが含まれますが、よろしいですか？`
            : 'ネタバレが含まれますが、よろしいですか？'
        }
        okText='会場を選択する'
        cancelText='選び直す'
        onConfirm={confirmAcousticLive}
        onCancel={cancelAcousticLive}
      />
    </Form>
  );
}
