import Link from 'next/link';
import ClearSelection from '@/components/features/home/ClearSelection';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/ui/FadeIn';
import { liveNames } from '@/data';

export default function Home() {
  return (
    <div className='relative min-h-screen flex flex-col gap-8'>
      <ClearSelection />
      <FadeIn>
        <div className='rounded-2xl bg-white/80 p-6 shadow-sm'>
          <p className='py-2'>
            いのなびは水瀬いのりさんのライブで、まだ聴いたことのない曲を見つけることできるサービスです
          </p>
          <p className='py-2'>
            今すぐ始めるを押したあと、自分が参加したライブ名と会場名を選ぶことで、まだ聴いたことのない曲を一覧で表示することができます。
          </p>
          <Link href='/select'>
            <Button className='w-full items-center justify-center p-6 my-4 tracking-tight hover:scale-[1.02]'>
              今すぐ始める
            </Button>
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className='w-full rounded-2xl bg-section-bg p-6'>
          <h2 className='text-xl md:text-2xl font-bold text-heading'>
            よくある質問
          </h2>
          <div className='py-3 border-b border-border/50'>
            <strong>Q. ネタバレは含みますか？</strong>
            <p className='py-1'>
              A.
              一部会場(ライブツアー期間中)であれば、ネタバレを含む場合がございますが、必ず確認メッセージが表示されます。
            </p>
          </div>
          <div className='py-3'>
            <strong>Q. 対象のライブを教えてください。</strong>
            <p className='py-1'>
              現在(2026年2月15日時点)は以下のライブ、町民集会が対象です。
            </p>
            <ul className='list-disc list-outside ml-6'>
              {liveNames.map((liveName) => (
                <li key={liveName.id} className='py-2 marker:text-primary'>
                  {liveName.name}
                </li>
              ))}
            </ul>
          </div>
          <div className='pt-4'>
            <Link href='/contact'>
              <p className='text-heading hover:text-primary hover:underline transition-colors duration-300'>
                お問い合わせはこちらからどうぞ。ご質問やご意見をお待ちしております。
              </p>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
