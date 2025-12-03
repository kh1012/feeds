/**
 * 재활성(Re-active) 레벨 정의
 * - NONE: 재활성 불필요 (최근 1개월 이내)
 * - LEVEL_1: 1개월 경과 (노란색) - 첫 번째 재활성 필요
 * - LEVEL_2: 3개월 경과 (주황색) - 두 번째 재활성 필요
 * - LEVEL_3: 6개월 경과 (빨간색) - 세 번째 재활성 필요
 */
export type ReviewLevel = 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

/** 재활성(Re-active) 레벨별 설정 */
export const REVIEW_LEVEL_CONFIG: Record<
  ReviewLevel,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    daysThreshold: number;
  }
> = {
  NONE: {
    label: '재활성 불필요',
    shortLabel: 'OK',
    color: '#22c55e',
    bgColor: '#dcfce7',
    borderColor: '#86efac',
    description: '최근 30일 이내 학습',
    daysThreshold: 0,
  },
  LEVEL_1: {
    label: '1차 재활성 필요',
    shortLabel: '1M',
    color: '#eab308',
    bgColor: '#fef9c3',
    borderColor: '#fde047',
    description: '30일 경과 - 기억 강화 필요',
    daysThreshold: 30,
  },
  LEVEL_2: {
    label: '2차 재활성 필요',
    shortLabel: '3M',
    color: '#f97316',
    bgColor: '#ffedd5',
    borderColor: '#fdba74',
    description: '90일 경과 - 중요 재활성 시점',
    daysThreshold: 90,
  },
  LEVEL_3: {
    label: '3차 재활성 필요',
    shortLabel: '6M',
    color: '#ef4444',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
    description: '180일 경과 - 긴급 재활성 필요',
    daysThreshold: 180,
  },
};

/** 날짜로부터 경과 일수 계산 */
export function getDaysElapsed(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();

  // 시간 차이를 밀리초로 계산 후 일수로 변환
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/** 날짜로부터 재활성 레벨 계산 */
export function getReviewLevel(dateString: string): ReviewLevel {
  const daysElapsed = getDaysElapsed(dateString);

  if (daysElapsed >= 180) return 'LEVEL_3'; // 6개월 (180일)
  if (daysElapsed >= 90) return 'LEVEL_2'; // 3개월 (90일)
  if (daysElapsed >= 30) return 'LEVEL_1'; // 1개월 (30일)
  return 'NONE';
}

/** Mastered 상태 기준 (count >= 5) */
export const MASTERED_THRESHOLD = 5;

/**
 * 토픽별 가장 최근 날짜에서 재활성 레벨 계산
 * - Mastered 상태(count >= 5)면 재활성 불필요
 */
export function getTopicReviewLevel(dates: string[], count?: number): ReviewLevel {
  if (dates.length === 0) return 'NONE';

  // Mastered 상태면 재활성 불필요
  const topicCount = count ?? dates.length;
  if (topicCount >= MASTERED_THRESHOLD) return 'NONE';

  // 가장 최근 날짜 찾기
  const sortedDates = [...dates].sort((a, b) => (a < b ? 1 : -1));
  const mostRecentDate = sortedDates[0];

  return getReviewLevel(mostRecentDate);
}

/** 재활성 레벨 우선순위 (높을수록 긴급) */
export function getReviewLevelPriority(level: ReviewLevel): number {
  switch (level) {
    case 'LEVEL_3':
      return 3;
    case 'LEVEL_2':
      return 2;
    case 'LEVEL_1':
      return 1;
    case 'NONE':
      return 0;
  }
}

/** 여러 재활성 레벨 중 가장 높은 레벨 반환 */
export function getHighestReviewLevel(levels: ReviewLevel[]): ReviewLevel {
  if (levels.length === 0) return 'NONE';

  let highest: ReviewLevel = 'NONE';
  let highestPriority = 0;

  for (const level of levels) {
    const priority = getReviewLevelPriority(level);
    if (priority > highestPriority) {
      highestPriority = priority;
      highest = level;
    }
  }

  return highest;
}

/** 재활성이 필요한지 확인 */
export function needsReview(level: ReviewLevel): boolean {
  return level !== 'NONE';
}

/** 재활성 항목 타입 */
export type ReviewItem = {
  topic: string;
  category: string;
  domain: string;
  lastDate: string;
  level: ReviewLevel;
  count: number;
  urls: string[];
};

/** 토픽별 재활성 항목 계산 */
export function calculateReviewItems<
  T extends { topic: string; category: string; domain: string; date: string; url: string },
>(contents: T[]): ReviewItem[] {
  const topicMap = new Map<
    string,
    {
      topic: string;
      category: string;
      domain: string;
      dates: string[];
      urls: string[];
    }
  >();

  for (const content of contents) {
    const key = `${content.domain}-${content.category}-${content.topic}`;
    const existing = topicMap.get(key);

    if (existing) {
      existing.dates.push(content.date);
      existing.urls.push(content.url);
    } else {
      topicMap.set(key, {
        topic: content.topic,
        category: content.category,
        domain: content.domain,
        dates: [content.date],
        urls: [content.url],
      });
    }
  }

  const reviewItems: ReviewItem[] = [];

  for (const [, value] of topicMap) {
    const sortedDates = [...value.dates].sort((a, b) => (a < b ? 1 : -1));
    const lastDate = sortedDates[0];
    const count = value.dates.length;

    // Mastered 상태(count >= 5)면 재활성 불필요
    if (count >= MASTERED_THRESHOLD) continue;

    const level = getReviewLevel(lastDate);

    if (needsReview(level)) {
      reviewItems.push({
        topic: value.topic,
        category: value.category,
        domain: value.domain,
        lastDate,
        level,
        count,
        urls: value.urls,
      });
    }
  }

  // 긴급도순 정렬 (LEVEL_3 > LEVEL_2 > LEVEL_1)
  reviewItems.sort((a, b) => {
    const priorityDiff = getReviewLevelPriority(b.level) - getReviewLevelPriority(a.level);
    if (priorityDiff !== 0) return priorityDiff;
    // 같은 레벨이면 날짜 오래된 순
    return a.lastDate < b.lastDate ? -1 : 1;
  });

  return reviewItems;
}
