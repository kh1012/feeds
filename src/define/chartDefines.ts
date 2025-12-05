// 차트 관련 상수 정의

/** GitHub 잔디 색상 (레벨 0~4) */
export const CONTRIBUTION_COLORS = [
  '#ebedf0', // Level 0: 기여 없음
  '#9be9a8', // Level 1
  '#40c463', // Level 2
  '#30a14e', // Level 3
  '#216e39', // Level 4
] as const;

/** 월 라벨 (영문 약어) */
export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** 요일 라벨 (영문 약어, 홀수 행만 표시) */
export const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const;

/** Contribution 그래프 셀 크기 (데스크탑) */
export const CONTRIBUTION_CELL = {
  SIZE: 10,
  GAP: 3,
  get TOTAL() {
    return this.SIZE + this.GAP;
  },
} as const;

/** Contribution 그래프 셀 크기 (모바일) */
export const CONTRIBUTION_CELL_MOBILE = {
  SIZE: 4,
  GAP: 1.5,
  get TOTAL() {
    return this.SIZE + this.GAP;
  },
} as const;

/** 기본 차트 색상 */
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  GRID: '#e5e7eb',
  TEXT: '#6b7280',
  TEXT_MUTED: '#9ca3af',
} as const;

/** 차트 패딩 기본값 */
export const CHART_PADDING = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 40,
} as const;

