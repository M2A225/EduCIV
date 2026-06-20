import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { LoginPage } from './LoginPage';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/auth', () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, null, children)
    );
};

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      user: null,
      token: null,
      schoolIds: [],
      currentSchoolId: null,
      activeRole: null,
      availableRoles: [],
      logout: vi.fn(),
      setCurrentSchoolId: vi.fn(),
      switchRole: vi.fn(),
    });
  });

  it('renders the login form', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Bienvenue')).toBeInTheDocument();
    expect(screen.getByText('Email ou téléphone')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@exemple.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Entrez votre mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('renders EduCIV branding', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    expect(screen.getAllByText('EduCIV').length).toBeGreaterThanOrEqual(1);
  });

  it('renders forgot password link', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Email ou téléphone requis')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(<LoginPage />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('email@exemple.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Entrez votre mot de passe'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Minimum 6 caractères')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      data: {
        data: {
          accessToken: 'mock-token',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@test.com',
            role: 'DIRECTOR',
            roles: ['DIRECTOR'],
            primary_school_id: 1,
            school_ids: [1],
          },
        },
      },
    } as never);

    render(<LoginPage />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('email@exemple.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Entrez votre mot de passe'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        identifier: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('shows error message on login failure', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Identifiants incorrects'));

    render(<LoginPage />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('email@exemple.com'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Entrez votre mot de passe'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(<LoginPage />, { wrapper: createWrapper() });

    const passwordInput = screen.getByPlaceholderText('Entrez votre mot de passe');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByLabelText(/afficher le mot de passe/i));
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByLabelText(/masquer le mot de passe/i));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows loading state during mutation', async () => {
    vi.mocked(authService.login).mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('email@exemple.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Entrez votre mot de passe'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      const submitBtn = screen.getByRole('button', { name: /se connecter/i });
      expect(submitBtn).toBeDisabled();
    });
  });
});
