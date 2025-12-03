'use client';

import { useState, useMemo } from 'react';
import { FeedCard } from '@/components/home/FeedCard';
import { MobileFilter } from '@/components/home/MobileFilter';
import { DesktopFilterPanel } from '@/components/home/DesktopFilterPanel';
import { Spinner } from '@/components/common/Spinner';
import PortalOverlay from '@/components/common/PortalOverlay';
import { HEIGHTS } from '@/define/heightDefines';
import { useGetFeedContents, extractFilters, filterDocs } from '@/hooks/useGetFeedContents';
import { useVisitorCount } from '@/hooks/useVisitorCount';

export default function HomeViewContent() {
  const { data: contents, isPending, isError } = useGetFeedContents();
  const { count: visitorCount, isLoading: isVisitorLoading } = useVisitorCount();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    if (domain !== selectedDomain) {
      setSelectedCategory(null);
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedDomain(null);
    setSelectedCategory(null);
  };

  // 최초 로딩 시에만 스피너 표시
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

  const hasActiveFilters = selectedDomain !== null || selectedCategory !== null;

  // 공통 필터 props
  const filterProps = {
    visitorCount,
    isVisitorLoading,
    filteredCount: filteredContents.length,
    totalCount: contents.length,
    hasActiveFilters,
    selectedDomain,
    selectedCategory,
    domains: filterOptions.domains,
    categories: availableCategories,
    onDomainChange: handleDomainChange,
    onCategoryChange: setSelectedCategory,
    onResetFilters: handleResetFilters,
  };

  return (
    <div style={{ marginTop: HEIGHTS.GNB_HEIGHT }}>
      {/* 모바일 필터 */}
      <MobileFilter {...filterProps} />

      {/* 메인 콘텐츠 영역 */}
      <div className="bg-neutral-100 lg:bg-neutral-50 min-h-screen">
        <div className="mx-auto lg:px-6 lg:py-4" style={{ maxWidth: 1248 }}>
          <div className="flex gap-6">
            {/* PC 필터 패널 */}
            <DesktopFilterPanel {...filterProps} />

            {/* 피드 영역 */}
            <div className="flex-1 min-w-0" style={{ maxWidth: 1000 }}>
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
