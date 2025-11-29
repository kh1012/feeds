'use client';

import { fetchTilContents } from '@/utils/tilUtils';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TilContentType } from '@/define/tilDefines';
import { FeedCard } from '@/components/home/FeedCard';
import { Spinner } from '@/components/common/Spinner';
import PortalOverlay from '@/components/common/PortalOverlay';

export default function HomeViewContent() {
  const [isPending, setIsPending] = useState(false);
  const [contents, setContents] = useState<TilContentType[]>([]);

  useEffect(() => {
    const asyncF = async () => {
      setIsPending(true);

      try {
        const tilContents = await fetchTilContents();
        if (tilContents.length === 0) {
          notFound();
        }
        return tilContents;
      } catch (err) {
        console.error(err);
        notFound();
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsPending(false);
      }
    };

    asyncF().then((r) => setContents(r));
  }, []);

  if (contents.length === 0 || isPending) {
    return (
      <PortalOverlay>
        <Spinner />
      </PortalOverlay>
    );
  }

  return (
    <div className={'space-y-6'}>
      {contents && contents.map((content) => <FeedCard key={content.title} content={content} />)}
    </div>
  );
}
