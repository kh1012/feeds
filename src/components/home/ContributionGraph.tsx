'use client';

import { useMemo } from 'react';
import { useGetGithubContributions } from '@/hooks/useGetGithubContributions';
import { Spinner } from '@/components/common/Spinner';
import { ContributionDay } from '@/types/github';
import {
  CONTRIBUTION_COLORS,
  DAY_LABELS,
  CONTRIBUTION_CELL,
  CONTRIBUTION_CELL_MOBILE,
} from '@/define/chartDefines';
import { calculateMonthLabels } from '@/utils/chartUtils';
import { formatDateKorean } from '@/utils/dateUtils';

// ============ 하위 컴포넌트 ============

type ContributionCellProps = {
  day: ContributionDay;
  x: number;
  y: number;
  size?: number;
};

function ContributionCell({ day, x, y, size = CONTRIBUTION_CELL.SIZE }: ContributionCellProps) {
  const color = CONTRIBUTION_COLORS[day.level];
  const formattedDate = formatDateKorean(day.date);
  const radius = Math.round(size * 0.2);

  return (
    <rect
      x={x}
      y={y}
      width={size}
      height={size}
      rx={radius}
      ry={radius}
      fill={color}
      className="transition-opacity hover:opacity-80"
    >
      <title>{`${formattedDate}: ${day.count}개의 기여`}</title>
    </rect>
  );
}

type ContributionLegendProps = {
  showLabels?: boolean;
};

function ContributionLegend({ showLabels = true }: ContributionLegendProps) {
  if (!showLabels) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
      <span>Less</span>
      {CONTRIBUTION_COLORS.map((color, index) => (
        <div key={index} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
      ))}
      <span>More</span>
    </div>
  );
}

// ============ 메인 컴포넌트 ============

export function ContributionGraph() {
  const { data, isPending, isError } = useGetGithubContributions();

  // weeks 데이터 추출
  const weeks = useMemo(() => data?.weeks ?? [], [data?.weeks]);

  // 월 라벨 위치 계산 (데스크탑용)
  const monthLabels = useMemo(() => {
    if (weeks.length === 0) return [];
    return calculateMonthLabels(weeks, 28, CONTRIBUTION_CELL.TOTAL);
  }, [weeks]);

  // 모바일용 월 라벨 (전체 1년치)
  const mobileMonthLabels = useMemo(() => {
    if (weeks.length === 0) return [];
    return calculateMonthLabels(weeks, 0, CONTRIBUTION_CELL_MOBILE.TOTAL);
  }, [weeks]);

  if (isPending) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center justify-center min-h-[100px] lg:min-h-[140px]">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const totalWeeks = weeks.length;
  const desktopWidth = totalWeeks * CONTRIBUTION_CELL.TOTAL + 28;
  const desktopHeight = 7 * CONTRIBUTION_CELL.TOTAL + 20;

  const mobileWidth = totalWeeks * CONTRIBUTION_CELL_MOBILE.TOTAL;
  const mobileGraphHeight = 7 * CONTRIBUTION_CELL_MOBILE.TOTAL;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">
          {data.totalContributions.toLocaleString()} contributions in the last year
        </h3>
        <div className="hidden sm:block">
          <ContributionLegend />
        </div>
      </div>

      {/* 데스크탑 그래프 */}
      <div className="hidden lg:block">
        <svg
          width="100%"
          viewBox={`0 0 ${desktopWidth} ${desktopHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="block"
        >
          {/* 월 라벨 */}
          {monthLabels.map((label, index) => (
            <text key={index} x={label.x} y={10} className="fill-neutral-400 text-[10px]">
              {label.month}
            </text>
          ))}

          {/* 요일 라벨 */}
          {DAY_LABELS.map((label, index) => (
            <text
              key={index}
              x={0}
              y={20 + index * CONTRIBUTION_CELL.TOTAL + CONTRIBUTION_CELL.SIZE}
              className="fill-neutral-400 text-[10px]"
            >
              {label}
            </text>
          ))}

          {/* 기여 셀 */}
          {weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => (
              <ContributionCell
                key={day.date}
                day={day}
                x={weekIndex * CONTRIBUTION_CELL.TOTAL + 28}
                y={dayIndex * CONTRIBUTION_CELL.TOTAL + 16}
              />
            )),
          )}
        </svg>
      </div>

      {/* 모바일/태블릿 그래프 */}
      <div className="lg:hidden">
        {/* 월 라벨 (HTML, 고정 폰트 크기) */}
        <div className="relative text-[10px] text-neutral-400 mb-1" style={{ height: 14 }}>
          {mobileMonthLabels.map((label, index) => (
            <span
              key={index}
              className="absolute"
              style={{ left: `${(label.x / mobileWidth) * 100}%` }}
            >
              {label.month}
            </span>
          ))}
        </div>

        {/* 그래프 */}
        <svg
          width="100%"
          viewBox={`0 0 ${mobileWidth} ${mobileGraphHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="block"
        >
          {weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => (
              <ContributionCell
                key={day.date}
                day={day}
                x={weekIndex * CONTRIBUTION_CELL_MOBILE.TOTAL}
                y={dayIndex * CONTRIBUTION_CELL_MOBILE.TOTAL}
                size={CONTRIBUTION_CELL_MOBILE.SIZE}
              />
            )),
          )}
        </svg>

        {/* 모바일 레전드 */}
        <div className="flex justify-end mt-2 sm:hidden">
          <ContributionLegend showLabels={false} />
        </div>
      </div>
    </div>
  );
}
