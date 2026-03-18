'use client';

import Link from 'next/link';
import { DocMetaWithUrl } from '@/define/metaDefines';
import { findRelatedDocs } from '@/utils/searchUtils';
import { getSlugFromUrl } from '@/utils/feedUtils';
import { formatName } from '@/utils/formatUtils';
import { formatDateWithDay } from '@/utils/dateUtils';
import { useMemo } from 'react';

type RelatedFeedsProps = {
  currentDoc: DocMetaWithUrl;
  allDocs: DocMetaWithUrl[];
};

export default function RelatedFeeds({ currentDoc, allDocs }: RelatedFeedsProps) {
  const relatedDocs = useMemo(
    () => findRelatedDocs(currentDoc, allDocs, 3),
    [currentDoc, allDocs]
  );

  if (relatedDocs.length === 0) return null;

  return (
    <section className="mt-5 px-4 lg:px-0">
      <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
        관련 글 추천
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {relatedDocs.map((doc) => {
          const slug = getSlugFromUrl(doc.rawUrl);
          return (
            <Link
              key={doc.rawUrl}
              href={`/feeds/${slug}`}
              className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]/80 p-4 hover:border-[var(--accent)]/40 hover:shadow-[0_2px_12px_rgba(171,155,133,0.08)] active:scale-[0.97] active:shadow-none transition-all duration-200"
            >
              <div className="text-sm font-medium text-[var(--foreground)] mb-2 line-clamp-2 leading-snug">
                {doc.topic}
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--accent-light)] text-[var(--accent-text)]">
                  {formatName(doc.domain)}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--hover-bg)] text-[var(--text-secondary)]">
                  {formatName(doc.category)}
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {formatDateWithDay(doc.date)}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
