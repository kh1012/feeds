import { VisitedBadge } from '@/components/common/VisitedBadge';
import { FilterSelect } from '@/components/common/FilterSelect';

type DesktopFilterPanelProps = {
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

export function DesktopFilterPanel({
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
}: DesktopFilterPanelProps) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-16">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          {/* Visited 배지 */}
          <div className="mb-3 pb-3 border-b border-neutral-200">
            <VisitedBadge count={visitorCount} isLoading={isVisitorLoading} />
          </div>

          <h2 className="text-sm font-semibold text-neutral-800 mb-3">필터</h2>

          {/* Domain 필터 */}
          <div className="mb-3">
            <FilterSelect
              label="Domain"
              value={selectedDomain}
              options={domains}
              placeholder="All Domains"
              onChange={onDomainChange}
            />
          </div>

          {/* Category 필터 */}
          <div className="mb-4">
            <FilterSelect
              label="Category"
              value={selectedCategory}
              options={categories}
              placeholder="All Categories"
              onChange={onCategoryChange}
            />
          </div>

          {/* 필터 초기화 */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="w-full px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors mb-4"
            >
              초기화
            </button>
          )}

          {/* 결과 카운트 */}
          <div className="pt-3 border-t border-neutral-200">
            <p className="text-base font-semibold text-neutral-800">
              {filteredCount}개의 기록
            </p>
            {hasActiveFilters && (
              <p className="text-xs text-neutral-400 mt-1">전체 {totalCount}개 중</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

