import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders with error', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Input helperText="Enter your full name" />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(<Input error="Error" helperText="Helper text" />);
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    
    await user.type(input, 'Hello World');
    expect(input).toHaveValue('Hello World');
  });

  it('renders disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('renders with left icon', () => {
    const icon = <span data-testid="left-icon">👤</span>;
    render(<Input leftIcon={icon} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const icon = <span data-testid="right-icon">✓</span>;
    render(<Input rightIcon={icon} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Input size="sm" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('text-sm');
  });
});
