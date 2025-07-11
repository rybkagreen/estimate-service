import { render, screen } from '@testing-library/react';
import { CountBadge } from './CountBadge';

describe('CountBadge', () => {
  it('отображает число', () => {
    render(<CountBadge count={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
