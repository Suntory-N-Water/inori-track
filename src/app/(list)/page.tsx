import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { liveNames } from '@/data';

export default function Home() {
  return (
    <div className='relative min-h-screen flex flex-col'>
      <div className='flex flex-col flex-1'>
        <div className='flex flex-col'>
          <p className='py-2'>
            いのなびは水瀬いのりさんのライブで、まだ聴いたことのない曲を見つけることできるサービスです
          </p>
          <p className='py-2'>
            今すぐ始めるを押したあと、自分が参加したライブ名と会場名を選ぶことで、まだ聴いたことのない曲を一覧で表示することができます。
          </p>
          <Link href='/live'>
            <Button className='w-full items-center justify-center p-6 my-4 tracking-tight'>
              今すぐ始める！
            </Button>
          </Link>
        </div>
        <div className='w-full bg-white rounded-t-3xl flex-1'>
          <h1 className='text-xl md:text-2xl font-bold text-primary-foreground'>
            よくある質問
          </h1>
          <div className='py-2'>
            <strong>Q. ネタバレは含みますか？</strong>
            <p className='py-1'>
              A.
              一部会場(ライブツアー期間中)であれば、ネタバレを含む場合がございますが、必ず確認メッセージが表示されます。
            </p>
          </div>
          <div className='py-2'>
            <strong>Q. 対象のライブを教えてください。</strong>
            <p className='py-1'>
              現在(2025年10月12日時点)は以下のライブ、町民集会が対象になっております。
            </p>
            <ul className='list-disc list-outside ml-6'>
              {liveNames.map((liveName) => (
                <li key={liveName.id} className='py-2 marker:text-primary'>
                  {liveName.name}
                </li>
              ))}
            </ul>
          </div>
          <div className='py-4'>
            <Link href='/contact'>
              <p className='text-primary-foreground hover:underline'>
                お問い合わせはこちらからどうぞ。ご質問やご意見をお待ちしております。
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
