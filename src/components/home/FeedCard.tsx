'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TilContentType } from '@/define/tilDefines';
import { FEEDS_URLS } from '@/define/urlDefines';
import { formatDateWithDay } from '@/utils/dateUtils';
import Button from '@/components/common/Button';
import { DocMeta } from '@/define/metaDefines';
import Tag from '@/components/common/Tag';
import { formatName } from '@/utils/formatUtils';
import { getSlugFromUrl } from '@/utils/feedUtils';

interface FeedCardProps {
  content: TilContentType;
  meta?: DocMeta & { rawUrl: string; url: string; title: string; date: string; summary?: string };
}

export const FeedCard = ({ content, meta }: FeedCardProps) => {
  const [keywordsExpanded, setKeywordsExpanded] = useState<boolean>(false);

  const slug = getSlugFromUrl(content.rawUrl);

  // keywords 5개까지만 노출
  const keywords = meta?.keywords ?? [];
  const isLongKeywords = keywords.length > 5;
  const displayKeywords = isLongKeywords && !keywordsExpanded ? keywords.slice(0, 5) : keywords;

  const onClickKeywordsExpandHandler = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setKeywordsExpanded(!keywordsExpanded);
  };

  return (
    <article className="w-full bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all">
      <Link href={`/feeds/${slug}`} className="block p-4">
        {/* 헤더: 프로필 + 날짜 */}
        <header className="flex items-center gap-3 mb-3">
          <Image
            src={`${FEEDS_URLS.GITHUB_TIL_ASSETS_RAW}/profile-img.jpg`}
            alt={'프로필'}
            width={40}
            height={40}
            className="size-9 rounded-full border border-neutral-200 object-cover"
            loading={'lazy'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900 text-sm">kh1012</span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-500 text-xs">{formatDateWithDay(content.date)}</span>
            </div>
          </div>
        </header>

        {/* 제목 */}
        <h2 className="text-lg font-semibold text-neutral-900 mb-2 leading-snug">
          {meta?.topic ?? content.title}
        </h2>

        {/* 요약 */}
        {meta?.summary && (
          <p className="text-sm text-neutral-600 line-clamp-3 mb-3 leading-relaxed">
            {meta.summary}
          </p>
        )}

        {/* 메타 정보 + 키워드 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Domain / Category 배지 */}
          {meta && (
            <>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-600">
                {formatName(meta.domain)}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-neutral-100 text-neutral-600">
                {formatName(meta.category)}
              </span>
            </>
          )}

          {/* 키워드 태그 */}
          {displayKeywords.map((keyword) => (
            <Tag key={keyword}>{keyword}</Tag>
          ))}
          {isLongKeywords && (
            <Button onClick={onClickKeywordsExpandHandler} transparent>
              <span className="text-xs text-blue-400">{!keywordsExpanded ? '...' : ''}</span>
            </Button>
          )}
        </div>
      </Link>

      {/* 푸터: GitHub 링크 */}
      <div className="px-4 py-2.5 border-t border-neutral-100 flex items-center justify-between">
        <a
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <span className="text-xs text-neutral-400">
          {getSlugFromUrl(content.rawUrl)}
        </span>
      </div>
    </article>
  );
};
