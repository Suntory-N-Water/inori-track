import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '参加したライブと会場を選ぶ',
};

type Props = {
  children: React.ReactNode;
};

export default function SelectLayout({ children }: Props) {
  return <>{children}</>;
}
