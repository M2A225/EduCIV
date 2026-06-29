import { render, screen } from '@testing-library/react';
import { Table } from './Table';

const columns = [
  { header: 'Name', accessor: (row: { name: string }) => row.name },
  { header: 'Value', accessor: (row: { value: number }) => row.value },
];

describe('Table', () => {
  it('should render loading state', () => {
    render(<Table data={[]} columns={columns} isLoading />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<Table data={[]} columns={columns} />);
    expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
  });

  it('should render custom empty message', () => {
    render(<Table data={[]} columns={columns} emptyMessage="Rien ici" />);
    expect(screen.getByText('Rien ici')).toBeInTheDocument();
  });

  it('should render data rows', () => {
    const data = [{ name: 'Test', value: 42 }];
    render(<Table data={data} columns={columns} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render column headers with data', () => {
    const data = [{ name: 'Test', value: 42 }];
    render(<Table data={data} columns={columns} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('should handle row click', () => {
    const onClick = vi.fn();
    const data = [{ name: 'Test', value: 1 }];
    render(<Table data={data} columns={columns} onRowClick={onClick} />);
    screen.getByText('Test').closest('tr')!.click();
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });
});
