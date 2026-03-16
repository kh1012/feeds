import { Loader } from 'lucide-react';

type MiniSpinnerProps = {
  size?: 'xs' | 'sm' | 'md';
};

const sizeMap = {
  xs: 10,
  sm: 12,
  md: 16,
} as const;

export function MiniSpinner({ size = 'sm' }: MiniSpinnerProps) {
  return (
    <Loader
      size={sizeMap[size]}
      className="text-[var(--accent)] animate-spin"
      role="status"
      aria-label="로딩 중"
    />
  );
}
