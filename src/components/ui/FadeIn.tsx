'use client';

import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/** スクロール連動フェードインラッパーコンポーネント */
export default function FadeIn({ children, className, delay = 0 }: Props) {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-600 ease-out',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className,
      )}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
