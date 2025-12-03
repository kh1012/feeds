import { useQuery } from '@tanstack/react-query';
import type { ContentItem, ContentsResponse } from '@/app/api/contents/route';

export const CONTENTS_QUERY_KEY = ['contents'] as const;

async function fetchContents(): Promise<ContentItem[]> {
  const res = await fetch('/api/contents');
  if (!res.ok) {
    throw new Error('Failed to fetch contents');
  }
  const data: ContentsResponse = await res.json();
  return data.contents;
}

/**
 * Contents API를 통해 마크다운 콘텐츠를 가져오는 훅
 * - 서버에서 파싱된 frontmatter 데이터 포함
 * - domain, category, topic, title, summary 등 SEO 관련 정보 포함
 */
export function useGetContents() {
  return useQuery<ContentItem[]>({
    queryKey: CONTENTS_QUERY_KEY,
    queryFn: fetchContents,
    staleTime: 60 * 1000, // 1분
  });
}

// ContentItem 타입 재export
export type { ContentItem } from '@/app/api/contents/route';

