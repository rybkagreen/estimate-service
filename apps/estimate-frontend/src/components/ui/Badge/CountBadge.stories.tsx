import { Meta, StoryObj } from '@storybook/react';
import { CountBadge } from './CountBadge';

const meta: Meta<typeof CountBadge> = {
  title: 'UI/CountBadge',
  component: CountBadge,
  tags: ['autodocs'],
  argTypes: {
    count: { control: 'number' },
    max: { control: 'number' },
  },
};
export default meta;
type Story = StoryObj<typeof CountBadge>;

export const Default: Story = {
  args: {
    count: 5,
  },
};

export const Max: Story = {
  args: {
    count: 120,
    max: 99,
  },
};
