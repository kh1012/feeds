'use client';

import { useState, useMemo } from 'react';
import { FeedCard } from '@/components/home/FeedCard';
import { Spinner } from '@/components/common/Spinner';
import PortalOverlay from '@/components/common/PortalOverlay';
import { HEIGHTS } from '@/define/heightDefines';
import { useGetFeedContents, extractFilters, filterDocs } from '@/hooks/useGetFeedContents';
import { useVisitorCount } from '@/hooks/useVisitorCount';

// 카테고리명 포맷팅
function formatName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 작은 인라인 스피너
function MiniSpinner() {
  return (
    <span
      className="inline-block w-3 h-3 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"
      role="status"
      aria-label="로딩 중"
    />
  );
}

export default function HomeViewContent() {
  const { data: contents, isPending, isError } = useGetFeedContents();
  const { count: visitorCount, isLoading: isVisitorLoading } = useVisitorCount();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileFilterExpanded, setMobileFilterExpanded] = useState(false);

  // 필터 옵션 추출
  const filterOptions = useMemo(() => {
    if (!contents) return { domains: [], categories: [] };
    return extractFilters(contents);
  }, [contents]);

  // 선택된 도메인에 해당하는 카테고리만 필터링
  const availableCategories = useMemo(() => {
    if (!contents) return [];
    if (!selectedDomain) return filterOptions.categories;

    const categoriesInDomain = new Set<string>();
    for (const doc of contents) {
      if (doc.domain === selectedDomain) {
        categoriesInDomain.add(doc.category);
      }
    }
    return Array.from(categoriesInDomain).sort();
  }, [contents, selectedDomain, filterOptions.categories]);

  // 필터링된 콘텐츠
  const filteredContents = useMemo(() => {
    if (!contents) return [];
    return filterDocs(contents, {
      domain: selectedDomain,
      category: selectedCategory,
    });
  }, [contents, selectedDomain, selectedCategory]);

  // 도메인 선택 핸들러
  const handleDomainChange = (domain: string | null) => {
    setSelectedDomain(domain);
    // 도메인 변경 시 카테고리 초기화
    if (domain !== selectedDomain) {
      setSelectedCategory(null);
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedDomain(null);
    setSelectedCategory(null);
  };

  // 최초 로딩 시에만 스피너 표시 (캐시된 데이터가 있으면 표시 안 함)
  if (isPending && !contents) {
    return (
      <PortalOverlay>
        <Spinner />
      </PortalOverlay>
    );
  }

  if (isError || !contents || contents.length === 0) {
    return (
      <div
        className="w-full flex justify-center items-center text-neutral-500 py-20"
        style={{ marginTop: HEIGHTS.GNB_HEIGHT }}
      >
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const hasActiveFilters = selectedDomain || selectedCategory;

  return (
    <div style={{ marginTop: HEIGHTS.GNB_HEIGHT }}>
      {/* 모바일: 상단 필터 (접히는 형태) */}
      <div className="lg:hidden bg-white border-b border-neutral-200">
        {/* Visited 태그 */}
        <div className="px-4 pt-3 pb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            Visited {isVisitorLoading ? <MiniSpinner /> : visitorCount?.toLocaleString()}
          </span>
        </div>

        {/* 기록 카운트 + 토글 버튼 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setMobileFilterExpanded(!mobileFilterExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setMobileFilterExpanded(!mobileFilterExpanded);
            }
          }}
          className="w-full px-4 py-3 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-neutral-800">
              {filteredContents.length}개의 기록
            </span>
            {hasActiveFilters && (
              <span className="text-sm text-neutral-400">(전체 {contents.length}개 중)</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* 초기화 버튼 */}
            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetFilters();
                }}
                className="px-2 py-1 text-sm text-blue-500 hover:text-blue-600"
              >
                초기화
              </button>
            )}
            {/* 화살표 아이콘 */}
            <svg
              className={`w-5 h-5 text-neutral-400 transition-transform shrink-0 ${
                mobileFilterExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* 확장되는 필터 영역 */}
        {mobileFilterExpanded && (
          <div className="px-4 pb-3 space-y-2">
            {/* Domain 필터 */}
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Domain</label>
              <div className="relative">
                <select
                  value={selectedDomain ?? ''}
                  onChange={(e) => handleDomainChange(e.target.value || null)}
                  className="w-full px-3 py-2 pr-8 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="" className="text-base py-2">
                    All Domains
                  </option>
                  {filterOptions.domains.map((domain) => (
                    <option key={domain} value={domain} className="text-base py-2">
                      {formatName(domain)}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Category 필터 */}
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Category</label>
              <div className="relative">
                <select
                  value={selectedCategory ?? ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 pr-8 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="" className="text-base py-2">
                    All Categories
                  </option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category} className="text-base py-2">
                      {formatName(category)}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="h-2 bg-neutral-100"></div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="bg-neutral-100 lg:bg-neutral-50 min-h-screen">
        <div className="mx-auto lg:px-6 lg:py-4" style={{ maxWidth: 1248 }}>
          <div className="flex gap-6">
            {/* PC: 좌측 필터 패널 */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-16">
                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                  {/* Visited 태그 */}
                  <div className="mb-3 pb-3 border-b border-neutral-200">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Visited {isVisitorLoading ? <MiniSpinner /> : visitorCount?.toLocaleString()}
                    </span>
                  </div>

                  <h2 className="text-sm font-semibold text-neutral-800 mb-3">필터</h2>

                  {/* Domain 필터 */}
                  <div className="mb-3">
                    <label className="text-xs text-neutral-500 mb-1 block">Domain</label>
                    <div className="relative">
                      <select
                        value={selectedDomain ?? ''}
                        onChange={(e) => handleDomainChange(e.target.value || null)}
                        className="w-full px-3 py-2 pr-8 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">All Domains</option>
                        {filterOptions.domains.map((domain) => (
                          <option key={domain} value={domain}>
                            {formatName(domain)}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Category 필터 */}
                  <div className="mb-4">
                    <label className="text-xs text-neutral-500 mb-1 block">Category</label>
                    <div className="relative">
                      <select
                        value={selectedCategory ?? ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                        className="w-full px-3 py-2 pr-8 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">All Categories</option>
                        {availableCategories.map((category) => (
                          <option key={category} value={category}>
                            {formatName(category)}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* 필터 초기화 */}
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="w-full px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors mb-4"
                    >
                      초기화
                    </button>
                  )}

                  {/* 결과 카운트 */}
                  <div className="pt-3 border-t border-neutral-200">
                    <p className="text-base font-semibold text-neutral-800">
                      {filteredContents.length}개의 기록
                    </p>
                    {hasActiveFilters && (
                      <p className="text-xs text-neutral-400 mt-1">전체 {contents.length}개 중</p>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* 피드 영역 */}
            <div className="flex-1 min-w-0" style={{ maxWidth: 1000 }}>
              {/* 피드 카드 목록 */}
              <div className="flex flex-col gap-2 lg:gap-4">
                {filteredContents.map((content) => (
                  <FeedCard
                    key={content.rawUrl}
                    content={{
                      title: content.title,
                      url: content.url,
                      rawUrl: content.rawUrl,
                      date: content.date,
                      slug: content.title,
                    }}
                    meta={content}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
