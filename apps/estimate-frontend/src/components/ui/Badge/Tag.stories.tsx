import { Meta, StoryObj } from '@storybook/react';
import { Tag, TagGroup } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'UI/Tag',
  component: Tag,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Basic: Story = {
  render: () => <Tag>Тег</Tag>,
};

export const Removable: Story = {
  render: () => (
    <Tag removable onRemove={() => {}}>
      Удаляемый тег
    </Tag>
  ),
};

export const Group: Story = {
  render: () => <TagGroup tags={['Frontend', 'Backend', 'AI']} onRemove={() => {}} />,
};
