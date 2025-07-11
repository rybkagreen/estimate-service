import { Meta, StoryObj } from '@storybook/react';
import { StatusCard } from './StatusCard';

const meta: Meta<typeof StatusCard> = {
  title: 'UI/StatusCard',
  component: StatusCard,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof StatusCard>;

export const Success: Story = {
  args: {
    status: 'success',
    title: 'Успешно',
    description: 'Операция завершена успешно',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    title: 'Ошибка',
    description: 'Произошла ошибка',
  },
};
