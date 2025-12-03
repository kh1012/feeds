'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import type { DomainTreeData, TopicDocInfo } from './matrixBuilder';
import { HEIGHTS } from '@/define/heightDefines';
import { Spinner } from '@/components/common/Spinner';
import { getTopicStatus, formatCategoryName } from './heatmapConstants';
import { CategoryIcon } from './HeatmapIcons';
import { StatusLegendItem, StatusCountBar, ReactiveLegend } from './StatusLegend';
import { FloatingCardPanel, MobileDocPanel } from './TopicCards';
import { HeatmapSidebar } from './HeatmapSidebar';
import { TopicGridView, TopicListView } from './TopicViews';
import { ViewModeToggle } from './ViewModeToggle';

export default function SkillHeatMap({ data }: { data: DomainTreeData[] }) {
  const findDomain = (cat: string | null) =>
    cat && data.find((d) => d.categories.some((c) => c.category === cat))?.domain;
  const initialCategory = 'javascript';

  const [expandedDomains, setExpandedDomains] = useState(
    new Set(findDomain(initialCategory) ? [findDomain(initialCategory)!] : []),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedTopic, setSelectedTopic] = useState<{ name: string; docs: TopicDocInfo[] } | null>(
    null,
  );
  const [floatingPos, setFloatingPos] = useState<{
    x: number;
    y: number;
    showLeft: boolean;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listSortBy, setListSortBy] = useState<'default' | 'status'>('default');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!floatingPos) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.floating-panel-trigger')) {
        setSelectedTopic(null);
        setFloatingPos(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [floatingPos]);

  const categoryData = useMemo(() => {
    if (!selectedCategory) return null;
    for (const d of data) {
      const found = d.categories.find((c) => c.category === selectedCategory);
      if (found) return found;
    }
    return null;
  }, [data, selectedCategory]);

  const domain = useMemo(() => {
    if (!selectedCategory) return null;
    return (
      data.find((d) => d.categories.some((c) => c.category === selectedCategory))?.domain ?? null
    );
  }, [data, selectedCategory]);
  const total = data.reduce((s, d) => s + d.totalValue, 0);
  const filtered = useMemo(
    () =>
      data
        .map((d) => ({ ...d, categories: d.categories.filter((c) => c.totalValue > 0) }))
        .filter((d) => d.categories.length > 0),
    [data],
  );

  const counts = useMemo(() => {
    if (!categoryData) return { total: 0, NOT_STARTED: 0, STARTED: 0, FOCUSED: 0, MASTERED: 0 };
    return categoryData.topics.reduce(
      (a, t) => {
        a[getTopicStatus(t.docs.length)]++;
        a.total++;
        return a;
      },
      { total: 0, NOT_STARTED: 0, STARTED: 0, FOCUSED: 0, MASTERED: 0 },
    );
  }, [categoryData]);

  const sorted = useMemo(() => {
    if (!categoryData) return [];
    const t = [...categoryData.topics];
    if (listSortBy === 'status') {
      const o = { MASTERED: 4, FOCUSED: 3, STARTED: 2, NOT_STARTED: 1 };
      t.sort((a, b) => o[getTopicStatus(b.docs.length)] - o[getTopicStatus(a.docs.length)]);
    }
    return t;
  }, [categoryData, listSortBy]);

  const toggle = (d: string) =>
    setExpandedDomains((p) => {
      const n = new Set(p);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });

  const onTopicClick = (
    e: React.MouseEvent,
    t: { name: string; value: number; docs: TopicDocInfo[] },
  ) => {
    if (!t.docs.length) return;
    e.stopPropagation();
    setSelectedTopic({ name: t.name, docs: t.docs });
    if (isMobile) {
      setFloatingPos(null);
      return;
    }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left = r.right + 300 > window.innerWidth;
    setFloatingPos({ x: left ? r.left : r.right, y: r.top, showLeft: left });
  };

  const onViewChange = (m: 'grid' | 'list') => {
    if (viewMode !== m) startTransition(() => setViewMode(m));
  };

  return (
    <div className="flex flex-col lg:flex-row sm:gap-12" style={{ marginTop: HEIGHTS.GNB_HEIGHT }}>
      <HeatmapSidebar
        data={data}
        filteredData={filtered}
        totalLength={total}
        expandedDomains={expandedDomains}
        selectedCategory={selectedCategory}
        onToggleDomain={toggle}
        onSelectCategory={(c) => {
          setSelectedCategory(c);
          setSelectedTopic(null);
          setFloatingPos(null);
        }}
      />

      <div className="flex-1 overflow-visible">
        {!selectedCategory ? (
          <div className="flex items-center justify-center h-64 rounded-lg bg-white text-center">
            <div>
              <div className="text-4xl mb-3 text-neutral-300">←</div>
              <p className="text-neutral-500 text-sm">
                카테고리를 선택하면
                <br />
                상세 토픽을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          categoryData && (
            <div className="rounded-lg bg-white">
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <ReactiveLegend />
                <ViewModeToggle
                  viewMode={viewMode}
                  listSortBy={listSortBy}
                  onViewModeChange={onViewChange}
                  onSortChange={setListSortBy}
                />
              </div>
              <StatusCountBar counts={counts} />
              <div className="pb-5 pt-2 relative min-h-[200px]">
                {isPending ? (
                  <div className="flex items-center justify-center py-16">
                    <Spinner />
                  </div>
                ) : viewMode === 'grid' ? (
                  <TopicGridView
                    topics={categoryData.topics}
                    selectedDomain={domain}
                    selectedTopic={selectedTopic}
                    onTopicClick={onTopicClick}
                  />
                ) : (
                  <TopicListView
                    topics={sorted}
                    selectedDomain={domain}
                    selectedTopic={selectedTopic}
                    onTopicSelect={(t) => {
                      setSelectedTopic(t);
                      setFloatingPos(null);
                    }}
                  />
                )}
              </div>
              {isMobile && viewMode === 'grid' && selectedTopic?.docs.length && (
                <MobileDocPanel topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
              )}
            </div>
          )
        )}
      </div>

      {!isMobile && selectedTopic && floatingPos && (
        <FloatingCardPanel
          topic={selectedTopic}
          position={floatingPos}
          onClose={() => {
            setSelectedTopic(null);
            setFloatingPos(null);
          }}
        />
      )}
    </div>
  );
}
