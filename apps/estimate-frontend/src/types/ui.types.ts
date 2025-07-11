export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export type Variant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
