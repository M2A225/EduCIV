import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('renders default confirm and cancel labels', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  it('renders custom labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      />
    );
    expect(screen.getByText('Yes, delete')).toBeInTheDocument();
    expect(screen.getByText('No, keep')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirmer'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when overlay is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const overlay = document.querySelector('.fixed.inset-0.z-50 > div:first-child');
    fireEvent.click(overlay!);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when X button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const xButton = buttons.find(b => b.querySelector('svg'));
    fireEvent.click(xButton!);
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('shows loading state on confirm button', () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);
    const confirmBtn = screen.getByText('Confirmer').closest('button');
    expect(confirmBtn).toBeDisabled();
  });

  it('renders danger variant icon background', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
  });

  it('renders primary variant', () => {
    render(<ConfirmDialog {...defaultProps} variant="primary" />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
  });
});
