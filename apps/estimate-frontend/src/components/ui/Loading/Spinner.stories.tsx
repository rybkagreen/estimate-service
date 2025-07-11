import { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const AllSizes: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <Spinner key={size} {...args} size={size} />
      ))}
    </div>
  ),
};
