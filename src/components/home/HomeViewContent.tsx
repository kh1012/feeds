'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FeedCard } from '@/components/home/FeedCard';
import { MobileFilter } from '@/components/home/MobileFilter';
import { DesktopFilterPanel } from '@/components/home/DesktopFilterPanel';
import { ContributionGraph } from '@/components/home/ContributionGraph';
import { Spinner } from '@/components/common/Spinner';
import { MiniSpinner } from '@/components/common/MiniSpinner';
import PortalOverlay from '@/components/common/PortalOverlay';
import { HEIGHTS } from '@/define/heightDefines';
import { useGetFeedContents, extractFilters, filterDocs } from '@/hooks/useGetFeedContents';
import { useVisitorCount } from '@/hooks/useVisitorCount';

const ITEMS_PER_PAGE = 10;

export default function HomeViewContent() {
  const { data: contents, isPending, isError } = useGetFeedContents();
  const { count: visitorCount, isLoading: isVisitorLoading } = useVisitorCount();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // 필터 변경 시 displayCount 리셋
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [selectedDomain, selectedCategory]);

  // 현재 표시할 콘텐츠
  const displayedContents = useMemo(() => {
    return filteredContents.slice(0, displayCount);
  }, [filteredContents, displayCount]);

  // 더 불러올 수 있는지 여부
  const hasMore = displayCount < filteredContents.length;

  // 더 불러오기 함수
  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredContents.length));
    }
  }, [hasMore, filteredContents.length]);

  // IntersectionObserver로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadMore]);

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
              {/* GitHub Contribution Graph */}
              <div className="mb-4 px-4 lg:px-0 pt-4 lg:pt-0">
                <ContributionGraph />
              </div>

              <div className="flex flex-col gap-4 px-4 lg:px-0">
                {displayedContents.map((content) => (
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

                {/* 로딩 트리거 및 표시 */}
                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="flex justify-center items-center py-8"
                  >
                    <MiniSpinner />
                  </div>
                )}

                {/* 모두 로드됨 표시 */}
                {!hasMore && displayedContents.length > 0 && (
                  <div className="text-center py-8 text-sm text-neutral-400">
                    모든 피드를 불러왔습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
