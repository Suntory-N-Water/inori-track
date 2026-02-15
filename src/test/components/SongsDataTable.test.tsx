import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SongsDataTable } from '@/components/features/report/SongsDataTable';
import type { SongInfo } from '@/types';

describe('SongsDataTable', () => {
  const mockData: SongInfo[] = [
    {
      name: '夢のつぼみ',
      count: 2,
      'rsg-tokyo': '◯',
      'bc-hyogo': '◯',
    },
    {
      name: 'アイマイモコ',
      count: 0,
      'bc-aichi': '◯',
      'bc-chiba': '◯',
    },
  ];

  it('テーブルと検索用のInputが描画されること', () => {
    render(<SongsDataTable data={mockData} />);
    expect(screen.getByPlaceholderText('夢のつぼみ...')).toBeInTheDocument();
    expect(screen.getByText('曲名')).toBeInTheDocument();
    expect(screen.getByText('回数')).toBeInTheDocument();
  });

  it('データが正しく描画されること', () => {
    render(<SongsDataTable data={mockData} />);
    expect(screen.getByText('夢のつぼみ')).toBeInTheDocument();
    expect(screen.getByText('アイマイモコ')).toBeInTheDocument();
  });

  it('入力した文字列に部分一致する曲名だけが表示されること', async () => {
    render(<SongsDataTable data={mockData} />);
    const input = screen.getByPlaceholderText('夢のつぼみ...');
    await userEvent.type(input, '夢の');
    expect(screen.getByText('夢のつぼみ')).toBeInTheDocument();
    expect(screen.queryByText('アイマイモコ')).toBeNull();
  });

  it('検索結果が0件の場合、"No results. - お探しの曲が見つかりませんでした🤔"が表示されること', async () => {
    render(<SongsDataTable data={mockData} />);
    const input = screen.getByPlaceholderText('夢のつぼみ...');
    await userEvent.type(input, 'NotExistSong');
    expect(screen.getByText(/No results/)).toBeInTheDocument();
  });

  it('countが0より大きい行は背景色が変更されること', () => {
    render(<SongsDataTable data={mockData} />);
    const row1 = screen.getByText('夢のつぼみ').closest('tr');
    const row2 = screen.getByText('アイマイモコ').closest('tr');
    expect(row1).toHaveClass('bg-blue20');
    expect(row2).toHaveClass('bg-white');
  });
});
