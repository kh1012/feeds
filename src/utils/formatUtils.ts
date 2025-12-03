/**
 * 케밥 케이스 문자열을 타이틀 케이스로 변환합니다.
 * @example formatName('hello-world') => 'Hello World'
 */
export function formatName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

