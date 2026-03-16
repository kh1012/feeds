import { Loader, Eye } from 'lucide-react';

type VisitedBadgeProps = {
  count: number | null;
  isLoading: boolean;
};

export function VisitedBadge({ count, isLoading }: VisitedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--accent-light)] text-[var(--accent-text)]">
      <Eye size={12} />
      Visited {isLoading ? <Loader size={12} className="animate-spin" /> : count?.toLocaleString()}
    </span>
  );
}
