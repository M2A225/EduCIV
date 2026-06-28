import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser } from './useUsers';
import { userService } from '../services/users';

vi.mock('../services/users', () => ({
  userService: {
    getUsers: vi.fn(),
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUsers', () => {
  it('should return users data', async () => {
    (userService.getUsers as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUser', () => {
  it('should return single user', async () => {
    (userService.getUser as any).mockResolvedValue({ data: { data: { id: 1 } } });
    const { result } = renderHook(() => useUser(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateUser', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdateUser', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdateUser(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteUser', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});
