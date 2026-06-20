import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders a select element', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select options={options} label="Choose one" />);
    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  it('handles selection change', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders placeholder when provided', () => {
    render(<Select options={options} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('shows error message when error is provided', () => {
    render(<Select options={options} error="Selection required" />);
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('does not show error when error is not provided', () => {
    render(<Select options={options} />);
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });

  it('supports disabled state', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Select options={options} className="custom-select" />);
    expect(screen.getByRole('combobox')).toHaveClass('custom-select');
  });
});
