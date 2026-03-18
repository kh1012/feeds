import { useQuery } from '@tanstack/react-query';
import { loadAllDocsWithUrl } from '@/utils/docLoader';
import { DocMetaWithUrl } from '@/define/metaDefines';

export const FEED_CONTENTS_QUERY_KEY = ['feedContents'] as const;

export function useGetFeedContents() {
  return useQuery<DocMetaWithUrl[]>({
    queryKey: FEED_CONTENTS_QUERY_KEY,
    queryFn: loadAllDocsWithUrl,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
