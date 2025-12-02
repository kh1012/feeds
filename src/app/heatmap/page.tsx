'use client';

import { useEffect, useState } from 'react';
import { getDomainBasedHeatmapData, DomainTreeData } from '@/components/heatmap/matrixBuilder';
import SkillHeatmap from '@/components/heatmap/SkillHeatMap';
import PortalOverlay from '@/components/common/PortalOverlay';
import { Spinner } from '@/components/common/Spinner';

export default function HeatmapPage() {
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<DomainTreeData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsPending(true);

      try {
        const heatmapData = await getDomainBasedHeatmapData();
        setData(heatmapData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsPending(false);
      }
    };

    fetchData();
  }, []);

  if (data.length === 0 || isPending) {
    return (
      <PortalOverlay>
        <Spinner />
      </PortalOverlay>
    );
  }

  return (
    <div className="p-4 sm:p-8 mx-auto" style={{ maxWidth: 1248 }}>
      <SkillHeatmap data={data} />
    </div>
  );
}
