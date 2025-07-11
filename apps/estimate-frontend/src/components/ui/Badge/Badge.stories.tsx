import { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
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
    icon: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
    size: 'md',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    icon: <span>★</span>,
    variant: 'success',
    size: 'md',
  },
};

export const AllVariants: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const).map(variant => (
        <Badge key={variant} {...args} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <Badge key={size} {...args} size={size}>
          {size.toUpperCase()}
        </Badge>
      ))}
    </div>
  ),
};
