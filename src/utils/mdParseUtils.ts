import matter from 'gray-matter';
import { DocMeta } from '@/define/metaDefines';

export type ParsedMarkdown = {
  meta: DocMeta;
  writing: string;
};

export function parseMarkdownWithMeta(raw: string): ParsedMarkdown {
  const { data, content } = matter(raw);

  return {
    meta: data as DocMeta,
    writing: content,
  };
}

/**
 * 마크다운 본문에서 요약(첫 문단)을 추출합니다.
 * - 첫 번째 제목(#)은 건너뜁니다.
 * - 첫 번째 비어있지 않은 텍스트 단락을 반환합니다.
 */
export function extractSummary(content: string, maxLength = 120): string {
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // 빈 줄, 제목(#), 코드블록(```) 무시
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) {
      continue;
    }
    // 리스트나 인용문 마커 제거, 마크다운 문법 정리
    const cleaned = trimmed
      .replace(/^[-*>]\s*/, '')
      .replace(/\*\*(.+?)\*\*/g, '$1') // bold 제거
      .replace(/\*(.+?)\*/g, '$1') // italic 제거
      .replace(/`(.+?)`/g, '$1'); // inline code 제거

    if (cleaned) {
      return cleaned.length > maxLength
        ? cleaned.slice(0, maxLength - 3) + '...'
        : cleaned;
    }
  }

  return '';
}
