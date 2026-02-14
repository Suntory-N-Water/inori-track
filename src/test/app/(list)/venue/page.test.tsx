import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VenueCheckBoxForm from '@/components/features/venue/VenueCheckBoxForm';
import type { LiveAndVenuesInfo } from '@/types';

// モック関数を作成
const pushMock = vi.fn();

// next/navigationのuseRouterをモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('LiveCheckBoxFormのテスト', () => {
  const params: LiveAndVenuesInfo[] = [
    {
      liveName: 'LIVE TOUR 2018 BLUE COMPASS',
      venues: [
        { id: '2', name: '愛知1' },
        { id: '3', name: '石川' },
        { id: '4', name: '兵庫' },
        { id: '5', name: '千葉' },
      ],
    },
    {
      liveName: 'LIVE TOUR 2019 Catch the Rainbow!',
      venues: [
        { id: '6', name: '大阪' },
        { id: '7', name: '愛知2' },
        { id: '8', name: '東京1日目' },
        { id: '9', name: '東京2日目' },
      ],
    },
  ];

  beforeEach(() => {
    // テストごとにモックをリセット
    pushMock.mockClear();
  });

  it('フォームが正しく初期化されること', () => {
    render(<VenueCheckBoxForm params={params} />);

    // ライブ名が表示されていることを確認
    expect(screen.getByText('LIVE TOUR 2018 BLUE COMPASS')).toBeInTheDocument();
    expect(
      screen.getByText('LIVE TOUR 2019 Catch the Rainbow!'),
    ).toBeInTheDocument();

    // 会場が表示されていることを確認
    for (const liveInfo of params) {
      for (const venue of liveInfo.venues) {
        expect(screen.getByLabelText(venue.name)).toBeInTheDocument();
      }
    }

    // すべてのチェックボックスが未選択であることを確認
    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked();
    }
  });

  it('チェックボックスを選択するとフォームの値が更新されること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const checkbox = screen.getByLabelText('愛知1');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('チェックボックスを解除するとフォームの値から削除されること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const checkbox = screen.getByLabelText('愛知1');

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('チェックボックスを複数選択できること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const checkbox1 = screen.getByLabelText('愛知1');
    const checkbox2 = screen.getByLabelText('大阪');

    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);

    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked();
  });

  it('チェックボックスが選択されていない場合、"結果を見る"ボタンが無効化されていること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const button = screen.getByRole('button', { name: '結果を見る' });
    expect(button).toBeDisabled();
  });

  it('チェックボックスが選択されている場合、"結果を見る"ボタンが有効化されていること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const checkbox = screen.getByLabelText('愛知1');
    const button = screen.getByRole('button', { name: '結果を見る' });

    fireEvent.click(checkbox);
    expect(button).toBeEnabled();
  });

  it('"結果を見る"ボタンをクリックすると、選択された会場IDがクエリパラメータに含まれて/resultページに遷移すること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const checkbox1 = screen.getByLabelText('石川');
    const checkbox2 = screen.getByLabelText('大阪');

    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);

    const button = screen.getByRole('button', { name: '結果を見る' });
    fireEvent.click(button);

    const query = `/result?venue_id=${encodeURIComponent('3,6')}`;

    expect(pushMock).toHaveBeenCalledWith(query);
  });

  it('"ライブを選び直す"ボタンをクリックすると、/liveページに遷移すること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const link = screen.getByRole('link', { name: 'ライブを選び直す' });
    expect(link).toHaveAttribute('href', '/live');
  });

  it('"最初に戻る"ボタンをクリックすると、ホームページに遷移すること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const link = screen.getByRole('link', { name: '最初に戻る' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('ライブ名ごとに会場が正しく表示されていること', () => {
    render(<VenueCheckBoxForm params={params} />);

    for (const liveInfo of params) {
      // ライブセクションを取得
      const liveSection = screen.getByRole('group', {
        name: liveInfo.liveName,
      });

      for (const venue of liveInfo.venues) {
        expect(
          within(liveSection).getByLabelText(venue.name),
        ).toBeInTheDocument();
      }
    }
  });

  it('チェックボックスのラベルが正しく表示されていること', () => {
    render(<VenueCheckBoxForm params={params} />);

    for (const liveInfo of params) {
      for (const venue of liveInfo.venues) {
        expect(screen.getByLabelText(venue.name)).toBeInTheDocument();
      }
    }
  });

  it('フォームの初期状態で、すべてのチェックボックスが未選択であること', () => {
    render(<VenueCheckBoxForm params={params} />);

    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked();
    }
  });
});
