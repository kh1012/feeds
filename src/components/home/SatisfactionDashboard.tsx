'use client';

import { useMemo, useState } from 'react';
import { DocMetaWithUrl } from '@/components/heatmap/matrixBuilder';

interface SatisfactionDashboardProps {
  contents: DocMetaWithUrl[];
  compact?: boolean;
}

// 사분면 타입
type Quadrant = 'high-freq-high-sat' | 'low-freq-high-sat' | 'high-freq-low-sat' | 'low-freq-low-sat';

// 사분면 정보
const QUADRANT_INFO: Record<Quadrant, { label: string; emoji: string; color: string; bgColor: string; description: string }> = {
  'high-freq-high-sat': {
    label: '마스터',
    emoji: '🏆',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    description: '자주 학습하고 만족도도 높음',
  },
  'low-freq-high-sat': {
    label: '숨은 보석',
    emoji: '💎',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: '학습 빈도는 낮지만 만족도 높음',
  },
  'high-freq-low-sat': {
    label: '개선 필요',
    emoji: '🔧',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    description: '자주 학습하지만 만족도 낮음',
  },
  'low-freq-low-sat': {
    label: '관심 필요',
    emoji: '📌',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    description: '학습 빈도와 만족도 모두 낮음',
  },
};

// 토픽별 집계 데이터
type TopicAggregation = {
  topic: string;
  category: string;
  domain: string;
  count: number;
  avgSatisfaction: number;
  reasons: string[];
  quadrant: Quadrant;
};

export default function SatisfactionDashboard({ contents, compact = false }: SatisfactionDashboardProps) {
  const [hoveredTopic, setHoveredTopic] = useState<TopicAggregation | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null);

  // 토픽별 집계
  const topicAggregations = useMemo(() => {
    const topicMap = new Map<string, {
      category: string;
      domain: string;
      count: number;
      totalSatisfaction: number;
      satisfactionCount: number;
      reasons: string[];
    }>();

    for (const doc of contents) {
      const key = `${doc.domain}-${doc.category}-${doc.topic}`;
      const existing = topicMap.get(key);
      const score = doc.satisfaction?.score;
      const reason = doc.satisfaction?.reason;

      if (existing) {
        existing.count++;
        if (score !== undefined) {
          // 0-100점을 1-5점으로 변환
          existing.totalSatisfaction += score / 20;
          existing.satisfactionCount++;
        }
        if (reason) {
          existing.reasons.push(reason);
        }
      } else {
        topicMap.set(key, {
          category: doc.category,
          domain: doc.domain,
          count: 1,
          totalSatisfaction: score !== undefined ? score / 20 : 0,
          satisfactionCount: score !== undefined ? 1 : 0,
          reasons: reason ? [reason] : [],
        });
      }
    }

    // 집계 데이터 변환
    const aggregations: TopicAggregation[] = [];
    const counts: number[] = [];
    const satisfactions: number[] = [];

    topicMap.forEach((value, key) => {
      const topic = key.split('-').slice(2).join('-');
      const avgSat = value.satisfactionCount > 0
        ? value.totalSatisfaction / value.satisfactionCount
        : 0;

      counts.push(value.count);
      if (avgSat > 0) satisfactions.push(avgSat);

      aggregations.push({
        topic,
        category: value.category,
        domain: value.domain,
        count: value.count,
        avgSatisfaction: avgSat,
        reasons: value.reasons,
        quadrant: 'low-freq-low-sat', // 임시, 아래에서 계산
      });
    });

    // 중앙값 계산
    const medianCount = counts.length > 0
      ? counts.sort((a, b) => a - b)[Math.floor(counts.length / 2)]
      : 1;
    const medianSat = satisfactions.length > 0
      ? satisfactions.sort((a, b) => a - b)[Math.floor(satisfactions.length / 2)]
      : 3;

    // 사분면 할당
    for (const agg of aggregations) {
      const isHighFreq = agg.count >= medianCount;
      const isHighSat = agg.avgSatisfaction >= medianSat;

      if (isHighFreq && isHighSat) agg.quadrant = 'high-freq-high-sat';
      else if (!isHighFreq && isHighSat) agg.quadrant = 'low-freq-high-sat';
      else if (isHighFreq && !isHighSat) agg.quadrant = 'high-freq-low-sat';
      else agg.quadrant = 'low-freq-low-sat';
    }

    return { aggregations, medianCount, medianSat };
  }, [contents]);

  // 만족도 데이터가 있는 항목만 필터링
  const itemsWithSatisfaction = topicAggregations.aggregations.filter(
    (agg) => agg.avgSatisfaction > 0
  );

  // 사분면별 카운트
  const quadrantCounts = useMemo(() => {
    const counts: Record<Quadrant, number> = {
      'high-freq-high-sat': 0,
      'low-freq-high-sat': 0,
      'high-freq-low-sat': 0,
      'low-freq-low-sat': 0,
    };

    for (const item of itemsWithSatisfaction) {
      counts[item.quadrant]++;
    }

    return counts;
  }, [itemsWithSatisfaction]);

  // 만족도 데이터가 없으면 표시하지 않음
  if (itemsWithSatisfaction.length === 0) {
    return null;
  }

  // 차트 영역 크기 (compact 모드에서는 더 작게)
  const chartSize = compact ? 200 : 280;
  const padding = compact ? 30 : 40;
  const plotSize = chartSize - padding * 2;

  // 스케일 계산
  const maxCount = Math.max(...itemsWithSatisfaction.map((d) => d.count), 1);

  const getX = (count: number) => {
    return padding + (count / maxCount) * plotSize;
  };

  const getY = (satisfaction: number) => {
    return chartSize - padding - ((satisfaction - 1) / 4) * plotSize;
  };

  // 필터링된 아이템
  const filteredItems = selectedQuadrant
    ? itemsWithSatisfaction.filter((item) => item.quadrant === selectedQuadrant)
    : itemsWithSatisfaction;

  // Compact 모드 (PC 좌측 사이드바)
  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <h3 className="text-xs font-semibold text-neutral-800 mb-3">📊 만족도 매트릭스</h3>

        {/* 차트 */}
        <svg
          width={chartSize}
          height={chartSize}
          className="mx-auto"
          style={{ overflow: 'visible' }}
        >
          {/* 배경 사분면 */}
          <rect x={padding} y={padding} width={plotSize / 2} height={plotSize / 2}
            fill="#dbeafe" opacity={0.3} />
          <rect x={padding + plotSize / 2} y={padding} width={plotSize / 2} height={plotSize / 2}
            fill="#d1fae5" opacity={0.3} />
          <rect x={padding} y={padding + plotSize / 2} width={plotSize / 2} height={plotSize / 2}
            fill="#fee2e2" opacity={0.3} />
          <rect x={padding + plotSize / 2} y={padding + plotSize / 2} width={plotSize / 2} height={plotSize / 2}
            fill="#fef3c7" opacity={0.3} />

          {/* 중앙선 */}
          <line x1={padding + plotSize / 2} y1={padding} x2={padding + plotSize / 2} y2={chartSize - padding}
            stroke="#d1d5db" strokeWidth={1} strokeDasharray="4,4" />
          <line x1={padding} y1={padding + plotSize / 2} x2={chartSize - padding} y2={padding + plotSize / 2}
            stroke="#d1d5db" strokeWidth={1} strokeDasharray="4,4" />

          {/* 데이터 포인트 */}
          {filteredItems.map((item, idx) => (
            <circle
              key={idx}
              cx={getX(item.count)}
              cy={getY(item.avgSatisfaction)}
              r={4}
              style={{
                fill: item.quadrant === 'high-freq-high-sat' ? '#10b981' :
                      item.quadrant === 'low-freq-high-sat' ? '#3b82f6' :
                      item.quadrant === 'high-freq-low-sat' ? '#f59e0b' : '#ef4444',
                opacity: 0.7,
              }}
            />
          ))}
        </svg>

        {/* 사분면 요약 */}
        <div className="grid grid-cols-2 gap-1 mt-3">
          {(Object.keys(QUADRANT_INFO) as Quadrant[]).map((quadrant) => {
            const info = QUADRANT_INFO[quadrant];
            const count = quadrantCounts[quadrant];
            return (
              <div key={quadrant} className="flex items-center gap-1 text-[10px] text-neutral-600">
                <span>{info.emoji}</span>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 기본 모드 (모바일 / 풀사이즈)
  return (
    <div className="bg-white lg:rounded-lg lg:border lg:border-neutral-200 p-4 lg:p-5">
      <h3 className="text-sm font-semibold text-neutral-800 mb-4">📊 학습 만족도 매트릭스</h3>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* 사분면 차트 */}
        <div className="flex-shrink-0">
          <svg
            width={chartSize}
            height={chartSize}
            className="mx-auto"
            style={{ overflow: 'visible' }}
          >
            {/* 배경 사분면 */}
            <rect
              x={padding}
              y={padding}
              width={plotSize / 2}
              height={plotSize / 2}
              fill="#dbeafe"
              opacity={selectedQuadrant === 'low-freq-high-sat' ? 0.8 : 0.3}
              className="cursor-pointer transition-opacity"
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'low-freq-high-sat' ? null : 'low-freq-high-sat')}
            />
            <rect
              x={padding + plotSize / 2}
              y={padding}
              width={plotSize / 2}
              height={plotSize / 2}
              fill="#d1fae5"
              opacity={selectedQuadrant === 'high-freq-high-sat' ? 0.8 : 0.3}
              className="cursor-pointer transition-opacity"
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'high-freq-high-sat' ? null : 'high-freq-high-sat')}
            />
            <rect
              x={padding}
              y={padding + plotSize / 2}
              width={plotSize / 2}
              height={plotSize / 2}
              fill="#fee2e2"
              opacity={selectedQuadrant === 'low-freq-low-sat' ? 0.8 : 0.3}
              className="cursor-pointer transition-opacity"
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'low-freq-low-sat' ? null : 'low-freq-low-sat')}
            />
            <rect
              x={padding + plotSize / 2}
              y={padding + plotSize / 2}
              width={plotSize / 2}
              height={plotSize / 2}
              fill="#fef3c7"
              opacity={selectedQuadrant === 'high-freq-low-sat' ? 0.8 : 0.3}
              className="cursor-pointer transition-opacity"
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'high-freq-low-sat' ? null : 'high-freq-low-sat')}
            />

            {/* 축 */}
            <line
              x1={padding}
              y1={chartSize - padding}
              x2={chartSize - padding}
              y2={chartSize - padding}
              stroke="#9ca3af"
              strokeWidth={1}
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartSize - padding}
              stroke="#9ca3af"
              strokeWidth={1}
            />

            {/* 중앙선 */}
            <line
              x1={padding + plotSize / 2}
              y1={padding}
              x2={padding + plotSize / 2}
              y2={chartSize - padding}
              stroke="#d1d5db"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <line
              x1={padding}
              y1={padding + plotSize / 2}
              x2={chartSize - padding}
              y2={padding + plotSize / 2}
              stroke="#d1d5db"
              strokeWidth={1}
              strokeDasharray="4,4"
            />

            {/* 축 라벨 */}
            <text x={chartSize / 2} y={chartSize - 8} textAnchor="middle" className="text-[10px] fill-neutral-500">
              학습 빈도 →
            </text>
            <text
              x={12}
              y={chartSize / 2}
              textAnchor="middle"
              className="text-[10px] fill-neutral-500"
              transform={`rotate(-90, 12, ${chartSize / 2})`}
            >
              만족도 →
            </text>

            {/* 데이터 포인트 */}
            {filteredItems.map((item, idx) => {
              const x = getX(item.count);
              const y = getY(item.avgSatisfaction);
              const isHovered = hoveredTopic?.topic === item.topic;

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 8 : 6}
                    fill={QUADRANT_INFO[item.quadrant].bgColor.replace('bg-', '')}
                    stroke={isHovered ? '#3b82f6' : '#6b7280'}
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer transition-all"
                    style={{
                      fill: item.quadrant === 'high-freq-high-sat' ? '#10b981' :
                            item.quadrant === 'low-freq-high-sat' ? '#3b82f6' :
                            item.quadrant === 'high-freq-low-sat' ? '#f59e0b' : '#ef4444',
                      opacity: isHovered ? 1 : 0.7,
                    }}
                    onMouseEnter={() => setHoveredTopic(item)}
                    onMouseLeave={() => setHoveredTopic(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* 사분면 요약 + 호버 정보 */}
        <div className="flex-1 min-w-0">
          {/* 사분면 요약 카드 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(Object.keys(QUADRANT_INFO) as Quadrant[]).map((quadrant) => {
              const info = QUADRANT_INFO[quadrant];
              const count = quadrantCounts[quadrant];
              const isSelected = selectedQuadrant === quadrant;

              return (
                <button
                  key={quadrant}
                  onClick={() => setSelectedQuadrant(isSelected ? null : quadrant)}
                  className={`
                    p-2 rounded-lg text-left transition-all border
                    ${isSelected
                      ? `${info.bgColor} border-current ${info.color}`
                      : 'bg-neutral-50 border-transparent hover:bg-neutral-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{info.emoji}</span>
                    <span className={`text-xs font-medium ${isSelected ? info.color : 'text-neutral-700'}`}>
                      {info.label}
                    </span>
                    <span className={`text-xs ml-auto ${isSelected ? info.color : 'text-neutral-400'}`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 호버된 토픽 정보 */}
          {hoveredTopic ? (
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{QUADRANT_INFO[hoveredTopic.quadrant].emoji}</span>
                <span className="text-sm font-medium text-neutral-800 truncate">
                  {hoveredTopic.topic}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span>학습 {hoveredTopic.count}회</span>
                <span>만족도 {hoveredTopic.avgSatisfaction.toFixed(1)}/5</span>
              </div>
              {hoveredTopic.reasons.length > 0 && (
                <p className="mt-2 text-xs text-neutral-600 line-clamp-2">
                  &ldquo;{hoveredTopic.reasons[0]}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-500 text-center">
              차트의 점 위에 마우스를 올려보세요
            </div>
          )}

          {/* 선택된 사분면 설명 */}
          {selectedQuadrant && (
            <p className="mt-2 text-xs text-neutral-500">
              {QUADRANT_INFO[selectedQuadrant].description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
