'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import CheckBoxList from '@/components/ui/CheckBoxForm';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import type { FormValues, LiveAndVenuesInfo, Venue } from '@/types';

type Props = {
  params: LiveAndVenuesInfo[];
};

export default function VenueCheckBoxForm({ params }: Props) {
  const form = useForm<FormValues<string>>({
    defaultValues: {
      items: [],
    },
  });

  const router = useRouter();

  const handleButtonClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const selectedItems = form.watch('items');
    const queryParams = new URLSearchParams();
    queryParams.append('venue_id', selectedItems.join(','));
    router.push(`/result?${queryParams.toString()}`);
  };

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name='items'
        render={() => (
          <FormItem>
            {params.map((param) => (
              <fieldset key={param.liveName} aria-label={param.liveName}>
                <div key={param.liveName}>
                  <div className='mt-4 mb-2'>
                    <FormLabel className='font-bold text-xl'>
                      {param.liveName}
                    </FormLabel>
                  </div>
                  <CheckBoxList<Venue>
                    form={form}
                    name='items'
                    items={param.venues}
                    itemKey={(item) => item.id}
                    itemLabel={(item) => item.name}
                  />
                </div>
              </fieldset>
            ))}
          </FormItem>
        )}
      />
      <Button
        variant='default'
        className='w-full items-center justify-center p-6 mt-6 mb-2 tracking-tight'
        disabled={form.watch('items').length === 0}
        onClick={handleButtonClick}
      >
        結果を見る
      </Button>
      <Link href='/live'>
        <Button
          variant='secondary'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          ライブを選び直す
        </Button>
      </Link>
      <Link href='/'>
        <Button
          variant='outline'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          最初に戻る
        </Button>
      </Link>
    </Form>
  );
}
