import { render } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    const { getByRole } = render(<Spinner />);
    expect(getByRole('status')).toBeInTheDocument();
  });
  it('applies custom className', () => {
    const { getByRole } = render(<Spinner className='custom' />);
    expect(getByRole('status').className).toMatch(/custom/);
  });
});
