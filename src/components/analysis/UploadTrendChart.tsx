'use client';

import { useMemo, useState } from 'react';
import { DocMetaWithUrl } from '@/components/heatmap/heatmapTypes';

type Period = 'weekly' | 'monthly' | 'yearly';

interface UploadTrendChartProps {
  data: DocMetaWithUrl[];
}

type ChartDataPoint = {
  label: string;
  count: number;
  date: Date;
};

// 주차 계산 (ISO 8601)
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function UploadTrendChart({ data }: UploadTrendChartProps) {
  const [period, setPeriod] = useState<Period>('monthly');

  // 기간별 데이터 집계
  const chartData = useMemo(() => {
    const result: ChartDataPoint[] = [];
    const countMap = new Map<string, { count: number; date: Date }>();

    for (const doc of data) {
      const date = new Date(doc.date);
      let key: string;
      let labelDate: Date;

      if (period === 'weekly') {
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        key = `${year}-W${week.toString().padStart(2, '0')}`;
        labelDate = new Date(date);
        labelDate.setDate(date.getDate() - date.getDay());
      } else if (period === 'monthly') {
        const year = date.getFullYear();
        const month = date.getMonth();
        key = `${year}-${month.toString().padStart(2, '0')}`;
        labelDate = new Date(year, month, 1);
      } else {
        const year = date.getFullYear();
        key = `${year}`;
        labelDate = new Date(year, 0, 1);
      }

      const existing = countMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(key, { count: 1, date: labelDate });
      }
    }

    // Map을 배열로 변환하고 날짜순 정렬
    const entries = Array.from(countMap.entries()).sort((a, b) => 
      a[1].date.getTime() - b[1].date.getTime()
    );

    for (const [key, value] of entries) {
      let label: string;
      if (period === 'weekly') {
        const [year, week] = key.split('-W');
        label = `${year.slice(2)}.W${week}`;
      } else if (period === 'monthly') {
        const [year, month] = key.split('-');
        label = `${year.slice(2)}.${parseInt(month) + 1}`;
      } else {
        label = key;
      }

      result.push({
        label,
        count: value.count,
        date: value.date,
      });
    }

    // 최근 데이터만 표시 (기간별로 다르게)
    const maxPoints = period === 'weekly' ? 16 : period === 'monthly' ? 12 : 5;
    return result.slice(-maxPoints);
  }, [data, period]);

  // 차트 계산
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const chartHeight = 160;
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = Math.max(chartData.length * 50, 400);
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  // 포인트 계산
  const points = chartData.map((d, i) => ({
    x: chartPadding.left + (i / Math.max(chartData.length - 1, 1)) * plotWidth,
    y: chartPadding.top + plotHeight - (d.count / maxCount) * plotHeight,
    ...d,
  }));

  // SVG Path 생성
  const linePath = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  // 그라데이션 영역 Path
  const areaPath = points.length > 0
    ? `M ${chartPadding.left},${chartPadding.top + plotHeight} ` +
      `L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} ` +
      `L ${chartPadding.left + plotWidth},${chartPadding.top + plotHeight} Z`
    : '';

  // Y축 눈금
  const yTicks = [0, Math.ceil(maxCount / 2), maxCount];

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">📊 업로드 추이</h2>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
          {(['weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                period === p
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {p === 'weekly' ? '주별' : p === 'monthly' ? '월별' : '연별'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="block">
          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y축 그리드 라인 */}
          {yTicks.map((tick) => {
            const y = chartPadding.top + plotHeight - (tick / maxCount) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={chartPadding.left}
                  y1={y}
                  x2={chartPadding.left + plotWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray={tick === 0 ? '0' : '4,4'}
                />
                <text
                  x={chartPadding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* 그라데이션 영역 */}
          {points.length > 0 && (
            <path d={areaPath} fill="url(#areaGradient)" />
          )}

          {/* 꺾은선 */}
          {points.length > 0 && (
            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 데이터 포인트 */}
          {points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill="#fff"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              {/* X축 라벨 */}
              <text
                x={point.x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="text-[9px] fill-neutral-500"
                transform={`rotate(-45, ${point.x}, ${chartHeight - 10})`}
              >
                {point.label}
              </text>
            </g>
          ))}

          {/* 호버 시 값 표시 (포인트 위) */}
          {points.map((point, i) => (
            <text
              key={`val-${i}`}
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="text-[10px] fill-neutral-700 font-medium"
            >
              {point.count}
            </text>
          ))}
        </svg>
      </div>

      {/* 요약 정보 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <div className="text-xs text-neutral-500">
          총 {data.length}개 컨텐츠
        </div>
        <div className="text-xs text-neutral-500">
          평균{' '}
          <span className="font-medium text-neutral-700">
            {chartData.length > 0
              ? (chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length).toFixed(1)
              : 0}
          </span>
          개/{period === 'weekly' ? '주' : period === 'monthly' ? '월' : '년'}
        </div>
      </div>
    </div>
  );
}

