import { getCategoryBasedHeatmapData } from '@/components/heatmap/matrixBuilder';
import SkillHeatmap from '@/components/heatmap/SkillHeatMap';
import GNB from '@/components/common/GNB';
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
    <div className="min-h-screen bg-white text-[#1f2328]">
      <GNB />

      <main className="mx-auto max-w-5xl p-4 sm:p-8">
        <div className="border border-neutral-200 rounded-lg p-4 sm:p-6">
          <SkillHeatmap data={data} />
        </div>
      </main>
    </div>
  );
}
