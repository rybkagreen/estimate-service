import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Тест</Button>);
    expect(screen.getByText('Тест')).toBeInTheDocument();
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant='success' size='lg'>
        OK
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/btn-success/);
    expect(btn.className).toMatch(/btn-lg/);
  });

  it('shows loading spinner', () => {
    render(<Button loading>Загрузка</Button>);
    expect(screen.getByLabelText(/загрузка/i)).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Загрузка</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
