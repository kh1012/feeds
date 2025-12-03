import { getTopicReviewLevel, getHighestReviewLevel, needsReview, REVIEW_LEVEL_CONFIG } from '@/utils/reviewUtils';
import type { DomainTreeData } from './matrixBuilder';
import { DomainIcon, CategoryIcon } from './HeatmapIcons';
import { formatDomainName, formatCategoryName, calculateCategoryProgress } from './heatmapConstants';

interface HeatmapSidebarProps {
  data: DomainTreeData[];
  filteredData: DomainTreeData[];
  totalLength: number;
  expandedDomains: Set<string>;
  selectedCategory: string | null;
  onToggleDomain: (domain: string) => void;
  onSelectCategory: (category: string) => void;
}

export function HeatmapSidebar({
  filteredData,
  totalLength,
  expandedDomains,
  selectedCategory,
  onToggleDomain,
  onSelectCategory,
}: HeatmapSidebarProps) {
  return (
    <div className="lg:w-72 shrink-0 pb-4 border-b border-neutral-100 lg:pb-0 sm:border-none">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-neutral-500">Total Points</span>
        <span className="text-xs font-semibold text-neutral-700">{totalLength}</span>
      </div>

      {/* 트리 네비게이션 */}
      <nav className="bg-white overflow-hidden space-y-4 sm:space-y-2">
        {filteredData.map((domainData) => {
          const isExpanded = expandedDomains.has(domainData.domain);
          const domainReviewLevels = domainData.categories
            .flatMap((cat) => cat.topics.filter((t) => t.docs.length > 0))
            .map((t) => getTopicReviewLevel(t.docs.map((d) => d.date), t.docs.length, domainData.domain));
          const domainHighestReview = getHighestReviewLevel(domainReviewLevels);
          const domainNeedsReview = needsReview(domainHighestReview);

          return (
            <div key={domainData.domain}>
              {/* 도메인 헤더 */}
              <button
                onClick={() => onToggleDomain(domainData.domain)}
                className="w-full flex items-center justify-between hover:bg-neutral-50 hover:rounded-md transition-all cursor-pointer sm:py-2 sm:px-4"
              >
                <div className="flex items-center gap-2 relative">
                  <DomainIcon domain={domainData.domain} />
                  {domainNeedsReview && (
                    <span
                      className="absolute -top-0.5 left-4 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: REVIEW_LEVEL_CONFIG[domainHighestReview].color }}
                    />
                  )}
                  <span className="text-sm font-medium text-neutral-900">{formatDomainName(domainData.domain)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">{domainData.totalValue}</span>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* 카테고리 목록 */}
              {isExpanded && (
                <div className="mt-2 ml-4 space-y-1">
                  {domainData.categories.map((cat) => {
                    const isSelected = selectedCategory === cat.category;
                    const progress = calculateCategoryProgress(cat);
                    const categoryReviewLevels = cat.topics
                      .filter((t) => t.docs.length > 0)
                      .map((t) => getTopicReviewLevel(t.docs.map((d) => d.date), t.docs.length, domainData.domain));
                    const categoryHighestReview = getHighestReviewLevel(categoryReviewLevels);
                    const categoryNeedsReview = needsReview(categoryHighestReview);

                    return (
                      <button
                        key={cat.category}
                        onClick={() => onSelectCategory(cat.category)}
                        className={`
                          w-full flex flex-col justify-center gap-2 px-4 py-1 sm:py-2 relative
                          transition-all cursor-pointer text-left rounded-md
                          before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:transition-colors
                          ${isSelected ? 'before:bg-blue-500' : 'hover:bg-neutral-50 before:bg-transparent'}
                        `}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 relative">
                            <CategoryIcon category={cat.category} />
                            {categoryNeedsReview && (
                              <span
                                className="absolute -top-0.5 left-3.5 w-2 h-2 rounded-full border border-white"
                                style={{ backgroundColor: REVIEW_LEVEL_CONFIG[categoryHighestReview].color }}
                              />
                            )}
                            <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-neutral-700'}`}>
                              {formatCategoryName(cat.category)}
                            </span>
                          </div>
                          <span className={`text-xs ${isSelected ? 'text-blue-600' : 'text-neutral-400'}`}>
                            {cat.totalValue}
                          </span>
                        </div>
                        {/* 프로그레스 바 */}
                        <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%`, backgroundColor: isSelected ? '#3b82f6' : '#93c5fd' }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

