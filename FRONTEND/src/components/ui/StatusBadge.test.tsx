import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders status text', () => {
    render(<StatusBadge status="Validé" variant="green" />);
    expect(screen.getByText('Validé')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(<StatusBadge status="Status" variant="green">
      <span>Custom Content</span>
    </StatusBadge>);
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('applies correct variant mapping for green', () => {
    render(<StatusBadge status="Présent" variant="green" />);
    const badge = screen.getByText('Présent');
    expect(badge).toHaveClass('bg-success-bg');
  });

  it('applies correct variant mapping for red', () => {
    render(<StatusBadge status="Absent" variant="red" />);
    const badge = screen.getByText('Absent');
    expect(badge).toHaveClass('bg-error-bg');
  });

  it('applies correct variant mapping for yellow', () => {
    render(<StatusBadge status="Retard" variant="yellow" />);
    const badge = screen.getByText('Retard');
    expect(badge).toHaveClass('bg-warning-bg');
  });
});
