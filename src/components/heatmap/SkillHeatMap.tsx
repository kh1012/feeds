'use client';

import { useMemo, useState, useRef, useEffect, useTransition } from 'react';
import type { DomainTreeData, CategoryTopicData, TopicDocInfo } from './matrixBuilder';
import { HEIGHTS } from '@/define/heightDefines';
import { formatDateWithDay } from '@/utils/dateUtils';
import {
  getTopicReviewLevel,
  getHighestReviewLevel,
  needsReview,
  REVIEW_LEVEL_CONFIG,
  type ReviewLevel,
} from '@/utils/reviewUtils';
import { Spinner } from '@/components/common/Spinner';

interface SkillHeatMapProps {
  data: DomainTreeData[];
}

// 학습 상태 정의
type TopicStatus = 'NOT_STARTED' | 'STARTED' | 'FOCUSED' | 'MASTERED';

// count 기반 상태 계산
function getTopicStatus(count: number): TopicStatus {
  if (count === 0) return 'NOT_STARTED';
  if (count === 1) return 'STARTED';
  if (count >= 2 && count <= 4) return 'FOCUSED';
  return 'MASTERED'; // count >= 5
}

// 상태별 색상
const STATUS_COLORS: Record<TopicStatus, { bg: string; text: string }> = {
  NOT_STARTED: { bg: '#f6f8fa', text: '#9ca3af' },
  STARTED: { bg: '#9be9a8', text: '#1f2328' },
  FOCUSED: { bg: '#40c463', text: '#ffffff' },
  MASTERED: { bg: '#216e39', text: '#ffffff' },
};

// 상태별 라벨
const STATUS_LABELS: Record<TopicStatus, string> = {
  NOT_STARTED: 'Not Started',
  STARTED: 'Started',
  FOCUSED: 'Focused',
  MASTERED: 'Mastered',
};

// 재활성(Re-active) 인디케이터 컴포넌트
function ReviewIndicator({ level, size = 'sm' }: { level: ReviewLevel; size?: 'sm' | 'md' }) {
  if (!needsReview(level)) return null;

  const config = REVIEW_LEVEL_CONFIG[level];
  const sizeClasses = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <span
      className={`absolute -top-0.5 -right-0.5 ${sizeClasses} rounded-full border border-white`}
      style={{ backgroundColor: config.color }}
      title={config.description}
    />
  );
}

// 상태별 조건 설명
const STATUS_CONDITIONS: Record<TopicStatus, string> = {
  NOT_STARTED: 'count = 0',
  STARTED: 'count = 1',
  FOCUSED: '2 ≤ count ≤ 4',
  MASTERED: 'count ≥ 5',
};

// 카테고리 진행률 계산 (Started + Focused + Mastered / 전체)
function calculateCategoryProgress(category: CategoryTopicData): number {
  const total = category.topics.length;
  if (total === 0) return 0;

  const completed = category.topics.filter((t) => t.docs.length > 0).length;
  return (completed / total) * 100;
}

// 토픽명을 축약형으로 변환 (kebab-case → 앞글자 조합)
function abbreviateTopic(topic: string): string {
  const parts = topic.split('-');
  if (parts.length === 1) {
    return topic.slice(0, 4).toUpperCase();
  }
  // 각 파트의 첫 글자를 대문자로 조합
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

// 카테고리명을 표시용으로 변환
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 도메인명을 표시용으로 변환
function formatDomainName(domain: string): string {
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

// 토픽명을 표시용으로 변환
function formatTopicName(topic: string): string {
  return topic
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 문자열에서 첫 두 글자 추출 (대문자)
function getFirstTwoChars(str: string): string {
  const clean = str.replace(/[-_]/g, '');
  return clean.slice(0, 2).toUpperCase();
}

// 카테고리 아이콘 컴포넌트
function CategoryIcon({ category }: { category: string }) {
  // 특정 카테고리에 대한 커스텀 설정
  const iconConfig: Record<string, { text: string; bg: string; color: string }> = {
    javascript: { text: 'JS', bg: '#f7df1e', color: '#000' },
    typescript: { text: 'TS', bg: '#3178c6', color: '#fff' },
    react: { text: 'Re', bg: '#61dafb', color: '#000' },
    nextjs: { text: 'Nx', bg: '#000', color: '#fff' },
    'state-management': { text: 'SM', bg: '#764abc', color: '#fff' },
    'server-state': { text: 'RQ', bg: '#ff4154', color: '#fff' },
    performance: { text: 'Pf', bg: '#ff6b00', color: '#fff' },
    'ui-ux': { text: 'UX', bg: '#ff69b4', color: '#fff' },
    css: { text: 'CS', bg: '#264de4', color: '#fff' },
    testing: { text: 'Te', bg: '#15c213', color: '#fff' },
    'build-infra': { text: 'CI', bg: '#2088ff', color: '#fff' },
    troubleshoot: { text: 'Tr', bg: '#e53935', color: '#fff' },
  };

  // 커스텀 설정이 있으면 사용, 없으면 기본 (첫 두 글자 + 기본 색상)
  const config = iconConfig[category] || {
    text: getFirstTwoChars(category),
    bg: '#6b7280',
    color: '#fff',
  };

  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold shrink-0"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.text}
    </span>
  );
}

// 도메인 아이콘 컴포넌트
function DomainIcon({ domain }: { domain: string }) {
  // 특정 도메인에 대한 커스텀 설정
  const iconConfig: Record<string, { text: string; bg: string; color: string }> = {
    frontend: { text: 'FE', bg: '#3b82f6', color: '#fff' },
    backend: { text: 'BE', bg: '#10b981', color: '#fff' },
    devops: { text: 'DO', bg: '#f59e0b', color: '#fff' },
    database: { text: 'DB', bg: '#8b5cf6', color: '#fff' },
    mobile: { text: 'Mo', bg: '#ec4899', color: '#fff' },
  };

  // 커스텀 설정이 있으면 사용, 없으면 기본 (첫 두 글자 + 기본 색상)
  const config = iconConfig[domain] || {
    text: getFirstTwoChars(domain),
    bg: '#6b7280',
    color: '#fff',
  };

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.text}
    </span>
  );
}

// 상태 레전드 아이템 (툴팁 포함)
function StatusLegendItem({ status }: { status: TopicStatus }) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const condition = STATUS_CONDITIONS[status];

  return (
    <div className="group relative flex items-center gap-1.5 cursor-help">
      <div
        className="w-2.5 h-2.5 rounded-sm"
        style={{
          backgroundColor: colors.bg,
          border: status === 'NOT_STARTED' ? '1px solid #d0d7de' : 'none',
        }}
      />
      <span>{label}</span>

      {/* 조건 툴팁 (아래 방향) */}
      <div
        className={`
          absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2
          px-2 py-1 rounded shadow-lg
          bg-neutral-800 text-white text-[10px] whitespace-nowrap
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-opacity duration-150 pointer-events-none
        `}
      >
        <span className="font-mono">{condition}</span>
        {/* 툴팁 화살표 (위쪽) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-neutral-800" />
      </div>
    </div>
  );
}

// 축소된 FeedCard 컴포넌트
function CompactFeedCard({ doc }: { doc: TopicDocInfo }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-neutral-200">
      <p className="text-xs text-neutral-500 mb-1">{formatDateWithDay(doc.date)}</p>
      <h4 className="text-sm font-medium text-neutral-900 truncate">{doc.title}</h4>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline truncate block mt-1"
      >
        GitHub에서 보기
      </a>
    </div>
  );
}

// 플로팅 카드 패널 (PC용)
function FloatingCardPanel({
  topic,
  position,
  onClose,
}: {
  topic: { name: string; docs: TopicDocInfo[] };
  position: { x: number; y: number; showLeft: boolean };
  onClose: () => void;
}) {
  return (
    <div
      className="fixed z-50 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden"
      style={{
        top: position.y,
        left: position.showLeft ? position.x - 288 : position.x + 16,
      }}
    >
      <div className="flex items-center justify-between p-3 border-b border-neutral-100 bg-neutral-50">
        <h4 className="text-sm font-medium text-neutral-900">{formatTopicName(topic.name)}</h4>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {topic.docs.map((doc, idx) => (
          <CompactFeedCard key={idx} doc={doc} />
        ))}
      </div>
    </div>
  );
}

export default function SkillHeatMap({ data }: SkillHeatMapProps) {
  // 선택된 카테고리가 속한 도메인 찾기
  const findDomainForCategory = (category: string | null): string | null => {
    if (!category) return null;
    for (const domain of data) {
      if (domain.categories.some((c) => c.category === category)) {
        return domain.domain;
      }
    }
    return null;
  };

  const initialSelectedCategory = 'javascript';
  const initialDomain = findDomainForCategory(initialSelectedCategory);

  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(initialDomain ? [initialDomain] : []),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialSelectedCategory);
  const [selectedTopic, setSelectedTopic] = useState<{
    name: string;
    docs: TopicDocInfo[];
  } | null>(null);
  const [floatingPosition, setFloatingPosition] = useState<{
    x: number;
    y: number;
    showLeft: boolean;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listSortBy, setListSortBy] = useState<'default' | 'status'>('default');
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef<HTMLDivElement>(null);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 외부 클릭 시 플로팅 패널 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (floatingPosition && !(e.target as Element).closest('.floating-panel-trigger')) {
        setSelectedTopic(null);
        setFloatingPosition(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [floatingPosition]);

  // 선택된 카테고리의 데이터 찾기
  const selectedCategoryData = useMemo((): CategoryTopicData | null => {
    if (!selectedCategory) return null;
    for (const domain of data) {
      const found = domain.categories.find((c) => c.category === selectedCategory);
      if (found) return found;
    }
    return null;
  }, [data, selectedCategory]);

  // 선택된 카테고리가 속한 도메인 찾기
  const selectedDomain = useMemo((): string | null => {
    if (!selectedCategory) return null;
    for (const domain of data) {
      const found = domain.categories.find((c) => c.category === selectedCategory);
      if (found) return domain.domain;
    }
    return null;
  }, [data, selectedCategory]);

  // 전체 총합
  const totalLength = data.reduce((sum, d) => sum + d.totalValue, 0);

  // 데이터가 있는 카테고리만 필터링
  const filteredData = useMemo(() => {
    return data
      .map((domain) => ({
        ...domain,
        categories: domain.categories.filter((cat) => cat.totalValue > 0),
      }))
      .filter((domain) => domain.categories.length > 0);
  }, [data]);

  // 상태별 토픽 개수 계산
  const statusCounts = useMemo(() => {
    if (!selectedCategoryData)
      return { total: 0, NOT_STARTED: 0, STARTED: 0, FOCUSED: 0, MASTERED: 0 };

    const counts = selectedCategoryData.topics.reduce(
      (acc, topic) => {
        const status = getTopicStatus(topic.docs.length);
        acc[status]++;
        acc.total++;
        return acc;
      },
      { total: 0, NOT_STARTED: 0, STARTED: 0, FOCUSED: 0, MASTERED: 0 },
    );
    return counts;
  }, [selectedCategoryData]);

  // 정렬된 토픽 목록 (리스트 뷰용)
  const sortedTopics = useMemo(() => {
    if (!selectedCategoryData) return [];

    const topics = [...selectedCategoryData.topics];

    if (listSortBy === 'status') {
      // 상태순: MASTERED > FOCUSED > STARTED > NOT_STARTED
      const statusOrder: Record<TopicStatus, number> = {
        MASTERED: 4,
        FOCUSED: 3,
        STARTED: 2,
        NOT_STARTED: 1,
      };

      topics.sort((a, b) => {
        const statusA = getTopicStatus(a.docs.length);
        const statusB = getTopicStatus(b.docs.length);
        return statusOrder[statusB] - statusOrder[statusA];
      });
    }
    // default: 원본 순서 유지

    return topics;
  }, [selectedCategoryData, listSortBy]);

  // 도메인 펼치기/접기 토글
  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  // 토픽 클릭 핸들러
  const handleTopicClick = (
    e: React.MouseEvent,
    topic: { name: string; value: number; docs: TopicDocInfo[] },
  ) => {
    if (topic.docs.length === 0) return;

    e.stopPropagation();

    if (isMobile) {
      // 모바일: 하단에 표시
      setSelectedTopic({ name: topic.name, docs: topic.docs });
      setFloatingPosition(null);
    } else {
      // PC: 플로팅으로 표시
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const showLeft = rect.right + 300 > viewportWidth;

      setSelectedTopic({ name: topic.name, docs: topic.docs });
      setFloatingPosition({
        x: showLeft ? rect.left : rect.right,
        y: rect.top,
        showLeft,
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row sm:gap-12" style={{ marginTop: HEIGHTS.GNB_HEIGHT }}>
      {/* GitHub 스타일 사이드바 */}
      <div className="lg:w-72 shrink-0 pb-4 border-b border-neutral-100 lg:pb-0 sm:border-none">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-neutral-500">Total Points</span>
          <span className="text-xs font-semibold text-neutral-700">{totalLength}</span>
        </div>

        {/* 트리 네비게이션 */}
        <nav className=" bg-white overflow-hidden space-y-4 sm:space-y-2">
          {filteredData.map((domainData) => {
            const isExpanded = expandedDomains.has(domainData.domain);
            // 도메인 내 모든 토픽의 재활성 레벨 계산
            const domainReviewLevels = domainData.categories
              .flatMap((cat) => cat.topics.filter((t) => t.docs.length > 0))
              .map((t) =>
                getTopicReviewLevel(
                  t.docs.map((d) => d.date),
                  t.docs.length,
                  domainData.domain,
                ),
              );
            const domainHighestReview = getHighestReviewLevel(domainReviewLevels);
            const domainNeedsReview = needsReview(domainHighestReview);

            return (
              <div key={domainData.domain}>
                {/* 도메인 헤더 (펼치기/접기) */}
                <button
                  onClick={() => toggleDomain(domainData.domain)}
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
                    <span className="text-sm font-medium text-neutral-900">
                      {formatDomainName(domainData.domain)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{domainData.totalValue}</span>
                    <svg
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* 카테고리 목록 (데이터가 있는 것만 표시) */}
                {isExpanded && (
                  <div className="mt-2 ml-4 space-y-1">
                    {domainData.categories.map((cat) => {
                      const isSelected = selectedCategory === cat.category;
                      const progress = calculateCategoryProgress(cat);
                      // 카테고리 내 토픽들의 재활성 레벨 계산
                      const categoryReviewLevels = cat.topics
                        .filter((t) => t.docs.length > 0)
                        .map((t) =>
                          getTopicReviewLevel(
                            t.docs.map((d) => d.date),
                            t.docs.length,
                            domainData.domain,
                          ),
                        );
                      const categoryHighestReview = getHighestReviewLevel(categoryReviewLevels);
                      const categoryNeedsReview = needsReview(categoryHighestReview);

                      return (
                        <button
                          key={cat.category}
                          onClick={() => {
                            setSelectedCategory(cat.category);
                            setSelectedTopic(null);
                            setFloatingPosition(null);
                          }}
                          className={`
                            w-full flex flex-col justify-center gap-2 px-4 py-1 sm:py-2 relative
                            transition-all cursor-pointer text-left rounded-md
                            before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:transition-colors
                            ${
                              isSelected
                                ? 'before:bg-blue-500'
                                : 'hover:bg-neutral-50 before:bg-transparent'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 relative">
                              <CategoryIcon category={cat.category} />
                              {categoryNeedsReview && (
                                <span
                                  className="absolute -top-0.5 left-3.5 w-2 h-2 rounded-full border border-white"
                                  style={{
                                    backgroundColor:
                                      REVIEW_LEVEL_CONFIG[categoryHighestReview].color,
                                  }}
                                />
                              )}
                              <span
                                className={`text-sm ${
                                  isSelected ? 'font-medium text-blue-700' : 'text-neutral-700'
                                }`}
                              >
                                {formatCategoryName(cat.category)}
                              </span>
                            </div>
                            <span
                              className={`text-xs ${
                                isSelected ? 'text-blue-600' : 'text-neutral-400'
                              }`}
                            >
                              {cat.totalValue}
                            </span>
                          </div>
                          {/* 하단 프로그레스 바 */}
                          <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: isSelected ? '#3b82f6' : '#93c5fd',
                              }}
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

      {/* 토픽 그리드 영역 */}
      <div className="flex-1 overflow-visible">
        {!selectedCategory ? (
          <div className="flex items-center justify-center h-64 rounded-lg bg-white">
            <div className="text-center">
              <div className="text-4xl mb-3 text-neutral-300">←</div>
              <p className="text-neutral-500 text-sm">
                카테고리를 선택하면
                <br />
                상세 토픽을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        ) : selectedCategoryData ? (
          <div className="rounded-lg bg-white">
            {/* 헤더 */}
            <div className="flex flex-col gap-2 justify-between sm:flex-row sm:items-center pb-2 pt-4 sm:pb-4 sm:pt-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CategoryIcon category={selectedCategory} />
                <h3 className="text-sm font-semibold text-neutral-900">
                  {formatCategoryName(selectedCategory)}
                </h3>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-neutral-500 sm:justify-end">
                <StatusLegendItem status="NOT_STARTED" />
                <StatusLegendItem status="STARTED" />
                <StatusLegendItem status="FOCUSED" />
                <StatusLegendItem status="MASTERED" />
              </div>
            </div>

            {/* 재활성(Re-active) 레전드 + 뷰 모드 토글 + 필터 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {/* 좌측: 재활성(Re-active) 레전드 */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center sm:justify-start">
                <span className="font-medium text-neutral-600">Re-active:</span>
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: REVIEW_LEVEL_CONFIG.LEVEL_1.color }}
                  />
                  <span>1M</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: REVIEW_LEVEL_CONFIG.LEVEL_2.color }}
                  />
                  <span>3M</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: REVIEW_LEVEL_CONFIG.LEVEL_3.color }}
                  />
                  <span>6M</span>
                </div>
              </div>

              {/* 우측: 필터 + 뷰 모드 토글 */}
              <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0">
                {/* 리스트 모드 필터 */}
                {viewMode === 'list' && (
                  <select
                    value={listSortBy}
                    onChange={(e) => setListSortBy(e.target.value as 'default' | 'status')}
                    className="text-xs pl-2 pr-6 py-1 border border-neutral-200 rounded bg-white text-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-no-repeat bg-size-[12px] bg-position-[right_6px_center]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    }}
                  >
                    <option value="default">기본순</option>
                    <option value="status">상태순</option>
                  </select>
                )}

                {/* 뷰 모드 토글 */}
                <div className="flex items-center gap-0.5 bg-neutral-100 rounded p-0.5">
                  <button
                    onClick={() => {
                      if (viewMode === 'grid') return;
                      startTransition(() => setViewMode('grid'));
                    }}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                    title="그리드 뷰"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (viewMode === 'list') return;
                      startTransition(() => setViewMode('list'));
                    }}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                    title="리스트 뷰"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 상태별 개수 표기 */}
            <div className="flex items-center justify-center gap-4 py-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-neutral-500">Total</span>
                <span className="font-semibold text-neutral-700">{statusCounts.total}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: STATUS_COLORS.NOT_STARTED.bg,
                    border: '1px solid #d0d7de',
                  }}
                />
                <span className="text-neutral-400">{statusCounts.NOT_STARTED}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS.STARTED.bg }}
                />
                <span className="text-neutral-500">{statusCounts.STARTED}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS.FOCUSED.bg }}
                />
                <span className="text-neutral-500">{statusCounts.FOCUSED}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS.MASTERED.bg }}
                />
                <span className="text-neutral-600 font-medium">{statusCounts.MASTERED}</span>
              </div>
            </div>

            {/* 토픽 영역 */}
            <div className="pb-5 pt-2 relative min-h-[200px]" ref={gridRef}>
              {/* 전환 중 로딩 표시 - 컨텐츠 완전히 숨김 */}
              {isPending ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner />
                </div>
              ) : viewMode === 'grid' ? (
                /* 그리드 뷰 */
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                  {selectedCategoryData.topics.map((topic) => {
                    const count = topic.docs.length;
                    const status = getTopicStatus(count);
                    const colors = STATUS_COLORS[status];
                    const isClickable = count > 0;
                    const isTopicSelected = selectedTopic?.name === topic.name;
                    const reviewLevel = getTopicReviewLevel(
                      topic.docs.map((d) => d.date),
                      count,
                      selectedDomain ?? undefined,
                    );
                    const hasReview = needsReview(reviewLevel);
                    const reviewConfig = REVIEW_LEVEL_CONFIG[reviewLevel];

                    return (
                      <div key={topic.name} className="group relative floating-panel-trigger">
                        <button
                          onClick={(e) => handleTopicClick(e, topic)}
                          disabled={!isClickable}
                          className={`
                            w-full aspect-square rounded flex flex-col items-center justify-center
                            transition-colors duration-150
                            ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-1' : 'cursor-default'}
                            ${isTopicSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                          `}
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            boxShadow: hasReview
                              ? `inset 0 0 0 3px ${reviewConfig.color}`
                              : undefined,
                          }}
                        >
                          <span className="text-[10px] font-semibold leading-tight">
                            {abbreviateTopic(topic.name)}
                          </span>
                          {count > 0 && (
                            <span className="text-[8px] opacity-70 mt-0.5">{count}</span>
                          )}
                        </button>
                        {/* 재활성 인디케이터 */}
                        <ReviewIndicator level={reviewLevel} />

                        {/* 툴팁 - PC only */}
                        <div
                          className={`
                            hidden sm:block absolute z-20 bottom-full mb-2
                            left-0 sm:left-1/2 sm:-translate-x-1/2
                            px-2 py-1 rounded shadow-lg
                            bg-neutral-800 text-white text-xs
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-opacity duration-150 pointer-events-none
                            min-w-max max-w-[180px]
                          `}
                        >
                          <div className="font-medium truncate">{formatTopicName(topic.name)}</div>
                          <div className="text-neutral-400 text-[10px] mt-0.5">
                            {count === 0
                              ? STATUS_LABELS.NOT_STARTED
                              : `${STATUS_LABELS[status]} (${count}회)`}
                          </div>
                          {/* 툴팁 화살표 */}
                          <div className="absolute top-full left-4 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 리스트 뷰 */
                <div className="space-y-1">
                  {sortedTopics.map((topic) => {
                    const count = topic.docs.length;
                    const status = getTopicStatus(count);
                    const colors = STATUS_COLORS[status];
                    const isClickable = count > 0;
                    const isTopicSelected = selectedTopic?.name === topic.name;
                    const reviewLevel = getTopicReviewLevel(
                      topic.docs.map((d) => d.date),
                      count,
                      selectedDomain ?? undefined,
                    );
                    const hasReview = needsReview(reviewLevel);
                    const reviewConfig = REVIEW_LEVEL_CONFIG[reviewLevel];

                    return (
                      <div key={topic.name} className="space-y-1">
                        <button
                          onClick={() => {
                            if (!isClickable) return;
                            // 리스트 뷰에서는 인라인 토글
                            if (selectedTopic?.name === topic.name) {
                              setSelectedTopic(null);
                            } else {
                              setSelectedTopic({ name: topic.name, docs: topic.docs });
                              setFloatingPosition(null);
                            }
                          }}
                          disabled={!isClickable}
                          className={`
                            w-full flex items-center gap-2 px-2.5 py-1.5 rounded border transition-colors
                            ${isClickable ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-default'}
                            ${isTopicSelected ? 'ring-1 ring-blue-500 border-blue-300 bg-blue-50' : 'border-neutral-100'}
                          `}
                        >
                          {/* 상태 표시 */}
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                              boxShadow: hasReview
                                ? `inset 0 0 0 2px ${reviewConfig.color}`
                                : undefined,
                            }}
                          >
                            <span className="text-[10px] font-bold">{count}</span>
                          </div>

                          {/* 토픽 정보 */}
                          <div className="flex-1 text-left min-w-0 flex items-center gap-1.5">
                            <span className="text-xs font-medium text-neutral-800 truncate">
                              {formatTopicName(topic.name)}
                            </span>
                            {hasReview && (
                              <span
                                className="px-1 py-0.5 text-[9px] font-medium rounded shrink-0"
                                style={{
                                  backgroundColor: reviewConfig.bgColor,
                                  color: reviewConfig.color,
                                }}
                              >
                                {reviewConfig.shortLabel}
                              </span>
                            )}
                          </div>

                          {/* 상태 라벨 + 화살표 */}
                          <span
                            className="text-[10px] font-medium shrink-0 px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                              border: status === 'NOT_STARTED' ? '1px solid #d0d7de' : 'none',
                            }}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                          {isClickable && (
                            <svg
                              className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform ${isTopicSelected ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          )}
                        </button>

                        {/* 인라인 문서 목록 (아코디언) */}
                        {isTopicSelected && (
                          <div className="ml-9 pl-2 border-l-2 border-blue-200 space-y-1 py-1">
                            {topic.docs
                              .sort((a, b) => (a.date < b.date ? 1 : -1))
                              .map((doc, idx) => (
                                <a
                                  key={idx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-2 py-1.5 bg-white rounded border border-neutral-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                >
                                  <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                                    {formatDateWithDay(doc.date)}
                                  </span>
                                  <span className="text-xs text-neutral-700 truncate flex-1">
                                    {doc.title.replace('.md', '')}
                                  </span>
                                  <svg
                                    className="w-3 h-3 text-neutral-300 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 모바일 그리드뷰: 선택된 토픽의 문서 목록 (하단) - 리스트뷰는 인라인 아코디언 사용 */}
            {isMobile && viewMode === 'grid' && selectedTopic && selectedTopic.docs.length > 0 && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {formatTopicName(selectedTopic.name)}
                    <span className="ml-2 text-xs font-normal text-neutral-500">
                      {selectedTopic.docs.length}개 문서
                    </span>
                  </h4>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTopic.docs
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-neutral-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                          {formatDateWithDay(doc.date)}
                        </span>
                        <span className="text-xs text-neutral-700 truncate flex-1">
                          {doc.title.replace('.md', '')}
                        </span>
                        <svg
                          className="w-3.5 h-3.5 text-neutral-300 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* PC: 플로팅 카드 패널 */}
      {!isMobile && selectedTopic && floatingPosition && (
        <FloatingCardPanel
          topic={selectedTopic}
          position={floatingPosition}
          onClose={() => {
            setSelectedTopic(null);
            setFloatingPosition(null);
          }}
        />
      )}
    </div>
  );
}
