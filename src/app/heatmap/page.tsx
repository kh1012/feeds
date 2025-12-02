'use client';

import SkillHeatmap from '@/components/heatmap/SkillHeatMap';
import PortalOverlay from '@/components/common/PortalOverlay';
import { Spinner } from '@/components/common/Spinner';
import { useGetHeatmapData } from '@/hooks/useGetHeatmapData';

export default function HeatmapPage() {
  const { data, isPending, isFetching, isError } = useGetHeatmapData();

  // 최초 로딩 시에만 스피너 표시 (캐시된 데이터가 있으면 표시 안 함)
  if (isPending && !data) {
    return (
      <PortalOverlay>
        <Spinner />
      </PortalOverlay>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 mx-auto" style={{ maxWidth: 1248 }}>
      <SkillHeatmap data={data} />
    </div>
  );
}
