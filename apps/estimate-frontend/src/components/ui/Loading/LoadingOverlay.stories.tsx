import { Meta, StoryObj } from '@storybook/react';
import { LoadingOverlay } from './LoadingOverlay';

const meta: Meta<typeof LoadingOverlay> = {
  title: 'UI/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    progress: { control: 'number' },
    fullscreen: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

export const Default: Story = {
  args: {
    text: 'Загрузка...',
  },
};

export const WithProgress: Story = {
  args: {
    text: 'Загрузка данных',
    progress: 60,
  },
};

export const Fullscreen: Story = {
  args: {
    text: 'Загрузка...',
    fullscreen: true,
  },
};
