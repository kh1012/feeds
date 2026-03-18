import { useQuery } from '@tanstack/react-query';
import { DocMetaWithUrl } from '@/define/metaDefines';

export const FEED_CONTENTS_QUERY_KEY = ['feedContents'] as const;

/** /api/contents 서버 API를 통해 피드 데이터를 가져옴 */
async function fetchFeedContents(): Promise<DocMetaWithUrl[]> {
  const res = await fetch('/api/contents');
  if (!res.ok) {
    throw new Error('Failed to fetch feed contents');
  }
  const data = await res.json();
  return data.contents as DocMetaWithUrl[];
}

export function useGetFeedContents() {
  return useQuery<DocMetaWithUrl[]>({
    queryKey: FEED_CONTENTS_QUERY_KEY,
    queryFn: fetchFeedContents,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
