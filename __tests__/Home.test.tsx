import { fireEvent, render, screen } from '@testing-library/react';
import { create } from 'zustand';
import Home from '../app/page';

// Mock the store
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

// Mock StampHistory to simplify testing
jest.mock('@/components/StampHistory', () => ({
  StampHistory: () => <div data-testid="mock-history">History</div>,
}));

describe('Home Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store
    (mockStore as any).getState().reset();
  });

  it('renders correctly with initial status "Left" (勤務外)', () => {
    render(<Home />);
    
    // Check status text
    expect(screen.getByText('勤務外')).toBeInTheDocument();
    
    // Check "Clock In" button is present
    expect(screen.getByRole('button', { name: /出勤/i })).toBeInTheDocument();
    
    // Check other buttons are NOT present
    expect(screen.queryByRole('button', { name: /退勤/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /休憩開始/i })).not.toBeInTheDocument();
  });

  it('changes status to "Working" (勤務中) when Clock In is clicked', () => {
    render(<Home />);
    
    const clockInButton = screen.getByRole('button', { name: /出勤/i });
    fireEvent.click(clockInButton);
    
    // Check status updated
    expect(screen.getByText('勤務中')).toBeInTheDocument();
    
    // Check buttons changed
    expect(screen.queryByRole('button', { name: /出勤/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /退勤/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /休憩開始/i })).toBeInTheDocument();
  });

  it('changes status to "Break" (休憩中) when Break Start is clicked', () => {
    render(<Home />);
    
    // First clock in
    fireEvent.click(screen.getByRole('button', { name: /出勤/i }));
    
    // Then start break
    const breakStartButton = screen.getByRole('button', { name: /休憩開始/i });
    fireEvent.click(breakStartButton);
    
    // Check status updated
    expect(screen.getByText('休憩中')).toBeInTheDocument();
    
    // Check buttons changed
    expect(screen.queryByRole('button', { name: /休憩開始/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /休憩終了/i })).toBeInTheDocument();
  });

  it('changes status back to "Working" when Break End is clicked', () => {
    render(<Home />);
    
    // Clock in -> Break Start
    fireEvent.click(screen.getByRole('button', { name: /出勤/i }));
    fireEvent.click(screen.getByRole('button', { name: /休憩開始/i }));
    
    // End break
    const breakEndButton = screen.getByRole('button', { name: /休憩終了/i });
    fireEvent.click(breakEndButton);
    
    // Check status updated
    expect(screen.getByText('勤務中')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /休憩開始/i })).toBeInTheDocument();
  });

  it('changes status to "Left" when Clock Out is clicked', () => {
    render(<Home />);
    
    // Clock in
    fireEvent.click(screen.getByRole('button', { name: /出勤/i }));
    
    // Clock out
    const clockOutButton = screen.getByRole('button', { name: /退勤/i });
    fireEvent.click(clockOutButton);
    
    // Check status updated
    expect(screen.getByText('勤務外')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /出勤/i })).toBeInTheDocument();
  });
});
