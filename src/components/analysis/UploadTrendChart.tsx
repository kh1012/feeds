'use client';

import { useMemo, useState } from 'react';
import { DocMetaWithUrl } from '@/components/heatmap/heatmapTypes';
import { CHART_COLORS, CHART_PADDING } from '@/define/chartDefines';
import { getWeekNumber } from '@/utils/dateUtils';
import {
  createLinePath,
  createAreaPath,
  calculateChartPoints,
  generateYAxisTicks,
} from '@/utils/chartUtils';

type Period = 'weekly' | 'monthly' | 'yearly';

interface UploadTrendChartProps {
  data: DocMetaWithUrl[];
}

type ChartDataPoint = {
  label: string;
  count: number;
  date: Date;
};

const PERIOD_LABELS: Record<Period, string> = {
  weekly: '주별',
  monthly: '월별',
  yearly: '연별',
};

const PERIOD_UNIT: Record<Period, string> = {
  weekly: '주',
  monthly: '월',
  yearly: '년',
};

const MAX_POINTS: Record<Period, number> = {
  weekly: 16,
  monthly: 12,
  yearly: 5,
};

function aggregateByPeriod(data: DocMetaWithUrl[], period: Period): ChartDataPoint[] {
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

  const entries = Array.from(countMap.entries()).sort(
    (a, b) => a[1].date.getTime() - b[1].date.getTime()
  );

  const result: ChartDataPoint[] = [];
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

  return result.slice(-MAX_POINTS[period]);
}

export function UploadTrendChart({ data }: UploadTrendChartProps) {
  const [period, setPeriod] = useState<Period>('monthly');

  const chartData = useMemo(() => aggregateByPeriod(data, period), [data, period]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const chartHeight = 160;
  const chartWidth = Math.max(chartData.length * 50, 400);
  const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = chartHeight - CHART_PADDING.top - CHART_PADDING.bottom;

  const points = useMemo(() => {
    return calculateChartPoints(chartData, {
      padding: CHART_PADDING,
      plotWidth,
      plotHeight,
      maxValue: maxCount,
    });
  }, [chartData, plotWidth, plotHeight, maxCount]);

  const linePath = createLinePath(points);
  const areaPath = createAreaPath(
    points,
    CHART_PADDING.top + plotHeight,
    CHART_PADDING.left,
    CHART_PADDING.left + plotWidth
  );

  const yTicks = generateYAxisTicks(maxCount, 3);

  const average =
    chartData.length > 0
      ? (chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length).toFixed(1)
      : '0';

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">업로드 추이</h2>
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
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="block">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.PRIMARY} stopOpacity="0.3" />
              <stop offset="100%" stopColor={CHART_COLORS.PRIMARY} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = CHART_PADDING.top + plotHeight - (tick / maxCount) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={CHART_PADDING.left}
                  y1={y}
                  x2={CHART_PADDING.left + plotWidth}
                  y2={y}
                  stroke={CHART_COLORS.GRID}
                  strokeDasharray={tick === 0 ? '0' : '4,4'}
                />
                <text
                  x={CHART_PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {points.length > 0 && <path d={areaPath} fill="url(#areaGradient)" />}

          {points.length > 0 && (
            <path
              d={linePath}
              fill="none"
              stroke={CHART_COLORS.PRIMARY}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill="#fff"
                stroke={CHART_COLORS.PRIMARY}
                strokeWidth={2}
              />
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

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <div className="text-xs text-neutral-500">총 {data.length}개 컨텐츠</div>
        <div className="text-xs text-neutral-500">
          평균 <span className="font-medium text-neutral-700">{average}</span>개/
          {PERIOD_UNIT[period]}
        </div>
      </div>
    </div>
  );
}
