import { render, screen } from '@testing-library/react';
import { StatusCard } from './StatusCard';

describe('StatusCard', () => {
  it('отображает статус и описание', () => {
    render(<StatusCard status='success' description='Всё хорошо' />);
    expect(screen.getByText('Всё хорошо')).toBeInTheDocument();
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
