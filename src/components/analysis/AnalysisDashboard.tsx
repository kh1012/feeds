'use client';

import { useMemo, useState } from 'react';
import { DocMetaWithUrl } from '@/components/heatmap/matrixBuilder';
import ReviewList from './ReviewList';
import { UploadTrendChart } from './UploadTrendChart';

interface AnalysisDashboardProps {
  data: DocMetaWithUrl[];
}

// 만족도 구간 정의
const SCORE_RANGES = [
  { min: 0, max: 20, label: '매우 낮음', color: '#ef4444' },
  { min: 21, max: 40, label: '낮음', color: '#f97316' },
  { min: 41, max: 60, label: '보통', color: '#eab308' },
  { min: 61, max: 80, label: '높음', color: '#22c55e' },
  { min: 81, max: 100, label: '매우 높음', color: '#10b981' },
];

// 사분면 타입
type Quadrant =
  | 'high-freq-high-sat'
  | 'low-freq-high-sat'
  | 'high-freq-low-sat'
  | 'low-freq-low-sat';

// 사분면 정보
const QUADRANT_INFO: Record<
  Quadrant,
  { label: string; emoji: string; color: string; bgColor: string; description: string }
> = {
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

// 카테고리명 포맷팅
function formatName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<TopicAggregation | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null);

  // 만족도 데이터가 있는 항목만 필터링
  const dataWithSatisfaction = useMemo(() => {
    return data.filter((d) => d.satisfaction && d.satisfaction.score !== undefined);
  }, [data]);

  // 전체 통계
  const stats = useMemo(() => {
    if (dataWithSatisfaction.length === 0) return null;

    const scores = dataWithSatisfaction.map((d) => d.satisfaction!.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    return { avg, median, max, min, total: scores.length };
  }, [dataWithSatisfaction]);

  // 점수 구간별 분포
  const distribution = useMemo(() => {
    const dist = SCORE_RANGES.map((range) => ({
      ...range,
      count: dataWithSatisfaction.filter(
        (d) => d.satisfaction!.score >= range.min && d.satisfaction!.score <= range.max,
      ).length,
      items: dataWithSatisfaction.filter(
        (d) => d.satisfaction!.score >= range.min && d.satisfaction!.score <= range.max,
      ),
    }));
    return dist;
  }, [dataWithSatisfaction]);

  // 카테고리별 평균 만족도
  const categoryStats = useMemo(() => {
    const categoryMap = new Map<
      string,
      { total: number; count: number; items: DocMetaWithUrl[] }
    >();

    for (const doc of dataWithSatisfaction) {
      const existing = categoryMap.get(doc.category);
      if (existing) {
        existing.total += doc.satisfaction!.score;
        existing.count++;
        existing.items.push(doc);
      } else {
        categoryMap.set(doc.category, {
          total: doc.satisfaction!.score,
          count: 1,
          items: [doc],
        });
      }
    }

    const result = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      avg: data.total / data.count,
      count: data.count,
      items: data.items,
    }));

    return result.sort((a, b) => b.avg - a.avg);
  }, [dataWithSatisfaction]);

  // 도메인별 평균 만족도
  const domainStats = useMemo(() => {
    const domainMap = new Map<string, { total: number; count: number }>();

    for (const doc of dataWithSatisfaction) {
      const existing = domainMap.get(doc.domain);
      if (existing) {
        existing.total += doc.satisfaction!.score;
        existing.count++;
      } else {
        domainMap.set(doc.domain, {
          total: doc.satisfaction!.score,
          count: 1,
        });
      }
    }

    return Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        avg: data.total / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [dataWithSatisfaction]);

  // 높은 만족도 컨텐츠 (상위)
  const highSatisfactionContent = useMemo(() => {
    const threshold = 80;
    return dataWithSatisfaction
      .filter((d) => d.satisfaction!.score >= threshold)
      .sort((a, b) => b.satisfaction!.score - a.satisfaction!.score);
  }, [dataWithSatisfaction]);

  // 낮은 만족도 컨텐츠 (하위)
  const lowSatisfactionContent = useMemo(() => {
    const threshold = 40;
    return dataWithSatisfaction
      .filter((d) => d.satisfaction!.score <= threshold)
      .sort((a, b) => a.satisfaction!.score - b.satisfaction!.score);
  }, [dataWithSatisfaction]);

  // 키워드 분석
  const keywordAnalysis = useMemo(() => {
    const highKeywords = new Map<string, number>();
    const lowKeywords = new Map<string, number>();

    for (const doc of highSatisfactionContent) {
      for (const keyword of doc.keywords) {
        highKeywords.set(keyword, (highKeywords.get(keyword) || 0) + 1);
      }
    }

    for (const doc of lowSatisfactionContent) {
      for (const keyword of doc.keywords) {
        lowKeywords.set(keyword, (lowKeywords.get(keyword) || 0) + 1);
      }
    }

    return {
      high: Array.from(highKeywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      low: Array.from(lowKeywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
  }, [highSatisfactionContent, lowSatisfactionContent]);

  // 만족도 이유 분석
  const reasonsAnalysis = useMemo(() => {
    const highReasons = highSatisfactionContent
      .filter((d) => d.satisfaction?.reason)
      .map((d) => ({
        reason: d.satisfaction!.reason,
        score: d.satisfaction!.score,
        topic: d.topic,
        category: d.category,
      }));

    const lowReasons = lowSatisfactionContent
      .filter((d) => d.satisfaction?.reason)
      .map((d) => ({
        reason: d.satisfaction!.reason,
        score: d.satisfaction!.score,
        topic: d.topic,
        category: d.category,
      }));

    return { high: highReasons, low: lowReasons };
  }, [highSatisfactionContent, lowSatisfactionContent]);

  // 선택된 구간의 컨텐츠
  const selectedRangeContent = useMemo(() => {
    if (!selectedRange) return [];
    const range = distribution.find((d) => d.label === selectedRange);
    return range?.items || [];
  }, [selectedRange, distribution]);

  // 토픽별 집계 (사분면 차트용)
  const topicAggregations = useMemo(() => {
    const topicMap = new Map<
      string,
      {
        category: string;
        domain: string;
        count: number;
        totalSatisfaction: number;
        satisfactionCount: number;
        reasons: string[];
      }
    >();

    for (const doc of data) {
      const key = `${doc.domain}-${doc.category}-${doc.topic}`;
      const existing = topicMap.get(key);
      const score = doc.satisfaction?.score;
      const reason = doc.satisfaction?.reason;

      if (existing) {
        existing.count++;
        if (score !== undefined) {
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

    const aggregations: TopicAggregation[] = [];
    const counts: number[] = [];
    const satisfactions: number[] = [];

    topicMap.forEach((value, key) => {
      const topic = key.split('-').slice(2).join('-');
      const avgSat =
        value.satisfactionCount > 0 ? value.totalSatisfaction / value.satisfactionCount : 0;

      counts.push(value.count);
      if (avgSat > 0) satisfactions.push(avgSat);

      aggregations.push({
        topic,
        category: value.category,
        domain: value.domain,
        count: value.count,
        avgSatisfaction: avgSat,
        reasons: value.reasons,
        quadrant: 'low-freq-low-sat',
      });
    });

    const medianCount =
      counts.length > 0 ? counts.sort((a, b) => a - b)[Math.floor(counts.length / 2)] : 1;
    const medianSat =
      satisfactions.length > 0
        ? satisfactions.sort((a, b) => a - b)[Math.floor(satisfactions.length / 2)]
        : 3;

    for (const agg of aggregations) {
      const isHighFreq = agg.count >= medianCount;
      const isHighSat = agg.avgSatisfaction >= medianSat;

      if (isHighFreq && isHighSat) agg.quadrant = 'high-freq-high-sat';
      else if (!isHighFreq && isHighSat) agg.quadrant = 'low-freq-high-sat';
      else if (isHighFreq && !isHighSat) agg.quadrant = 'high-freq-low-sat';
      else agg.quadrant = 'low-freq-low-sat';
    }

    return { aggregations, medianCount, medianSat };
  }, [data]);

  // 만족도 데이터가 있는 항목만 필터링 (사분면용)
  const itemsWithSatisfaction = topicAggregations.aggregations.filter(
    (agg) => agg.avgSatisfaction > 0,
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

  // 만족도 데이터가 없는 경우
  if (dataWithSatisfaction.length === 0) {
    return (
      <div>
        <div className="mx-auto px-4 lg:px-6 py-8" style={{ maxWidth: 1248 }}>
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-2">
              만족도 데이터가 없습니다
            </h2>
            <p className="text-sm text-neutral-500">
              마크다운 파일의 frontmatter에 satisfaction 데이터를 추가하면
              <br />
              학습 분석을 확인할 수 있습니다.
            </p>
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg text-left">
              <p className="text-xs text-neutral-500 mb-2">예시:</p>
              <pre className="text-xs text-neutral-700 font-mono">
                {`satisfaction:
  score: 85
  reason: 실무에 바로 적용 가능한 내용이어서 만족`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxDistCount = Math.max(...distribution.map((d) => d.count));

  // 사분면 차트 설정
  const chartSize = 280;
  const padding = 40;
  const plotSize = chartSize - padding * 2;
  const maxCount = Math.max(...itemsWithSatisfaction.map((d) => d.count), 1);

  const getX = (count: number) => padding + (count / maxCount) * plotSize;
  const getY = (satisfaction: number) => chartSize - padding - ((satisfaction - 1) / 4) * plotSize;

  const filteredItems = selectedQuadrant
    ? itemsWithSatisfaction.filter((item) => item.quadrant === selectedQuadrant)
    : itemsWithSatisfaction;

  return (
    <div>
      <div className="mx-auto px-4 lg:px-6 py-6" style={{ maxWidth: 1248 }}>
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-900">Analysis Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            스코어링 기반 정적 분석 · {stats?.total}개 컨텐츠 분석 결과
          </p>
        </div>

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">평균 만족도</p>
            <p className="text-2xl font-bold text-neutral-900">{stats?.avg.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">중앙값</p>
            <p className="text-2xl font-bold text-neutral-900">{stats?.median}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">최고 점수</p>
            <p className="text-2xl font-bold text-emerald-600">{stats?.max}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">최저 점수</p>
            <p className="text-2xl font-bold text-red-500">{stats?.min}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 col-span-2 lg:col-span-1">
            <p className="text-xs text-neutral-500 mb-1">분석 대상</p>
            <p className="text-2xl font-bold text-neutral-900">{stats?.total}개</p>
          </div>
        </div>

        {/* 업로드 추이 그래프 */}
        <div className="mb-6">
          <UploadTrendChart data={data} />
        </div>

        {/* 사분면 차트 (이전 SatisfactionDashboard) */}
        {itemsWithSatisfaction.length > 0 && (
          <div className="bg-white rounded-lg border border-neutral-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">🎯 학습 만족도 매트릭스</h2>

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
                    onClick={() =>
                      setSelectedQuadrant(
                        selectedQuadrant === 'low-freq-high-sat' ? null : 'low-freq-high-sat',
                      )
                    }
                  />
                  <rect
                    x={padding + plotSize / 2}
                    y={padding}
                    width={plotSize / 2}
                    height={plotSize / 2}
                    fill="#d1fae5"
                    opacity={selectedQuadrant === 'high-freq-high-sat' ? 0.8 : 0.3}
                    className="cursor-pointer transition-opacity"
                    onClick={() =>
                      setSelectedQuadrant(
                        selectedQuadrant === 'high-freq-high-sat' ? null : 'high-freq-high-sat',
                      )
                    }
                  />
                  <rect
                    x={padding}
                    y={padding + plotSize / 2}
                    width={plotSize / 2}
                    height={plotSize / 2}
                    fill="#fee2e2"
                    opacity={selectedQuadrant === 'low-freq-low-sat' ? 0.8 : 0.3}
                    className="cursor-pointer transition-opacity"
                    onClick={() =>
                      setSelectedQuadrant(
                        selectedQuadrant === 'low-freq-low-sat' ? null : 'low-freq-low-sat',
                      )
                    }
                  />
                  <rect
                    x={padding + plotSize / 2}
                    y={padding + plotSize / 2}
                    width={plotSize / 2}
                    height={plotSize / 2}
                    fill="#fef3c7"
                    opacity={selectedQuadrant === 'high-freq-low-sat' ? 0.8 : 0.3}
                    className="cursor-pointer transition-opacity"
                    onClick={() =>
                      setSelectedQuadrant(
                        selectedQuadrant === 'high-freq-low-sat' ? null : 'high-freq-low-sat',
                      )
                    }
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
                  <text
                    x={chartSize / 2}
                    y={chartSize - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-neutral-500"
                  >
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
                            fill:
                              item.quadrant === 'high-freq-high-sat'
                                ? '#10b981'
                                : item.quadrant === 'low-freq-high-sat'
                                  ? '#3b82f6'
                                  : item.quadrant === 'high-freq-low-sat'
                                    ? '#f59e0b'
                                    : '#ef4444',
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
                          ${
                            isSelected
                              ? `${info.bgColor} border-current ${info.color}`
                              : 'bg-neutral-50 border-transparent hover:bg-neutral-100'
                          }
                        `}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{info.emoji}</span>
                          <span
                            className={`text-xs font-medium ${isSelected ? info.color : 'text-neutral-700'}`}
                          >
                            {info.label}
                          </span>
                          <span
                            className={`text-xs ml-auto ${isSelected ? info.color : 'text-neutral-400'}`}
                          >
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
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 만족도 분포 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">📈 만족도 분포</h2>
            <div className="space-y-3">
              {distribution.map((range) => (
                <button
                  key={range.label}
                  onClick={() =>
                    setSelectedRange(selectedRange === range.label ? null : range.label)
                  }
                  className={`w-full text-left transition-all ${
                    selectedRange === range.label ? 'ring-2 ring-blue-500 rounded-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-xs text-neutral-600">{range.label}</div>
                    <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${maxDistCount > 0 ? (range.count / maxDistCount) * 100 : 0}%`,
                          backgroundColor: range.color,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-neutral-700">
                      {range.count}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 선택된 구간의 컨텐츠 */}
            {selectedRange && selectedRangeContent.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-2">
                  {selectedRange} 만족도 컨텐츠 ({selectedRangeContent.length}개)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedRangeContent.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700 truncate flex-1">{item.topic}</span>
                      <span className="text-neutral-500 ml-2">{item.satisfaction?.score}점</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 카테고리별 만족도 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">
              🏷️ 카테고리별 평균 만족도
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {categoryStats.map((cat, idx) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="w-6 text-xs text-neutral-400">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-neutral-700">{formatName(cat.category)}</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {cat.avg.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.avg}%`,
                          backgroundColor:
                            cat.avg >= 80
                              ? '#10b981'
                              : cat.avg >= 60
                                ? '#22c55e'
                                : cat.avg >= 40
                                  ? '#eab308'
                                  : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-xs text-neutral-400 text-right">{cat.count}개</div>
                </div>
              ))}
            </div>
          </div>

          {/* 높은 만족도 컨텐츠 특징 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-1">🏆 높은 만족도 컨텐츠</h2>
            <p className="text-xs text-neutral-500 mb-4">
              만족도 80점 이상 · {highSatisfactionContent.length}개
            </p>

            {highSatisfactionContent.length > 0 ? (
              <>
                {/* 주요 키워드 */}
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">자주 등장하는 키워드</p>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordAnalysis.high.map(([keyword, count]) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-full"
                      >
                        {keyword} ({count})
                      </span>
                    ))}
                  </div>
                </div>

                {/* 만족 이유 */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">만족 이유</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {reasonsAnalysis.high.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="p-2 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-emerald-600">
                            {item.score}점
                          </span>
                          <span className="text-xs text-neutral-500">{item.topic}</span>
                        </div>
                        <p className="text-xs text-neutral-700">&ldquo;{item.reason}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-500">높은 만족도 컨텐츠가 없습니다.</p>
            )}
          </div>

          {/* 낮은 만족도 컨텐츠 특징 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-1">📌 낮은 만족도 컨텐츠</h2>
            <p className="text-xs text-neutral-500 mb-4">
              만족도 40점 이하 · {lowSatisfactionContent.length}개
            </p>

            {lowSatisfactionContent.length > 0 ? (
              <>
                {/* 주요 키워드 */}
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">자주 등장하는 키워드</p>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordAnalysis.low.map(([keyword, count]) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-full"
                      >
                        {keyword} ({count})
                      </span>
                    ))}
                  </div>
                </div>

                {/* 불만족 이유 */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">불만족 이유</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {reasonsAnalysis.low.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="p-2 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-red-600">{item.score}점</span>
                          <span className="text-xs text-neutral-500">{item.topic}</span>
                        </div>
                        <p className="text-xs text-neutral-700">&ldquo;{item.reason}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-500">낮은 만족도 컨텐츠가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 도메인별 만족도 비교 */}
        <div className="mt-6 bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">🌐 도메인별 만족도 비교</h2>
          <div className="flex flex-wrap gap-4">
            {domainStats.map((domain) => (
              <div
                key={domain.domain}
                className="flex-1 min-w-[140px] p-4 bg-neutral-50 rounded-lg text-center"
              >
                <p className="text-xs text-neutral-500 mb-1">{formatName(domain.domain)}</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color:
                      domain.avg >= 80
                        ? '#10b981'
                        : domain.avg >= 60
                          ? '#22c55e'
                          : domain.avg >= 40
                            ? '#eab308'
                            : '#ef4444',
                  }}
                >
                  {domain.avg.toFixed(1)}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{domain.count}개</p>
              </div>
            ))}
          </div>
        </div>

        {/* 재활성(Re-active) 필요 토픽 리스트 */}
        <div className="mt-6">
          <ReviewList data={data} />
        </div>
      </div>
    </div>
  );
}
