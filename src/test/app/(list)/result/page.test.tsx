import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResultInfo from '@/components/features/result/ResultInfo';
import { songs } from '@/data';
import { getResultSongs } from '@/lib/utils';

const notFoundMock = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => ({
    push: notFoundMock,
  }),
}));

describe('ResultInfoのテスト', () => {
  const mockUrl = 'http://localhost/result?venue_id=1,2';

  beforeEach(() => {
    notFoundMock.mockClear();
  });

  it('未聴の曲数と総曲数が正しく表示されること', () => {
    const unsungSongs = [
      { id: 'mock-song-1', title: '未聴の曲1' },
      { id: 'mock-song-2', title: '未聴の曲2' },
    ];

    render(<ResultInfo params={unsungSongs} url={mockUrl} />);

    expect(
      screen.getByText(
        `あなたが聴いたことのない曲は${songs.length}曲中、${unsungSongs.length}曲でした！`,
      ),
    ).toBeInTheDocument();
  });

  it('未聴の曲のタイトルがリストで正しく表示されること', () => {
    const unsungSongs = [
      { id: 'mock-song-1', title: '未聴の曲1' },
      { id: 'mock-song-2', title: '未聴の曲2' },
    ];

    render(<ResultInfo params={unsungSongs} url={mockUrl} />);

    for (const song of unsungSongs) {
      expect(screen.getByText(song.title)).toBeInTheDocument();
    }
  });

  it('"結果をX(Twitter)で共有する"ボタンが正しいリンクを持つこと', () => {
    const unsungSongs = [
      { id: 'mock-song-1', title: '未聴の曲1' },
      { id: 'mock-song-2', title: '未聴の曲2' },
    ];

    render(<ResultInfo params={unsungSongs} url={mockUrl} />);

    const tweetText = `あなたが聴いたことのない曲は${songs.length}曲中、${unsungSongs.length}曲でした！\r\n${mockUrl}\r\n#いのなび`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    const linkElement = screen.getByRole('link', {
      name: '結果をX(Twitter)で共有する',
    });
    expect(linkElement).toHaveAttribute('href', tweetUrl);
  });

  it('"最初に戻る"ボタンがホームページにリンクされていること', () => {
    const unsungSongs = [
      { id: 'mock-song-1', title: '未聴の曲1' },
      { id: 'mock-song-2', title: '未聴の曲2' },
    ];

    render(<ResultInfo params={unsungSongs} url={mockUrl} />);

    const linkElement = screen.getByRole('link', { name: '最初に戻る' });
    expect(linkElement).toHaveAttribute('href', '/');
  });

  it('未聴の曲がない場合、"全ての曲をライブで聴きました！おめでとうございます🎉"と表示されること', () => {
    const unsungSongs: { id: string; title: string }[] = [];

    render(<ResultInfo params={unsungSongs} url={mockUrl} />);

    expect(
      screen.getByText('全ての曲をライブで聴きました！おめでとうございます🎉'),
    ).toBeInTheDocument();
  });

  it('結果ページのURLが正しく生成されること', () => {
    const searchParams = { venue_id: '1,2' };
    const unsungSongs = getResultSongs({ searchParams });
    const apiUrl = 'localhost:3000';
    const pathname = '/result';
    const queryString = new URLSearchParams(searchParams).toString();
    const url = `${apiUrl + pathname}?${queryString}`;

    render(<ResultInfo params={unsungSongs} url={url} />);

    expect(
      screen.getByText(
        `あなたが聴いたことのない曲は${songs.length}曲中、${unsungSongs.length}曲でした！`,
      ),
    ).toBeInTheDocument();
  });
});
