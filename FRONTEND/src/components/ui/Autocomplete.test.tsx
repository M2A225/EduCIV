import { render, screen, fireEvent } from '@testing-library/react';
import Autocomplete from './Autocomplete';

const mockItems = [
  { id: 1, label: 'Kouassi Jean' },
  { id: 2, label: 'Kouamé Paul' },
  { id: 3, label: 'Bogaert Marie' },
];

describe('Autocomplete', () => {
  it('renders input with placeholder', () => {
    render(<Autocomplete items={mockItems} value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<Autocomplete items={mockItems} value="" onChange={() => {}} placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('shows all items when input is focused', () => {
    render(<Autocomplete items={mockItems} value="" onChange={() => {}} />);
    fireEvent.focus(screen.getByPlaceholderText('Rechercher...'));
    expect(screen.getByText('Kouassi Jean')).toBeInTheDocument();
    expect(screen.getByText('Kouamé Paul')).toBeInTheDocument();
    expect(screen.getByText('Bogaert Marie')).toBeInTheDocument();
  });

  it('filters items based on query', () => {
    render(<Autocomplete items={mockItems} value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Kou' } });
    expect(screen.getByText('Kouassi Jean')).toBeInTheDocument();
    expect(screen.getByText('Kouamé Paul')).toBeInTheDocument();
    expect(screen.queryByText('Bogaert Marie')).not.toBeInTheDocument();
  });

  it('shows no results message when no matches', () => {
    render(<Autocomplete items={mockItems} value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByText('Aucun résultat')).toBeInTheDocument();
  });

  it('calls onChange with selected item', () => {
    const onChange = vi.fn();
    render(<Autocomplete items={mockItems} value="" onChange={onChange} />);
    fireEvent.focus(screen.getByPlaceholderText('Rechercher...'));
    fireEvent.mouseDown(screen.getByText('Kouassi Jean'));
    expect(onChange).toHaveBeenCalledWith('Kouassi Jean', mockItems[0]);
  });

  it('displays subtitle when provided', () => {
    const itemsWithSubtitle = [
      { id: 1, label: 'Kouassi Jean', subtitle: 'Classe 6ème A' },
    ];
    render(<Autocomplete items={itemsWithSubtitle} value="" onChange={() => {}} />);
    fireEvent.focus(screen.getByPlaceholderText('Rechercher...'));
    expect(screen.getByText('Classe 6ème A')).toBeInTheDocument();
  });
});
