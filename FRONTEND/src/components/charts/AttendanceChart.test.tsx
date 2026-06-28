import { render, screen } from '@testing-library/react';
import { AttendanceChart } from './AttendanceChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe('AttendanceChart', () => {
  it('should render chart', () => {
    render(<AttendanceChart data={[{ date: '01/06', rate: 92 }]} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
