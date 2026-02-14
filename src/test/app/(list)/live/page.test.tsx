import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LiveCheckBoxForm from '@/components/features/live/LiveCheckBoxForm';
import { liveNames } from '@/data';

// モック関数を作成
const pushMock = vi.fn();

// useRouterをモック化
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('LiveCheckBoxForm tests', () => {
  beforeEach(() => {
    // テストごとにモックをクリア
    pushMock.mockClear();
  });

  it('初期状態で"会場を選択する"ボタンが無効化されていること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    expect(button).toBeDisabled();
  });

  it('アイテムを選択すると"会場を選択する"ボタンが有効になること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    expect(button).toBeDisabled();

    const checkbox = screen.getByLabelText('1st LIVE Ready Steady Go!');
    fireEvent.click(checkbox);

    expect(button).toBeEnabled();
  });

  it('アイテムを全て選択解除すると"会場を選択する"ボタンが再び無効化されること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    const checkbox = screen.getByLabelText('1st LIVE Ready Steady Go!');

    fireEvent.click(checkbox);
    expect(button).toBeEnabled();

    fireEvent.click(checkbox);
    expect(button).toBeDisabled();
  });

  it('live-tour-2024-heart-bookmarkを選択せずにボタンを押すと即座に画面遷移が行われること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const checkbox = screen.getByLabelText('1st LIVE Ready Steady Go!');
    fireEvent.click(checkbox);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith(
      '/venue?live_id=1st-live-ready-steady-go',
    );
  });

  it.skip('live-tour-2024-heart-bookmarkを選択した状態でボタンを押すとポップアップが表示されること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const checkbox = screen.getByLabelText('LIVE TOUR 2024 heart bookmark');
    fireEvent.click(checkbox);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    fireEvent.click(button);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();

    const popupDescription = screen.getByText(
      'Inori Minase LIVE TOUR 2024 heart bookmarkのネタバレが含まれますが、よろしいですか？',
    );
    expect(popupDescription).toBeInTheDocument();
  });

  it.skip('ポップアップで"会場を選択する"をクリックすると画面遷移が行われること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const checkbox = screen.getByLabelText('LIVE TOUR 2024 heart bookmark');
    fireEvent.click(checkbox);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    fireEvent.click(button);

    const dialog = screen.getByRole('alertdialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: '会場を選択する',
    });
    fireEvent.click(confirmButton);

    expect(pushMock).toHaveBeenCalledWith(
      '/venue?live_id=live-tour-2024-heart-bookmark',
    );
  });

  it.skip('ポップアップで"選び直す"をクリックするとポップアップが閉じること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const checkbox = screen.getByLabelText('LIVE TOUR 2024 heart bookmark');
    fireEvent.click(checkbox);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    fireEvent.click(button);

    let dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();

    const cancelButton = within(dialog).getByRole('button', {
      name: '選び直す',
    });
    fireEvent.click(cancelButton);

    dialog = screen.queryByRole('alertdialog') as HTMLElement;
    expect(dialog).not.toBeInTheDocument();
  });

  it('"最初に戻る"ボタンをクリックするとルートページに遷移すること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const link = screen.getByRole('link', { name: '最初に戻る' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('水瀬いのり個人名義のライブが正しく表示されること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const header = screen.getByText('水瀬いのり個人名義');
    expect(header).toBeInTheDocument();

    const inoriMinaseLives = liveNames.filter(
      (live) => live.liveType === '水瀬いのり個人名義',
    );

    for (const live of inoriMinaseLives) {
      const checkbox = screen.getByLabelText(live.name);
      expect(checkbox).toBeInTheDocument();
    }
  });

  it('町民集会のライブが正しく表示されること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const header = screen.getByText('町民集会');
    expect(header).toBeInTheDocument();

    const townMeetingLives = liveNames.filter(
      (live) => live.liveType === '町民集会',
    );

    for (const live of townMeetingLives) {
      const checkbox = screen.getByLabelText(live.name);
      expect(checkbox).toBeInTheDocument();
    }
  });

  it('チェックボックスの選択状態がフォームの状態と同期していること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const checkbox1 = screen.getByLabelText('1st LIVE Ready Steady Go!');
    const checkbox2 = screen.getByLabelText('LIVE TOUR 2018 BLUE COMPASS');

    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).not.toBeChecked();

    fireEvent.click(checkbox1);
    expect(checkbox1).toBeChecked();

    fireEvent.click(checkbox2);
    expect(checkbox2).toBeChecked();

    fireEvent.click(checkbox1);
    expect(checkbox1).not.toBeChecked();
  });

  it('選択したアイテムがクエリパラメータに正しく反映されること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const checkbox1 = screen.getByLabelText('1st LIVE Ready Steady Go!');
    const checkbox2 = screen.getByLabelText('LIVE TOUR 2018 BLUE COMPASS');

    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    fireEvent.click(button);
    // 実際のクエリパラメータはエンコードされるため、エンコードされた文字列を比較する
    const expectedUrl = `/venue?live_id=${encodeURIComponent('1st-live-ready-steady-go,live-tour-2018-blue-compass')}`;

    expect(pushMock).toHaveBeenCalledWith(expectedUrl);
  });

  it('フォームの初期値が正しく設定されていること', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    for (const live of liveNames) {
      const checkbox = screen.getByLabelText(live.name);
      expect(checkbox).not.toBeChecked();
    }
  });

  it('フォームが空の場合、"会場を選択する"ボタンをクリックしても何も起きないこと', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('選択したアイテムが無い状態でページ遷移が行われないこと', () => {
    render(<LiveCheckBoxForm params={liveNames} />);

    const button = screen.getByRole('button', { name: '会場を選択する' });
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(pushMock).not.toHaveBeenCalled();
  });
});
