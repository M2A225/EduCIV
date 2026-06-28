import { render } from '@testing-library/react';
import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('should render text skeleton by default', () => {
    const { container } = render(<LoadingState />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('should render card skeletons', () => {
    const { container } = render(<LoadingState type="card" count={2} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(2);
  });

  it('should render list skeletons', () => {
    const { container } = render(<LoadingState type="list" count={5} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(5);
  });
});
