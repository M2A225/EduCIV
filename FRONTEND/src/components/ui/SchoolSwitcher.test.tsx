import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SchoolSwitcher } from './SchoolSwitcher';
import { useAuth } from '../../hooks/useAuth';
import { useSchools } from '../../hooks/useSchools';

vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useSchools');

const mockUseAuth = vi.mocked(useAuth);
const mockUseSchools = vi.mocked(useSchools);

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('SchoolSwitcher', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      schoolIds: [1, 2],
      currentSchoolId: 1,
      setCurrentSchoolId: vi.fn(),
    } as any);
    mockUseSchools.mockReturnValue({
      data: [{ id: 1, name: 'School A' }, { id: 2, name: 'School B' }],
    } as any);
  });

  it('should render current school name', () => {
    render(<SchoolSwitcher />, { wrapper: Wrapper });
    expect(screen.getByText('School A')).toBeInTheDocument();
  });

  it('should show dropdown on click', () => {
    render(<SchoolSwitcher />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('School A'));
    expect(screen.getByText('School B')).toBeInTheDocument();
  });

  it('should not render when only one school', () => {
    mockUseAuth.mockReturnValue({
      schoolIds: [1],
      currentSchoolId: 1,
      setCurrentSchoolId: vi.fn(),
    } as any);
    const { container } = render(<SchoolSwitcher />, { wrapper: Wrapper });
    expect(container.innerHTML).toBe('');
  });
});
