import { useQuery } from '@tanstack/react-query';
import { fetchTilContents } from '@/utils/tilUtils';
import { TilContentType } from '@/define/tilDefines';

export const TIL_CONTENTS_QUERY_KEY = ['tilContents'] as const;

export function useGetTilContents() {
  return useQuery<TilContentType[]>({
    queryKey: TIL_CONTENTS_QUERY_KEY,
    queryFn: fetchTilContents,
  });
}

