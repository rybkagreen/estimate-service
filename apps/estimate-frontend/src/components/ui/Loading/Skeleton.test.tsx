import { render } from '@testing-library/react';
import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonTable, SkeletonText } from './Skeleton';

describe('Skeleton', () => {
  it('renders base skeleton', () => {
    const { getByLabelText } = render(<Skeleton />);
    expect(getByLabelText(/загрузка/i)).toBeInTheDocument();
  });
  it('renders SkeletonText lines', () => {
    const { container } = render(<SkeletonText lines={2} />);
    expect(container.querySelectorAll('div[aria-busy]')).toHaveLength(2);
  });
  it('renders SkeletonCard', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.p-4')).toBeInTheDocument();
  });
  it('renders SkeletonTable', () => {
    const { container } = render(<SkeletonTable rows={2} cols={3} />);
    expect(container.querySelectorAll('div[aria-busy]')).toHaveLength(6);
  });
  it('renders SkeletonAvatar', () => {
    const { container } = render(<SkeletonAvatar size={32} />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
