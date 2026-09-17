import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders the requested number of rows', () => {
    render(<LoadingSkeleton variant="list" count={4} />);

    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(4);
  });

  it('renders cards variant', () => {
    render(<LoadingSkeleton variant="cards" count={3} />);

    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(3);
  });
});
