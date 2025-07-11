import { render } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    const { getByText } = render(<Badge>Тест</Badge>);
    expect(getByText('Тест')).toBeInTheDocument();
  });

  it('applies variant and size classes', () => {
    const { getByText } = render(
      <Badge variant='success' size='lg'>
        OK
      </Badge>,
    );
    const badge = getByText('OK');
    expect(badge.className).toMatch(/bg-green-100/);
    expect(badge.className).toMatch(/text-lg/);
  });
});
