import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('отображает заголовок и значение', () => {
    render(<MetricCard title='Test Title' value={42} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('отображает иконку, если передана', () => {
    render(<MetricCard title='Test' value={1} icon={<span data-testid='icon'>icon</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
