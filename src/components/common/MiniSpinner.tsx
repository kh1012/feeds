type MiniSpinnerProps = {
  /** 스피너 크기 (기본값: 'sm') */
  size?: 'xs' | 'sm' | 'md';
  /** 스피너 색상 클래스 (기본값: emerald) */
  colorClass?: string;
};

const sizeClasses = {
  xs: 'w-2.5 h-2.5 border',
  sm: 'w-3 h-3 border-2',
  md: 'w-4 h-4 border-2',
} as const;

/**
 * 작은 인라인 스피너 컴포넌트
 */
export function MiniSpinner({ size = 'sm', colorClass }: MiniSpinnerProps) {
  const borderClass = colorClass ?? 'border-emerald-200 border-t-emerald-600';

  return (
    <span
      className={`inline-block rounded-full animate-spin ${sizeClasses[size]} ${borderClass}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}

