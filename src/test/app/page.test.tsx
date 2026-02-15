import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import Home from '@/app/(list)/page';
import { liveNames } from '@/data';
import { SELECTION_STORAGE_KEY } from '@/lib/storage';

describe('page tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('ページがレンダリングされる', () => {
    render(<Home />);

    // ボタンのテキストをチェック
    expect(screen.getByText('今すぐ始める')).toBeInTheDocument();
  });

  it('対象のライブ一覧が表示される', () => {
    render(<Home />);

    // ライブ名が表示される
    for (const liveName of liveNames) {
      expect(screen.getByText(liveName.name)).toBeInTheDocument();
    }
  });

  it('マウント時にsessionStorageの選択状態がクリアされること', () => {
    sessionStorage.setItem(
      SELECTION_STORAGE_KEY,
      JSON.stringify({ liveIds: ['live-a'], venueIds: ['venue-a1'] }),
    );

    render(<Home />);

    expect(sessionStorage.getItem(SELECTION_STORAGE_KEY)).toBeNull();
  });
});
