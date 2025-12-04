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








