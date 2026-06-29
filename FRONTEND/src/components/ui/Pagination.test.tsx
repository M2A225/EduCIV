import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when total pages is 1', () => {
    const { container } = render(
      <Pagination page={1} total={30} onChange={() => {}} pageSize={50} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination controls when multiple pages', () => {
    render(<Pagination page={1} total={100} onChange={() => {}} pageSize={50} />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('calls onChange with previous page', () => {
    const onChange = vi.fn();
    render(<Pagination page={2} total={100} onChange={onChange} pageSize={50} />);
    fireEvent.click(screen.getByLabelText('Page précédente'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('calls onChange with next page', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} total={100} onChange={onChange} pageSize={50} />);
    fireEvent.click(screen.getByLabelText('Page suivante'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination page={1} total={100} onChange={() => {}} pageSize={50} />);
    expect(screen.getByLabelText('Page précédente')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={2} total={100} onChange={() => {}} pageSize={50} />);
    expect(screen.getByLabelText('Page suivante')).toBeDisabled();
  });
});
