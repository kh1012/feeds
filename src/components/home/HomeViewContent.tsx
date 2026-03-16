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
import { useGetFeedContents } from '@/hooks/useGetFeedContents';
import { useVisitorCount } from '@/hooks/useVisitorCount';
import { DocMetaWithUrl } from '@/define/metaDefines';
import { formatName } from '@/utils/formatUtils';

const ITEMS_PER_PAGE = 10;
const TOP_KEYWORDS_COUNT = 10;

type TagCount = { name: string; count: number };

/** 태그 카운트 계산 */
function computeTagCounts(docs: DocMetaWithUrl[]) {
  const domainMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const keywordMap = new Map<string, number>();

  for (const doc of docs) {
    domainMap.set(doc.domain, (domainMap.get(doc.domain) || 0) + 1);
    categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
    for (const kw of doc.keywords) {
      keywordMap.set(kw, (keywordMap.get(kw) || 0) + 1);
    }
  }

  const toSorted = (map: Map<string, number>): TagCount[] =>
    Array.from(map.entries())
      .map(([name, count]) => ({ name: formatName(name), count }))
      .sort((a, b) => b.count - a.count);

  return {
    domainCounts: toSorted(domainMap),
    categoryCounts: toSorted(categoryMap),
    keywordCounts: toSorted(keywordMap).slice(0, TOP_KEYWORDS_COUNT),
  };
}

export default function HomeViewContent() {
  const { data: contents, isPending, isError } = useGetFeedContents();
  const { count: visitorCount, isLoading: isVisitorLoading } = useVisitorCount();
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 태그 카운트 계산
  const tagCounts = useMemo(() => {
    if (!contents) return { domainCounts: [], categoryCounts: [], keywordCounts: [] };
    return computeTagCounts(contents);
  }, [contents]);

  // 현재 표시할 콘텐츠
  const displayedContents = useMemo(() => {
    if (!contents) return [];
    return contents.slice(0, displayCount);
  }, [contents, displayCount]);

  // 더 불러올 수 있는지 여부
  const hasMore = contents ? displayCount < contents.length : false;

  // 더 불러오기 함수
  const loadMore = useCallback(() => {
    if (hasMore && contents) {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, contents.length));
    }
  }, [hasMore, contents]);

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
        className="w-full flex justify-center items-center text-[var(--text-muted)] py-20"
        style={{ marginTop: HEIGHTS.GNB_HEIGHT }}
      >
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const summaryProps = {
    visitorCount,
    isVisitorLoading,
    totalCount: contents.length,
    ...tagCounts,
  };

  return (
    <div style={{ marginTop: HEIGHTS.GNB_HEIGHT }}>
      {/* 모바일 요약 */}
      <MobileFilter {...summaryProps} />

      {/* 메인 콘텐츠 영역 */}
      <div className="bg-[var(--background)] min-h-screen">
        <div className="mx-auto lg:px-8 lg:py-6" style={{ maxWidth: 1248 }}>
          <div className="flex gap-8">
            {/* PC 요약 패널 */}
            <DesktopFilterPanel {...summaryProps} />

            {/* 피드 영역 */}
            <div className="flex-1 min-w-0" style={{ maxWidth: 1000 }}>
              {/* GitHub Contribution Graph */}
              <div className="mb-6 px-4 lg:px-0 pt-5 lg:pt-0">
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
                    className="flex justify-center items-center py-10"
                  >
                    <MiniSpinner />
                  </div>
                )}

                {/* 모두 로드됨 표시 */}
                {!hasMore && displayedContents.length > 0 && (
                  <div className="text-center py-10 text-sm text-[var(--text-muted)]">
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
