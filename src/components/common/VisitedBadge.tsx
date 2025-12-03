import { MiniSpinner } from './MiniSpinner';

type VisitedBadgeProps = {
  count: number | null;
  isLoading: boolean;
};

/**
 * 방문자 수를 표시하는 배지 컴포넌트
 */
export function VisitedBadge({ count, isLoading }: VisitedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fillRule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
      Visited {isLoading ? <MiniSpinner /> : count?.toLocaleString()}
    </span>
  );
}

