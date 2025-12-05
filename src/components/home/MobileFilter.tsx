'use client';

import { useState } from 'react';
import { VisitedBadge } from '@/components/common/VisitedBadge';
import { FilterSelect } from '@/components/common/FilterSelect';

type MobileFilterProps = {
  visitorCount: number | null;
  isVisitorLoading: boolean;
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  selectedDomain: string | null;
  selectedCategory: string | null;
  domains: string[];
  categories: string[];
  onDomainChange: (domain: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onResetFilters: () => void;
};

export function MobileFilter({
  visitorCount,
  isVisitorLoading,
  filteredCount,
  totalCount,
  hasActiveFilters,
  selectedDomain,
  selectedCategory,
  domains,
  categories,
  onDomainChange,
  onCategoryChange,
  onResetFilters,
}: MobileFilterProps) {
  const [expanded, setExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <div className="lg:hidden bg-white border-b border-neutral-200">
      {/* Visited 배지 */}
      <div className="px-4 pt-3 pb-1">
        <VisitedBadge count={visitorCount} isLoading={isVisitorLoading} />
      </div>

      {/* 기록 카운트 + 토글 버튼 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-neutral-800">{filteredCount}개의 기록</span>
          {hasActiveFilters && (
            <span className="text-sm text-neutral-400">(전체 {totalCount}개 중)</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResetFilters();
              }}
              className="px-2 py-1 text-sm text-blue-500 hover:text-blue-600"
            >
              초기화
            </button>
          )}
          <ChevronIcon expanded={expanded} />
        </div>
      </div>

      {/* 확장되는 필터 영역 */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          <FilterSelect
            label="Domain"
            value={selectedDomain}
            options={domains}
            placeholder="All Domains"
            onChange={onDomainChange}
          />
          <FilterSelect
            label="Category"
            value={selectedCategory}
            options={categories}
            placeholder="All Categories"
            onChange={onCategoryChange}
          />
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-neutral-400 transition-transform shrink-0 ${
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
