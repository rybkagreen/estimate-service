import { Meta, StoryObj } from '@storybook/react';
import { EstimateStatusCell } from './EstimateStatusCell';

const meta: Meta<typeof EstimateStatusCell> = {
  title: 'UI/EstimateStatusCell',
  component: EstimateStatusCell,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['draft', 'pending', 'approved', 'rejected'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof EstimateStatusCell>;

export const Draft: Story = {
  args: {
    status: 'draft',
  },
};

export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

export const Approved: Story = {
  args: {
    status: 'approved',
  },
};

export const Rejected: Story = {
  args: {
    status: 'rejected',
  },
};
