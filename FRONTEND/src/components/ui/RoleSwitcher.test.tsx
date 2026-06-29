import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');

const mockUseAuth = vi.mocked(useAuth);

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RoleSwitcher', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      activeRole: 'DIRECTOR',
      availableRoles: ['DIRECTOR', 'TEACHER'],
      switchRole: vi.fn(),
    } as any);
  });

  it('should render current role', () => {
    render(<RoleSwitcher />, { wrapper: Wrapper });
    expect(screen.getByText('Directeur')).toBeInTheDocument();
  });

  it('should show dropdown on click', () => {
    render(<RoleSwitcher />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Directeur'));
    expect(screen.getByText('Enseignant')).toBeInTheDocument();
  });

  it('should not render when only one role', () => {
    mockUseAuth.mockReturnValue({
      activeRole: 'DIRECTOR',
      availableRoles: ['DIRECTOR'],
      switchRole: vi.fn(),
    } as any);
    const { container } = render(<RoleSwitcher />, { wrapper: Wrapper });
    expect(container.innerHTML).toBe('');
  });
});
