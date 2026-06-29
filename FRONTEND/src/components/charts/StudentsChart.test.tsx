import { render, screen } from '@testing-library/react';
import { StudentsChart } from './StudentsChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('StudentsChart', () => {
  it('should render chart', () => {
    render(<StudentsChart data={[{ name: 'Garçons', value: 120 }]} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});
