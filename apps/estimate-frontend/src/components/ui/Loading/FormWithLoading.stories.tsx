import { Meta, StoryObj } from '@storybook/react';
import { FormWithLoading } from './FormWithLoading';

const meta: Meta<typeof FormWithLoading> = {
  title: 'UI/FormWithLoading',
  component: FormWithLoading,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    submitText: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof FormWithLoading>;

export const Default: Story = {
  args: {
    loading: false,
    submitText: 'Сохранить',
    onSubmit: () => {},
    children: <input className='border p-2 rounded w-full' placeholder='Введите данные...' />,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    submitText: 'Сохраняем...',
  },
  render: args => (
    <FormWithLoading {...args} onSubmit={() => {}}>
      <input className='border p-2 rounded w-full' placeholder='Введите данные...' />
    </FormWithLoading>
  ),
};
