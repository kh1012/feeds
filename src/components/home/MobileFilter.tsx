'use client';

import { useState } from 'react';
import { VisitedBadge } from '@/components/common/VisitedBadge';

type TagCount = {
  name: string;
  count: number;
};

type MobileFilterProps = {
  visitorCount: number | null;
  isVisitorLoading: boolean;
  totalCount: number;
  domainCounts: TagCount[];
  categoryCounts: TagCount[];
  keywordCounts: TagCount[];
};

export function MobileFilter({
  visitorCount,
  isVisitorLoading,
  totalCount,
  domainCounts,
  categoryCounts,
  keywordCounts,
}: MobileFilterProps) {
  const [expanded, setExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <div className="lg:hidden bg-[var(--card-bg)] border-b border-[var(--card-border)]/60">
      {/* Visited + 기록 수 + 요약 토글 (한 줄) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <VisitedBadge count={visitorCount} isLoading={isVisitorLoading} />
          <span className="text-sm font-semibold text-[var(--foreground)]">{totalCount}개의 기록</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-[var(--text-muted)]">요약</span>
          <ChevronIcon expanded={expanded} />
        </div>
      </div>

      {/* 확장되는 요약 영역 */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Domain */}
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Domain</h3>
            <div className="flex flex-wrap gap-2">
              {domainCounts.map(({ name, count }) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground)] bg-[var(--hover-bg)] px-2.5 py-1 rounded-full"
                >
                  {name}
                  <span className="text-xs text-[var(--text-muted)]">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categoryCounts.map(({ name, count }) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground)] bg-[var(--hover-bg)] px-2.5 py-1 rounded-full"
                >
                  {name}
                  <span className="text-xs text-[var(--text-muted)]">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Keywords (상위 10개) */}
          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-1.5">
              {keywordCounts.map(({ name, count }) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] bg-[var(--hover-bg)] px-2 py-1 rounded-full"
                >
                  {name}
                  <span className="text-[var(--text-muted)]">{count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
        expanded ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
