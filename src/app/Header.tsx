import Link from 'next/link';

export default function Header() {
  return (
    <header className='border-b'>
      <div className='mx-auto w-full px-4 max-w-[768px] py-4 flex items-center'>
        <Link
          href='/'
          className='flex items-center space-x-2 duration-300 hover:-translate-y-0.5'
          aria-label='最初の画面に戻る'
        >
          <h1 className='text-2xl font-bold text-primary-foreground'>
            いのなび
          </h1>
        </Link>
      </div>
    </header>
  );
}
