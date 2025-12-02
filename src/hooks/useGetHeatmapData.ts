import { useQuery } from '@tanstack/react-query';
import { getDomainBasedHeatmapData, DomainTreeData } from '@/components/heatmap/matrixBuilder';

export const HEATMAP_DATA_QUERY_KEY = ['heatmapData'] as const;

export function useGetHeatmapData() {
  return useQuery<DomainTreeData[]>({
    queryKey: HEATMAP_DATA_QUERY_KEY,
    queryFn: getDomainBasedHeatmapData,
  });
}

