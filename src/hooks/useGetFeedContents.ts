import { useQuery } from '@tanstack/react-query';
import { loadAllDocsWithUrl, DocMetaWithUrl } from '@/components/heatmap/matrixBuilder';

export const FEED_CONTENTS_QUERY_KEY = ['feedContents'] as const;

export function useGetFeedContents() {
  return useQuery<DocMetaWithUrl[]>({
    queryKey: FEED_CONTENTS_QUERY_KEY,
    queryFn: loadAllDocsWithUrl,
  });
}

// 도메인/카테고리 목록 추출 유틸
export function extractFilters(docs: DocMetaWithUrl[]) {
  const domains = new Set<string>();
  const categories = new Set<string>();

  for (const doc of docs) {
    domains.add(doc.domain);
    categories.add(doc.category);
  }

  return {
    domains: Array.from(domains).sort(),
    categories: Array.from(categories).sort(),
  };
}

// 필터링 유틸
export function filterDocs(
  docs: DocMetaWithUrl[],
  filters: { domain: string | null; category: string | null }
): DocMetaWithUrl[] {
  return docs.filter((doc) => {
    if (filters.domain && doc.domain !== filters.domain) return false;
    if (filters.category && doc.category !== filters.category) return false;
    return true;
  });
}

