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
    <>
      <div
        className={
          'w-full flex justify-center text-neutral-600 py-4 text-sm sm:text-base bg-neutral-100'
        }
      >
        {contents.length}개의 기록
      </div>

      <div className="w-full flex flex-col">
        {contents && contents.map((content) => <FeedCard key={content.title} content={content} />)}
      </div>
    </>
  );
}
