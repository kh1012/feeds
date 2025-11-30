import { getCategoryBasedHeatmapData } from '@/components/heatmap/matrixBuilder';
import SkillHeatmap from '@/components/heatmap/SkillHeatMap';
import PortalOverlay from '@/components/common/PortalOverlay';
import { Spinner } from '@/components/common/Spinner';

export default async function HeatmapPage() {
  const data = await getCategoryBasedHeatmapData();

  if (!data || data.length === 0) {
    return (
      <PortalOverlay>
        <Spinner />
      </PortalOverlay>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <SkillHeatmap data={data} />
    </div>
  );
}
