import { renderHook, act, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './useAuth';
import { authService } from '../services/auth';
import { setAccessToken } from '../services/api';

vi.mock('../services/auth', () => ({
  authService: {
    refresh: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
    switchRole: vi.fn(),
  },
}));

vi.mock('../services/api', () => ({
  setAccessToken: vi.fn(),
  setOnTokenRefreshed: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(AuthProvider, null, children);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with null user when refresh fails', async () => {
    vi.mocked(authService.refresh).mockRejectedValue(new Error('No session'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('restores session on refresh success', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      phone: '',
      role: 'DIRECTOR' as const,
      school_id: 1,
      primary_school_id: 1,
      school_ids: [1],
      roles: ['DIRECTOR'],
    };
    vi.mocked(authService.refresh).mockResolvedValue({
      data: { accessToken: 'mock-token', user: mockUser },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).toBe('mock-token');
    });

    expect(result.current.user?.name).toBe('Test User');
  });

  it('login sets user data', async () => {
    vi.mocked(authService.refresh).mockRejectedValue(new Error('No session'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    act(() => {
      result.current.login('new-token', {
        id: 1,
        name: 'New User',
        email: 'new@test.com',
        phone: '',
        role: 'TEACHER',
        primary_school_id: 1,
        school_ids: [1],
        roles: ['TEACHER'],
      });
    });

    expect(result.current.token).toBe('new-token');
    expect(result.current.user?.name).toBe('New User');
    expect(setAccessToken).toHaveBeenCalledWith('new-token');
  });

  it('logout clears state', async () => {
    vi.mocked(authService.refresh).mockRejectedValue(new Error('No session'));
    vi.mocked(authService.logout).mockResolvedValue({} as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    act(() => {
      result.current.login('token', {
        id: 1,
        name: 'User',
        email: 'user@test.com',
        role: 'DIRECTOR',
        primary_school_id: 1,
        school_ids: [1],
      });
    });

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('setCurrentSchoolId updates current school', async () => {
    vi.mocked(authService.refresh).mockRejectedValue(new Error('No session'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    act(() => {
      result.current.setCurrentSchoolId(42);
    });

    expect(result.current.currentSchoolId).toBe(42);
  });
});
