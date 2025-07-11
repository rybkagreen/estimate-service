import type { Meta, StoryObj } from '@storybook/react';
import { Size, Variant } from '../../../types/ui.types';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
    variant: 'primary',
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
    size: 'md',
  },
};

export const AllVariants: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['primary', 'secondary', 'success', 'error', 'warning', 'info'] as Variant[]).map(
        variant => (
          <Button key={variant} {...args} variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        ),
      )}
    </div>
  ),
};

export const AllSizes: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as Size[]).map(size => (
        <Button key={size} {...args} size={size}>
          {size.toUpperCase()}
        </Button>
      ))}
    </div>
  ),
};
