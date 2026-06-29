import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('cmdk', () => ({
  Command: Object.assign(
    ({ children, ...props }: any) => <div role="dialog" {...props}>{children}</div>,
    {
      Input: (props: any) => <input {...props} />,
      List: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Empty: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Group: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Item: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Separator: () => <hr />,
    }
  ),
}));

const mockUseAuth = vi.mocked(useAuth);

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CommandPalette', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ activeRole: 'DIRECTOR', user: null, logout: vi.fn() } as any);
  });

  it('should not render when closed', async () => {
    const { CommandPalette } = await import('./CommandPalette');
    render(<CommandPalette open={false} onClose={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', async () => {
    const { CommandPalette } = await import('./CommandPalette');
    render(<CommandPalette open={true} onClose={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should call onClose on escape', async () => {
    const { CommandPalette } = await import('./CommandPalette');
    const onClose = vi.fn();
    render(<CommandPalette open={true} onClose={onClose} />, { wrapper: Wrapper });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
