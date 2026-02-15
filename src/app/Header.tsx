import Link from 'next/link';

export default function Header() {
  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm'>
      <div className='mx-auto w-full px-4 max-w-[768px] py-4 flex items-center'>
        <Link
          href='/'
          className='flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5'
          aria-label='最初の画面に戻る'
        >
          <h1 className='text-2xl font-bold text-heading hover:text-primary transition-colors duration-300'>
            いのなび
          </h1>
        </Link>
      </div>
    </header>
  );
}
