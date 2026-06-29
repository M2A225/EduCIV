import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<PageHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('should render actions', () => {
    render(<PageHeader title="Title" actions={<button>Action</button>} />);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should apply size class', () => {
    render(<PageHeader title="Title" size="sm" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('text-xl');
  });
});
