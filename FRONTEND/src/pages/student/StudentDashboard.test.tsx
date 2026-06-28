import { render, screen } from '@testing-library/react';
import { StudentDashboard } from './StudentDashboard';
import { useNotes } from '../../hooks/useNotes';
import { useTimetables } from '../../hooks/useTimetables';
import { usePayments } from '../../hooks/usePayments';
import { useAttendance } from '../../hooks/useAttendance';

vi.mock('../../hooks/useNotes');
vi.mock('../../hooks/useTimetables');
vi.mock('../../hooks/usePayments');
vi.mock('../../hooks/useAttendance');

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when data is loading', () => {
    vi.mocked(useNotes).mockReturnValue({ grades: null, loading: true, error: null });
    vi.mocked(useTimetables).mockReturnValue({ timetables: null, loading: true, error: null });
    vi.mocked(usePayments).mockReturnValue({ payments: null, loading: true, error: null });
    vi.mocked(useAttendance).mockReturnValue({ attendance: null, loading: true, error: null });

    const { container } = render(<StudentDashboard />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('renders dashboard with title', () => {
    vi.mocked(useNotes).mockReturnValue({ grades: [], loading: false, error: null });
    vi.mocked(useTimetables).mockReturnValue({ timetables: [], loading: false, error: null });
    vi.mocked(usePayments).mockReturnValue({ payments: [], loading: false, error: null });
    vi.mocked(useAttendance).mockReturnValue({ attendance: [], loading: false, error: null });

    render(<StudentDashboard />);
    expect(screen.getByText('Mon Tableau de bord')).toBeInTheDocument();
  });

  it('displays N/A when no grades', () => {
    vi.mocked(useNotes).mockReturnValue({ grades: [], loading: false, error: null });
    vi.mocked(useTimetables).mockReturnValue({ timetables: [], loading: false, error: null });
    vi.mocked(usePayments).mockReturnValue({ payments: [], loading: false, error: null });
    vi.mocked(useAttendance).mockReturnValue({ attendance: [], loading: false, error: null });

    render(<StudentDashboard />);
    expect(screen.getByText('N/A/20')).toBeInTheDocument();
  });

  it('calculates average from grades', () => {
    const grades = [
      { id: 1, value: 15, subject: { name: 'Math' } },
      { id: 2, value: 12, subject: { name: 'Français' } },
    ];
    vi.mocked(useNotes).mockReturnValue({ grades, loading: false, error: null });
    vi.mocked(useTimetables).mockReturnValue({ timetables: [], loading: false, error: null });
    vi.mocked(usePayments).mockReturnValue({ payments: [], loading: false, error: null });
    vi.mocked(useAttendance).mockReturnValue({ attendance: [], loading: false, error: null });

    render(<StudentDashboard />);
    expect(screen.getByText('13.50/20')).toBeInTheDocument();
  });

  it('displays FCFA for total paid', () => {
    vi.mocked(useNotes).mockReturnValue({ grades: [], loading: false, error: null });
    vi.mocked(useTimetables).mockReturnValue({ timetables: [], loading: false, error: null });
    vi.mocked(usePayments).mockReturnValue({ payments: [], loading: false, error: null });
    vi.mocked(useAttendance).mockReturnValue({ attendance: [], loading: false, error: null });

    render(<StudentDashboard />);
    expect(screen.getByText('0 FCFA')).toBeInTheDocument();
  });

  it('displays percentage for attendance', () => {
    vi.mocked(useNotes).mockReturnValue({ grades: [], loading: false, error: null });
    vi.mocked(useTimetables).mockReturnValue({ timetables: [], loading: false, error: null });
    vi.mocked(usePayments).mockReturnValue({ payments: [], loading: false, error: null });
    vi.mocked(useAttendance).mockReturnValue({ attendance: [], loading: false, error: null });

    render(<StudentDashboard />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
