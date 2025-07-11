import { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from './MetricCard';

const meta: Meta<typeof MetricCard> = {
  title: 'UI/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Basic: Story = {
  args: {
    icon: <span>📈</span>,
    value: 1234,
    label: 'Доход',
  },
};

export const WithTrend: Story = {
  args: {
    icon: <span>📈</span>,
    value: 1234,
    label: 'Доход',
    trend: { value: 12, isPositive: true },
  },
};

export const NegativeTrend: Story = {
  args: {
    icon: <span>📉</span>,
    value: 900,
    label: 'Расходы',
    trend: { value: 8, isPositive: false },
  },
};
