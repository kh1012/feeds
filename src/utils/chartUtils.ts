import { MONTH_LABELS } from '@/define/chartDefines';
import { ContributionWeek } from '@/types/github';

/** 월 라벨 정보 */
export type MonthLabel = {
  month: string;
  x: number;
};

/**
 * Contribution 그래프용 월 라벨 위치 계산
 * @param weeks - 주별 데이터 배열
 * @param offsetX - X축 오프셋 (요일 라벨 공간 등)
 * @param cellTotal - 셀 전체 크기 (셀 + 간격)
 * @returns 월 라벨 배열
 */
export function calculateMonthLabels(
  weeks: ContributionWeek[],
  offsetX: number = 0,
  cellTotal: number = 13,
): MonthLabel[] {
  const labels: MonthLabel[] = [];
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

/** 차트 포인트 정보 */
export type ChartPoint = {
  x: number;
  y: number;
  label: string;
  count: number;
};

/**
 * 꺾은선 차트용 SVG Path 생성
 * @param points - 포인트 배열
 * @returns SVG path 문자열
 */
export function createLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  return `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
}

/**
 * 꺾은선 차트용 영역(그라데이션) Path 생성
 * @param points - 포인트 배열
 * @param baseY - 기준 Y 좌표 (보통 차트 하단)
 * @param startX - 시작 X 좌표
 * @param endX - 종료 X 좌표
 * @returns SVG path 문자열
 */
export function createAreaPath(
  points: Array<{ x: number; y: number }>,
  baseY: number,
  startX: number,
  endX: number,
): string {
  if (points.length === 0) return '';
  return (
    `M ${startX},${baseY} ` +
    `L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} ` +
    `L ${endX},${baseY} Z`
  );
}

/**
 * 데이터 포인트 좌표 계산
 * @param data - 데이터 배열
 * @param options - 차트 옵션
 * @returns 계산된 포인트 배열
 */
export function calculateChartPoints<T extends { count: number; label: string }>(
  data: T[],
  options: {
    padding: { top: number; left: number };
    plotWidth: number;
    plotHeight: number;
    maxValue: number;
  },
): Array<T & { x: number; y: number }> {
  const { padding, plotWidth, plotHeight, maxValue } = options;

  return data.map((d, i) => ({
    ...d,
    x: padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth,
    y: padding.top + plotHeight - (d.count / maxValue) * plotHeight,
  }));
}

/**
 * Y축 눈금 값 생성
 * @param maxValue - 최대값
 * @param tickCount - 눈금 개수 (기본 3)
 * @returns 눈금 값 배열
 */
export function generateYAxisTicks(maxValue: number, tickCount: number = 3): number[] {
  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i++) {
    ticks.push(Math.round((maxValue / (tickCount - 1)) * i));
  }
  return ticks;
}

