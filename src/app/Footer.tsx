export default function Footer() {
  return (
    <footer className='border-t border-border bg-section-bg text-sm md:h-24 flex-shrink-0'>
      <div className='mx-auto max-w-[1024px] flex h-full flex-col justify-center gap-4 p-4 text-center'>
        <p className='text-foreground/60'>
          &copy; {new Date().getFullYear()} - Copyright スイ, All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
}
