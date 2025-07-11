import { render } from '@testing-library/react';
import { Tag, TagGroup } from './Tag';

describe('Tag', () => {
  it('renders children', () => {
    const { getByText } = render(<Tag>Тег</Tag>);
    expect(getByText('Тег')).toBeInTheDocument();
  });
  it('renders removable button', () => {
    const { getByLabelText } = render(
      <Tag removable onRemove={() => {}}>
        Тег
      </Tag>,
    );
    expect(getByLabelText(/удалить тег/i)).toBeInTheDocument();
  });
});

describe('TagGroup', () => {
  it('renders tags', () => {
    const { getByText } = render(<TagGroup tags={['A', 'B']} />);
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('B')).toBeInTheDocument();
  });
});
