import { render, screen } from '@testing-library/react';
import { GradesChart } from './GradesChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Cell: () => null,
}));

describe('GradesChart', () => {
  it('should render chart', () => {
    render(<GradesChart data={[{ subject: 'Maths', average: 14 }]} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
