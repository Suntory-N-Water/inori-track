import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SelectWizard from '@/components/features/select/SelectWizard';
import type { LiveName, Venue } from '@/types';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/lib/venueEncoding', () => ({
  encodeVenueIds: (ids: string[]) => `mocked_${ids.sort().join('_')}`,
}));

const mockLiveNames: LiveName[] = [
  {
    id: 'live-a',
    name: 'LIVE A',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'live-b',
    name: 'LIVE B',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'town-a',
    name: '町民集会A',
    liveType: '町民集会',
  },
];

type VenueWithLiveNameId = Venue & { liveNameId: string };

const mockVenues: VenueWithLiveNameId[] = [
  { id: 'venue-a1', name: '東京', liveNameId: 'live-a' },
  { id: 'venue-a2', name: '大阪', liveNameId: 'live-a' },
  { id: 'venue-b1', name: '愛知', liveNameId: 'live-b' },
  { id: 'venue-town1', name: '横浜昼公演', liveNameId: 'town-a' },
  { id: 'venue-town2', name: '横浜夜公演', liveNameId: 'town-a' },
];

describe('SelectWizard', () => {
  beforeEach(() => {
    pushMock.mockClear();
    sessionStorage.clear();
  });

  it('初期状態で「結果を見る」ボタンが無効化されていること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    const button = screen.getByRole('button', { name: '結果を見る' });
    expect(button).toBeDisabled();
  });

  it('水瀬いのり個人名義のライブが正しく表示されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    expect(screen.getByText('水瀬いのり個人名義')).toBeInTheDocument();
    expect(screen.getByLabelText('LIVE A')).toBeInTheDocument();
    expect(screen.getByLabelText('LIVE B')).toBeInTheDocument();
  });

  it('町民集会のライブが正しく表示されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    expect(screen.getByText('町民集会')).toBeInTheDocument();
    expect(screen.getByLabelText('町民集会A')).toBeInTheDocument();
  });

  it('チェックボックスの選択状態がフォームと同期していること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    const checkbox1 = screen.getByLabelText('LIVE A');
    const checkbox2 = screen.getByLabelText('LIVE B');

    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).not.toBeChecked();

    fireEvent.click(checkbox1);
    expect(checkbox1).toBeChecked();

    fireEvent.click(checkbox2);
    expect(checkbox2).toBeChecked();

    fireEvent.click(checkbox1);
    expect(checkbox1).not.toBeChecked();
  });

  it('「最初に戻る」ボタンが / へのリンクであること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    const link = screen.getByRole('link', { name: '最初に戻る' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('ライブを選択すると対応する会場チェックボックスが展開されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    expect(screen.queryByText('参加した会場を選ぼう')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('LIVE A'));

    expect(screen.getByText('参加した会場を選ぼう')).toBeInTheDocument();
    expect(screen.getByLabelText('東京')).toBeInTheDocument();
    expect(screen.getByLabelText('大阪')).toBeInTheDocument();
    expect(screen.queryByLabelText('愛知')).not.toBeInTheDocument();
  });

  it('ライブの選択を解除すると対応する会場チェックボックスが消え、選択も解除されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'LIVE A' }));
    fireEvent.click(screen.getByLabelText('東京'));
    expect(screen.getByLabelText('東京')).toBeChecked();

    // ライブ checkbox と venue fieldset の aria-label が重複するため role で特定
    fireEvent.click(screen.getByRole('checkbox', { name: 'LIVE A' }));

    expect(screen.queryByLabelText('東京')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('大阪')).not.toBeInTheDocument();
  });

  it('会場のチェックボックスを選択するとフォームが更新されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    fireEvent.click(screen.getByLabelText('LIVE A'));

    const venueCheckbox = screen.getByLabelText('東京');
    expect(venueCheckbox).not.toBeChecked();

    fireEvent.click(venueCheckbox);
    expect(venueCheckbox).toBeChecked();
  });

  it('会場を複数選択できること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    fireEvent.click(screen.getByLabelText('LIVE A'));

    fireEvent.click(screen.getByLabelText('東京'));
    fireEvent.click(screen.getByLabelText('大阪'));

    expect(screen.getByLabelText('東京')).toBeChecked();
    expect(screen.getByLabelText('大阪')).toBeChecked();
  });

  it('会場が選択されていると「結果を見る」ボタンが有効化されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    const button = screen.getByRole('button', { name: '結果を見る' });
    expect(button).toBeDisabled();

    fireEvent.click(screen.getByLabelText('LIVE A'));
    fireEvent.click(screen.getByLabelText('東京'));

    expect(button).toBeEnabled();
  });

  it('ライブ名ごとに会場が正しくグルーピング表示されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    fireEvent.click(screen.getByLabelText('LIVE A'));
    fireEvent.click(screen.getByLabelText('LIVE B'));

    const sectionA = screen.getByRole('group', { name: 'LIVE A' });
    expect(within(sectionA).getByLabelText('東京')).toBeInTheDocument();
    expect(within(sectionA).getByLabelText('大阪')).toBeInTheDocument();

    const sectionB = screen.getByRole('group', { name: 'LIVE B' });
    expect(within(sectionB).getByLabelText('愛知')).toBeInTheDocument();
  });

  it('「結果を見る」ボタンをクリックすると /result?v=... に遷移すること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    fireEvent.click(screen.getByLabelText('LIVE A'));
    fireEvent.click(screen.getByLabelText('東京'));

    fireEvent.click(screen.getByRole('button', { name: '結果を見る' }));

    expect(pushMock).toHaveBeenCalledWith('/result?v=mocked_venue-a1');
  });

  it('複数会場を選択して遷移するとエンコード済みパラメータで遷移すること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    fireEvent.click(screen.getByLabelText('LIVE A'));
    fireEvent.click(screen.getByLabelText('東京'));
    fireEvent.click(screen.getByLabelText('大阪'));

    fireEvent.click(screen.getByRole('button', { name: '結果を見る' }));

    expect(pushMock).toHaveBeenCalledWith('/result?v=mocked_venue-a1_venue-a2');
  });

  it('sessionStorage に選択状態が保存されること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    fireEvent.click(screen.getByLabelText('LIVE A'));
    fireEvent.click(screen.getByLabelText('東京'));

    fireEvent.click(screen.getByRole('button', { name: '結果を見る' }));

    const stored = JSON.parse(
      sessionStorage.getItem('inori-track-selection') || '{}',
    );
    expect(stored.liveIds).toEqual(['live-a']);
    expect(stored.venueIds).toEqual(['venue-a1']);
  });

  it('マウント時に sessionStorage から選択状態が復元されること', () => {
    sessionStorage.setItem(
      'inori-track-selection',
      JSON.stringify({
        liveIds: ['live-a'],
        venueIds: ['venue-a1'],
      }),
    );

    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    expect(screen.getByRole('checkbox', { name: 'LIVE A' })).toBeChecked();
    expect(screen.getByLabelText('東京')).toBeInTheDocument();
    expect(screen.getByLabelText('東京')).toBeChecked();
  });

  it('フォームの初期状態ですべてのライブチェックボックスが未選択であること', () => {
    render(<SelectWizard liveNames={mockLiveNames} venues={mockVenues} />);

    for (const live of mockLiveNames) {
      expect(screen.getByLabelText(live.name)).not.toBeChecked();
    }
  });
});
