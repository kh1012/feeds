'use client';

import PortalOverlay from '@/components/common/PortalOverlay';
import { Spinner } from '@/components/common/Spinner';
import { useGetFeedContents } from '@/hooks/useGetFeedContents';
import AnalysisDashboard from '@/components/analysis/AnalysisDashboard';
import { HEIGHTS } from '@/define/heightDefines';

export default function AnalysisPage() {
  const { data, isPending, isError } = useGetFeedContents();

  if (isPending && !data) {
    return (
      <PortalOverlay>
        <Spinner />
      </PortalOverlay>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-64 text-neutral-500"
        style={{ marginTop: HEIGHTS.GNB_HEIGHT }}
      >
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen" style={{ paddingTop: HEIGHTS.GNB_HEIGHT }}>
      <AnalysisDashboard data={data} />
    </div>
  );
}

