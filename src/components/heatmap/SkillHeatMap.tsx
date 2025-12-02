'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type { DomainTreeData, CategoryTopicData, TopicDocInfo } from './matrixBuilder';
import { HEIGHTS } from '@/define/heightDefines';
import { formatDateWithDay } from '@/utils/dateUtils';

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

      {/* 조건 툴팁 */}
      <div
        className={`
          absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2
          px-2 py-1 rounded shadow-lg
          bg-neutral-800 text-white text-[10px] whitespace-nowrap
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-opacity duration-150 pointer-events-none
        `}
      >
        <span className="font-mono">{condition}</span>
        {/* 툴팁 화살표 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
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
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(data.map((d) => d.domain))
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>('javascript');
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
    if (!selectedCategoryData) return { NOT_STARTED: 0, STARTED: 0, FOCUSED: 0, MASTERED: 0 };

    return selectedCategoryData.topics.reduce(
      (acc, topic) => {
        const status = getTopicStatus(topic.docs.length);
        acc[status]++;
        return acc;
      },
      { NOT_STARTED: 0, STARTED: 0, FOCUSED: 0, MASTERED: 0 }
    );
  }, [selectedCategoryData]);

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
    topic: { name: string; value: number; docs: TopicDocInfo[] }
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
    <div className="flex flex-col lg:flex-row gap-8" style={{ marginTop: HEIGHTS.GNB_HEIGHT }}>
      {/* GitHub 스타일 사이드바 */}
      <div className="lg:w-72 shrink-0">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-3 px-3">
          <span className="text-xs font-medium text-neutral-500">Total Points</span>
          <span className="text-xs font-semibold text-neutral-700">{totalLength}</span>
        </div>

        {/* 트리 네비게이션 */}
        <nav className="rounded-lg bg-white overflow-hidden space-y-2">
          {filteredData.map((domainData) => {
            const isExpanded = expandedDomains.has(domainData.domain);

            return (
              <div key={domainData.domain}>
                {/* 도메인 헤더 (펼치기/접기) */}
                <button
                  onClick={() => toggleDomain(domainData.domain)}
                  className="w-full h-8 flex items-center justify-between px-4 hover:bg-neutral-50 hover:rounded-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <DomainIcon domain={domainData.domain} />
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
                  <div className="mt-1 space-y-0.5">
                    {domainData.categories.map((cat) => {
                      const isSelected = selectedCategory === cat.category;
                      const progress = calculateCategoryProgress(cat);

                      return (
                        <button
                          key={cat.category}
                          onClick={() => {
                            setSelectedCategory(cat.category);
                            setSelectedTopic(null);
                            setFloatingPosition(null);
                          }}
                          className={`
                            w-full h-8 flex items-center justify-between pl-8 pr-4
                            transition-all cursor-pointer text-left relative overflow-hidden
                            ${
                              isSelected
                                ? 'border-l-2 border-l-blue-500'
                                : 'hover:bg-neutral-50 hover:rounded-md border-l-2 border-l-transparent'
                            }
                          `}
                        >
                          {/* 진행률 바 배경 */}
                          <div
                            className="absolute left-0 top-0 h-full transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: isSelected
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(0, 0, 0, 0.04)',
                            }}
                          />

                          <div className="relative flex items-center gap-2">
                            <CategoryIcon category={cat.category} />
                            <span
                              className={`text-sm ${
                                isSelected ? 'font-medium text-blue-700' : 'text-neutral-700'
                              }`}
                            >
                              {formatCategoryName(cat.category)}
                            </span>
                          </div>
                          <span
                            className={`relative text-xs ${
                              isSelected ? 'text-blue-600' : 'text-neutral-400'
                            }`}
                          >
                            {cat.totalValue}
                          </span>
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
      <div className="flex-1 overflow-hidden">
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
          <div className="rounded-lg bg-white overflow-hidden">
            {/* 헤더 */}
            <div className="flex flex-col gap-2 justify-between px-5 pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <CategoryIcon category={selectedCategory} />
                <h3 className="text-sm font-semibold text-neutral-900">
                  {formatCategoryName(selectedCategory)}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <StatusLegendItem status="NOT_STARTED" />
                <StatusLegendItem status="STARTED" />
                <StatusLegendItem status="FOCUSED" />
                <StatusLegendItem status="MASTERED" />
              </div>
            </div>

            {/* 토픽 그리드 */}
            <div className="p-5" ref={gridRef}>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {selectedCategoryData.topics.map((topic) => {
                  const count = topic.docs.length;
                  const status = getTopicStatus(count);
                  const colors = STATUS_COLORS[status];
                  const isClickable = count > 0;
                  const isTopicSelected = selectedTopic?.name === topic.name;

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
                        }}
                      >
                        <span className="text-[10px] font-semibold leading-tight">
                          {abbreviateTopic(topic.name)}
                        </span>
                        {count > 0 && (
                          <span className="text-[8px] opacity-70 mt-0.5">{count}</span>
                        )}
                      </button>

                      {/* 툴팁 */}
                      <div
                        className={`
                          absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2
                          px-2 py-1 rounded shadow-lg
                          bg-neutral-800 text-white text-xs whitespace-nowrap
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          transition-opacity duration-150 pointer-events-none
                        `}
                      >
                        <div className="font-medium">{formatTopicName(topic.name)}</div>
                        <div className="text-neutral-400 text-[10px] mt-0.5">
                          {count === 0
                            ? STATUS_LABELS.NOT_STARTED
                            : `${STATUS_LABELS[status]} (${count}회)`}
                        </div>
                        {/* 툴팁 화살표 */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 모바일: 선택된 토픽의 문서 목록 (하단) */}
            {isMobile && selectedTopic && selectedTopic.docs.length > 0 && (
              <div className="p-5 bg-neutral-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-neutral-900">
                    {formatTopicName(selectedTopic.name)}
                  </h4>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    닫기
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedTopic.docs.map((doc, idx) => (
                    <CompactFeedCard key={idx} doc={doc} />
                  ))}
                </div>
              </div>
            )}

            {/* 카테고리 요약 - 상태별 개수 */}
            <div className="mx-5 mb-5 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-neutral-400">
                    {statusCounts.NOT_STARTED}
                  </div>
                  <div className="text-[10px] text-neutral-500">Not Started</div>
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: '#9be9a8' }}>
                    {statusCounts.STARTED}
                  </div>
                  <div className="text-[10px] text-neutral-500">Started</div>
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: '#40c463' }}>
                    {statusCounts.FOCUSED}
                  </div>
                  <div className="text-[10px] text-neutral-500">Focused</div>
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: '#216e39' }}>
                    {statusCounts.MASTERED}
                  </div>
                  <div className="text-[10px] text-neutral-500">Mastered</div>
                </div>
              </div>
            </div>
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
