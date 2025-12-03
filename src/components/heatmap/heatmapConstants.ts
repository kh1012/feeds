import type { CategoryTopicData } from './matrixBuilder';

// 학습 상태 정의
export type TopicStatus = 'NOT_STARTED' | 'STARTED' | 'FOCUSED' | 'MASTERED';

// count 기반 상태 계산
export function getTopicStatus(count: number): TopicStatus {
  if (count === 0) return 'NOT_STARTED';
  if (count === 1) return 'STARTED';
  if (count >= 2 && count <= 4) return 'FOCUSED';
  return 'MASTERED'; // count >= 5
}

// 상태별 색상
export const STATUS_COLORS: Record<TopicStatus, { bg: string; text: string }> = {
  NOT_STARTED: { bg: '#f6f8fa', text: '#9ca3af' },
  STARTED: { bg: '#9be9a8', text: '#1f2328' },
  FOCUSED: { bg: '#40c463', text: '#ffffff' },
  MASTERED: { bg: '#216e39', text: '#ffffff' },
};

// 상태별 라벨
export const STATUS_LABELS: Record<TopicStatus, string> = {
  NOT_STARTED: 'Not Started',
  STARTED: 'Started',
  FOCUSED: 'Focused',
  MASTERED: 'Mastered',
};

// 상태별 조건 설명
export const STATUS_CONDITIONS: Record<TopicStatus, string> = {
  NOT_STARTED: 'count = 0',
  STARTED: 'count = 1',
  FOCUSED: '2 ≤ count ≤ 4',
  MASTERED: 'count ≥ 5',
};

// 카테고리 진행률 계산
export function calculateCategoryProgress(category: CategoryTopicData): number {
  const total = category.topics.length;
  if (total === 0) return 0;
  const completed = category.topics.filter((t) => t.docs.length > 0).length;
  return (completed / total) * 100;
}

// 토픽명을 축약형으로 변환
export function abbreviateTopic(topic: string): string {
  const parts = topic.split('-');
  if (parts.length === 1) return topic.slice(0, 4).toUpperCase();
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

// 카테고리명을 표시용으로 변환
export function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 도메인명을 표시용으로 변환
export function formatDomainName(domain: string): string {
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

// 토픽명을 표시용으로 변환
export function formatTopicName(topic: string): string {
  return topic
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 문자열에서 첫 두 글자 추출
export function getFirstTwoChars(str: string): string {
  const clean = str.replace(/[-_]/g, '');
  return clean.slice(0, 2).toUpperCase();
}

