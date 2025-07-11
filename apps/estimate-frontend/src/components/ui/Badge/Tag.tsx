import React from 'react';

interface TagProps {
  children: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  removable = false,
  onRemove,
  className = '',
}) => (
  <span
    className={`inline-flex items-center bg-gray-100 text-gray-800 rounded px-2 py-0.5 text-sm ${className}`}
  >
    {children}
    {removable && (
      <button
        type='button'
        className='ml-1 text-gray-400 hover:text-red-500 focus:outline-none'
        onClick={onRemove}
        aria-label='Удалить тег'
      >
        ×
      </button>
    )}
  </span>
);

interface TagGroupProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  className?: string;
}

export const TagGroup: React.FC<TagGroupProps> = ({ tags, onRemove, className = '' }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {tags.map(tag => (
      <Tag key={tag} removable={!!onRemove} onRemove={() => onRemove?.(tag)}>
        {tag}
      </Tag>
    ))}
  </div>
);
