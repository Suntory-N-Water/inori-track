import SelectWizard from '@/components/features/select/SelectWizard';
import { liveNames, venues } from '@/data';

/** ライブと会場の統合選択ページ */
export default function SelectPage() {
  return (
    <div>
      <h1 className='pb-4 font-bold text-2xl text-heading'>
        参加したライブと会場を選ぼう
      </h1>
      <SelectWizard liveNames={liveNames} venues={venues} />
    </div>
  );
}
