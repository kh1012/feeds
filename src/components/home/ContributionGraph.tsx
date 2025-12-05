'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  useGetGithubContributions,
  ContributionDay,
  ContributionWeek,
} from '@/hooks/useGetGithubContributions';
import { Spinner } from '@/components/common/Spinner';

// GitHub 잔디 색상
const LEVEL_COLORS = [
  '#ebedf0', // Level 0: 기여 없음
  '#9be9a8', // Level 1
  '#40c463', // Level 2
  '#30a14e', // Level 3
  '#216e39', // Level 4
] as const;

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// 셀 크기 상수 (데스크탑)
const CELL_SIZE = 10;
const CELL_GAP = 3;
const CELL_TOTAL = CELL_SIZE + CELL_GAP;

// 셀 크기 상수 (모바일) - 데스크탑 대비 약 30% 축소
const MOBILE_CELL_SIZE = 4;
const MOBILE_CELL_GAP = 1.5;
const MOBILE_CELL_TOTAL = MOBILE_CELL_SIZE + MOBILE_CELL_GAP;

type ContributionCellProps = {
  day: ContributionDay;
  x: number;
  y: number;
  size?: number;
};

function ContributionCell({ day, x, y, size = CELL_SIZE }: ContributionCellProps) {
  const color = LEVEL_COLORS[day.level];
  const formattedDate = new Date(day.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // radius를 셀 크기의 20% 비율로 계산
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
      {LEVEL_COLORS.map((color, index) => (
        <div key={index} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
      ))}
      <span>More</span>
    </div>
  );
}

// 컨테이너 너비 기반으로 표시할 주 수 계산 (모바일용)
function calculateWeeksToShow(containerWidth: number, padding: number = 32): number {
  const availableWidth = containerWidth - padding; // padding 제외
  const weeksCount = Math.floor(availableWidth / MOBILE_CELL_TOTAL);
  return Math.max(8, Math.min(53, weeksCount)); // 최소 8주, 최대 53주
}

// 월 라벨 계산 헬퍼
function calculateMonthLabels(
  weeks: ContributionWeek[],
  offsetX: number = 0,
  cellTotal: number = CELL_TOTAL,
) {
  const labels: Array<{ month: string; x: number }> = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.days[0];
    if (!firstDay) return;

    const date = new Date(firstDay.date);
    const month = date.getMonth();

    if (month !== lastMonth) {
      labels.push({
        month: MONTH_LABELS[month],
        x: weekIndex * cellTotal + offsetX,
      });
      lastMonth = month;
    }
  });

  return labels;
}

export function ContributionGraph() {
  const { data, isPending, isError } = useGetGithubContributions();
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // 컨테이너 너비 추적 (모바일용)
  useEffect(() => {
    const container = mobileContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 모바일용 표시할 주 수 계산
  const mobileWeeksToShow = useMemo(() => {
    if (containerWidth === 0) return 17; // 초기값
    return calculateWeeksToShow(containerWidth);
  }, [containerWidth]);

  // weeks 데이터 추출
  const weeks = useMemo(() => data?.weeks ?? [], [data?.weeks]);

  // 모바일용 최근 N주 데이터 추출
  const mobileWeeks = useMemo(() => {
    if (weeks.length === 0) return [];
    return weeks.slice(-mobileWeeksToShow);
  }, [weeks, mobileWeeksToShow]);

  // 월 라벨 위치 계산 (데스크탑용)
  const monthLabels = useMemo(() => {
    if (weeks.length === 0) return [];
    return calculateMonthLabels(weeks, 28);
  }, [weeks]);

  // 모바일용 월 라벨
  const mobileMonthLabels = useMemo(() => {
    if (mobileWeeks.length === 0) return [];
    return calculateMonthLabels(mobileWeeks, 0, MOBILE_CELL_TOTAL);
  }, [mobileWeeks]);

  if (isPending) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center justify-center min-h-[100px] lg:min-h-[140px]">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return null; // 에러 시 조용히 숨김
  }

  const totalWeeks = weeks.length;
  const desktopWidth = totalWeeks * CELL_TOTAL + 28; // 요일 라벨 공간
  const desktopHeight = 7 * CELL_TOTAL + 20; // 월 라벨 공간

  const mobileWidth = mobileWeeks.length * MOBILE_CELL_TOTAL;
  const mobileGraphHeight = 7 * MOBILE_CELL_TOTAL; // 그래프만 (월 라벨 제외)

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
              y={20 + index * CELL_TOTAL + CELL_SIZE}
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
                x={weekIndex * CELL_TOTAL + 28}
                y={dayIndex * CELL_TOTAL + 16}
              />
            )),
          )}
        </svg>
      </div>

      {/* 모바일/태블릿 그래프 */}
      <div ref={mobileContainerRef} className="lg:hidden">
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
          {mobileWeeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => (
              <ContributionCell
                key={day.date}
                day={day}
                x={weekIndex * MOBILE_CELL_TOTAL}
                y={dayIndex * MOBILE_CELL_TOTAL}
                size={MOBILE_CELL_SIZE}
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
