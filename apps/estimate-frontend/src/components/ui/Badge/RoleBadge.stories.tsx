import { Meta, StoryObj } from '@storybook/react';
import { RoleBadge } from './RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'UI/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['admin', 'manager', 'user', 'guest'],
    },
    icon: { control: false },
    description: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof RoleBadge>;

export const Admin: Story = {
  args: {
    role: 'admin',
    description: 'Администратор системы',
    icon: <span>👑</span>,
  },
};

export const Manager: Story = {
  args: {
    role: 'manager',
    description: 'Менеджер проекта',
    icon: <span>🧑‍💼</span>,
  },
};

export const User: Story = {
  args: {
    role: 'user',
    description: 'Пользователь',
    icon: <span>👤</span>,
  },
};

export const Guest: Story = {
  args: {
    role: 'guest',
    description: 'Гость',
    icon: <span>👥</span>,
  },
};
