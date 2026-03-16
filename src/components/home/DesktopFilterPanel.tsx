'use client';

import { useState } from 'react';
import { VisitedBadge } from '@/components/common/VisitedBadge';

type TagCount = {
  name: string;
  count: number;
};

type DesktopFilterPanelProps = {
  visitorCount: number | null;
  isVisitorLoading: boolean;
  totalCount: number;
  domainCounts: TagCount[];
  categoryCounts: TagCount[];
  keywordCounts: TagCount[];
};

const PREVIEW_COUNT = 3;

function ExpandableTagList({
  label,
  items,
}: {
  label: string;
  items: TagCount[];
}) {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hasMore = items.length > PREVIEW_COUNT;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">{label}</h3>
      <div className="space-y-1.5">
        {displayItems.map(({ name, count }) => (
          <div key={name} className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground)] truncate mr-2">{name}</span>
            <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--hover-bg)] px-2 py-0.5 rounded-full shrink-0">
              {count}
            </span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer"
        >
          {expanded ? '접기' : `전체보기 (${items.length})`}
        </button>
      )}
    </div>
  );
}

export function DesktopFilterPanel({
  visitorCount,
  isVisitorLoading,
  totalCount,
  domainCounts,
  categoryCounts,
  keywordCounts,
}: DesktopFilterPanelProps) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-20">
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]/80 p-5 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          {/* Visited 배지 */}
          <div className="mb-4 pb-4 border-b border-[var(--light-border)]">
            <VisitedBadge count={visitorCount} isLoading={isVisitorLoading} />
          </div>

          {/* 전체 기록 수 */}
          <div className="mb-4 pb-4 border-b border-[var(--light-border)]">
            <p className="text-base font-semibold text-[var(--foreground)]">
              {totalCount}개의 기록
            </p>
          </div>

          {/* 요약 */}
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">요약</h2>

          {/* Domain 요약 */}
          <ExpandableTagList label="Domain" items={domainCounts} />

          {/* Category 요약 */}
          <ExpandableTagList label="Category" items={categoryCounts} />

          {/* Keyword 요약 */}
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
      </div>
    </aside>
  );
}
