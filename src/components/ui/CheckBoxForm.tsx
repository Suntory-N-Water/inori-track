import type { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';

type FormValues = {
  items: string[];
};

type CheckBoxListProps<TItem> = {
  form: UseFormReturn<FormValues>;
  name: 'items';
  items: TItem[];
  itemKey: (item: TItem) => string;
  itemLabel: (item: TItem) => string;
};

export default function CheckBoxList<TItem>({
  form,
  name,
  items,
  itemKey,
  itemLabel,
}: CheckBoxListProps<TItem>) {
  return (
    <>
      {items.map((item) => (
        <FormField
          key={itemKey(item)}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem
              key={itemKey(item)}
              className='space-x-3 py-2 px-3 rounded-xl hover:bg-section-bg/50 transition-colors duration-200 cursor-pointer'
            >
              <FormControl>
                <Checkbox
                  checked={field.value?.includes(itemKey(item))}
                  onCheckedChange={(checked) =>
                    checked
                      ? field.onChange([...field.value, itemKey(item)])
                      : field.onChange(
                          field.value?.filter(
                            (value) => value !== itemKey(item),
                          ),
                        )
                  }
                />
              </FormControl>
              <FormLabel>{itemLabel(item)}</FormLabel>
            </FormItem>
          )}
        />
      ))}
    </>
  );
}
