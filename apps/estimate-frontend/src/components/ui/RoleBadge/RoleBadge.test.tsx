import { render, screen } from '@testing-library/react';
import { RoleBadge } from './RoleBadge';

describe('RoleBadge', () => {
  it('отображает роль', () => {
    render(<RoleBadge role='admin' />);
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });
});
