import { fireEvent, render, screen } from '@testing-library/react';
import { create } from 'zustand';
import HomeClient from '../components/HomeClient';

// next/navigation をモック
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      refresh: jest.fn(),
    };
  },
}));

// actions をモック
jest.mock("@/app/actions", () => ({
  clockIn: jest.fn(),
  clockOut: jest.fn(),
  startBreak: jest.fn(),
  endBreak: jest.fn(),
}));

// ストアをモック
const initialStoreState = {
  currentStatus: 'left',
  records: [],
  shifts: [],
};

const mockStore = create((set) => ({
  ...initialStoreState,
  clockIn: () => set({ currentStatus: 'working' }),
  clockOut: () => set({ currentStatus: 'left' }),
  startBreak: () => set({ currentStatus: 'break' }),
  endBreak: () => set({ currentStatus: 'working' }),
  updateRecord: jest.fn(),
  getTodayRecord: jest.fn(),
  addShift: jest.fn(),
  deleteShift: jest.fn(),
  reset: () => set(initialStoreState),
}));

jest.mock('@/lib/store', () => ({
  useTimeStore: () => mockStore(),
}));

// StampHistory をモックしてテストを簡略化
jest.mock('@/components/StampHistory', () => ({
  StampHistory: () => <div data-testid="mock-history">History</div>,
}));

describe('Home Page', () => {
  beforeEach(() => {
    // 各テスト前に localStorage をクリア
    localStorage.clear();
    // ストアを初期化
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockStore as any).getState().reset();
  });

  it('renders correctly with initial status "Left" (勤務外)', () => {
    render(<HomeClient initialStatus="left" />);
    
    // ステータステキストを確認
    expect(screen.getByText('勤務外')).toBeInTheDocument();
    
    // 「出勤」ボタンが表示されていること
    expect(screen.getByRole('button', { name: /出勤/i })).toBeInTheDocument();
    
    // 他のボタンがないこと
    expect(screen.queryByRole('button', { name: /退勤/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /休憩開始/i })).not.toBeInTheDocument();
  });

  it('changes status to "Working" (勤務中) when Clock In is clicked', async () => {
    render(<HomeClient initialStatus="left" />);
    
    const clockInButton = screen.getByRole('button', { name: /出勤/i });
    fireEvent.click(clockInButton);
    
    // ステータスが更新されること
    expect(await screen.findByText('勤務中')).toBeInTheDocument();
    
    // ボタン表示が変わること
    expect(screen.queryByRole('button', { name: /出勤/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /退勤/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /休憩開始/i })).toBeInTheDocument();
  });

  it('changes status to "Break" (休憩中) when Break Start is clicked', async () => {
    render(<HomeClient initialStatus="left" />);
    
    // まず出勤する
    fireEvent.click(screen.getByRole('button', { name: /出勤/i }));
    
    // その後休憩開始を押す（出勤の反映を待つ）
    await screen.findByText('勤務中');

    const breakStartButton = screen.getByRole('button', { name: /休憩開始/i });
    fireEvent.click(breakStartButton);
    
    // ステータスが更新されること
    expect(await screen.findByText('休憩中')).toBeInTheDocument();
    
    // ボタン表示が変わること
    expect(screen.queryByRole('button', { name: /休憩開始/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /休憩終了/i })).toBeInTheDocument();
  });

  it('changes status back to "Working" when Break End is clicked', async () => {
    render(<HomeClient initialStatus="left" />);
    
    // 出勤してから休憩開始
    fireEvent.click(screen.getByRole('button', { name: /出勤/i }));
    await screen.findByText('勤務中');

    fireEvent.click(screen.getByRole('button', { name: /休憩開始/i }));
    await screen.findByText('休憩中');
     
    // 休憩終了
    const breakEndButton = screen.getByRole('button', { name: /休憩終了/i });
    fireEvent.click(breakEndButton);
    
    // ステータスが更新されること
    expect(await screen.findByText('勤務中')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /休憩開始/i })).toBeInTheDocument();
  });

  it('changes status to "Left" when Clock Out is clicked', async () => {
    render(<HomeClient initialStatus="left" />);
    
    // 出勤
    fireEvent.click(screen.getByRole('button', { name: /出勤/i }));
    await screen.findByText('勤務中');
    
    // 退勤
    const clockOutButton = screen.getByRole('button', { name: /退勤/i });
    fireEvent.click(clockOutButton);
    
    // ステータスが更新されること
    expect(await screen.findByText('勤務外')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /出勤/i })).toBeInTheDocument();
  });
});

