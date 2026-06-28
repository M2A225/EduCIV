import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders search input with default placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search students..." />);
    expect(screen.getByPlaceholderText('Search students...')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Rechercher...'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('displays current value', () => {
    render(<SearchBar value="search term" onChange={() => {}} />);
    expect(screen.getByDisplayValue('search term')).toBeInTheDocument();
  });

  it('renders filter button when onToggleFilters provided', () => {
    render(<SearchBar value="" onChange={() => {}} onToggleFilters={() => {}} />);
    expect(screen.getByText('Filtres')).toBeInTheDocument();
  });

  it('does not render filter button when onToggleFilters not provided', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByText('Filtres')).not.toBeInTheDocument();
  });

  it('renders reset button when hasActiveFilters is true', () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        hasActiveFilters
        onResetFilters={() => {}}
      />
    );
    expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
  });

  it('does not render reset button when hasActiveFilters is false', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByText('Réinitialiser')).not.toBeInTheDocument();
  });

  it('renders children when showFilters is true', () => {
    render(
      <SearchBar value="" onChange={() => {}} showFilters>
        <div>Filter content</div>
      </SearchBar>
    );
    expect(screen.getByText('Filter content')).toBeInTheDocument();
  });

  it('does not render children when showFilters is false', () => {
    render(
      <SearchBar value="" onChange={() => {}} showFilters={false}>
        <div>Filter content</div>
      </SearchBar>
    );
    expect(screen.queryByText('Filter content')).not.toBeInTheDocument();
  });
});
