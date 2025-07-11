import { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonTable, SkeletonText } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Basic: Story = {
  render: () => <Skeleton width={120} height={24} />,
};

export const Text: Story = {
  render: () => <SkeletonText lines={4} />,
};

export const Card: Story = {
  render: () => <SkeletonCard />,
};

export const Table: Story = {
  render: () => <SkeletonTable rows={3} cols={5} />,
};

export const Avatar: Story = {
  render: () => <SkeletonAvatar size={48} />,
};
