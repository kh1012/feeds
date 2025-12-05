/**
 * "2025-11-17" 형식의 날짜 문자열을 "2025. 11. 17. 화요일" 형식으로 변환
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: "2025. 11. 17. 화요일")
 */
export function formatDateWithDay(dateString: string): string {
  const date = new Date(dateString);

  // Invalid Date 체크
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayOfWeek = dayNames[date.getDay()];

  return `${year}. ${month}. ${day}. ${dayOfWeek}`;
}

/**
 * ISO 8601 주차 계산
 * @param date - Date 객체
 * @returns 해당 연도의 주차 번호 (1-53)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * 날짜를 한국어 형식으로 포맷팅 (년, 월, 일)
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: "2025년 11월 17일")
 */
export function formatDateKorean(dateString: string): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜 문자열에서 년-월 키 추출
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns YYYY-MM 형식의 키
 */
export function getYearMonthKey(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth();
  return `${year}-${month.toString().padStart(2, '0')}`;
}

/**
 * 년-월 키를 한국어 라벨로 변환
 * @param key - YYYY-MM 형식의 키
 * @returns 한국어 라벨 (예: "2025년 11월")
 */
export function formatYearMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${year}년 ${parseInt(month) + 1}월`;
}

/**
 * 날짜 배열을 최신순으로 정렬
 * @param items - date 속성을 가진 객체 배열
 * @returns 최신순 정렬된 배열 (원본 배열 변경 없음)
 */
export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}
