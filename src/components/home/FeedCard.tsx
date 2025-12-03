'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TilContentType } from '@/define/tilDefines';
import { fetchTilContentMarkdown } from '@/utils/tilUtils';
import { notFound } from 'next/navigation';
import { FEEDS_URLS } from '@/define/urlDefines';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { parseMarkdownWithMeta } from '@/utils/mdParseUtils';
import { formatDateWithDay } from '@/utils/dateUtils';
import Button from '@/components/common/Button';
import { DocMeta } from '@/define/metaDefines';
import Tag from '@/components/common/Tag';
import { formatName } from '@/utils/formatUtils';

interface FeedCardProps {
  content: TilContentType;
  meta?: DocMeta & { rawUrl: string; url: string; title: string; date: string };
}

export const FeedCard = ({ content, meta: initialMeta }: FeedCardProps) => {
  const [docMeta, setDocMeta] = useState<DocMeta | null>(initialMeta ?? null);
  const [markdownValue, setMarkdownValue] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [keywordsExpanded, setKeywordsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const asyncF = async () => {
      try {
        const md = await fetchTilContentMarkdown(content.rawUrl);
        const { meta, writing } = parseMarkdownWithMeta(md);
        return {
          meta,
          writing,
        };
      } catch (err) {
        console.error(err);
        notFound();
      }
    };

    asyncF().then((r) => {
      if (!initialMeta) {
        setDocMeta(r.meta);
      }
      setMarkdownValue(r.writing);
    });
  }, [content.rawUrl, initialMeta]);

  if (!markdownValue) {
    return null;
  }

  // 줄 단위로 잘라서 확인
  const lines = markdownValue.split('\n');
  const isLong = lines.length > 10;
  const preview = lines.slice(0, 4).join('\n');
  const displayedMarkdown = expanded ? markdownValue : preview;

  const urlLastPath = content.url.split('/').pop();
  const shortUrl =
    urlLastPath && urlLastPath?.length < 24 ? urlLastPath : urlLastPath?.slice(0, 24) + '...';

  const onClickExpandHandler = () => {
    setExpanded(!expanded);
  };

  // keywords 5개까지만 노출 많을 시 ... 처리
  const keywords = docMeta?.keywords ?? [];
  const isLongKeywords = keywords.length > 5;
  const displayKeywords = isLongKeywords && !keywordsExpanded ? keywords.slice(0, 5) : keywords;

  const onClickKeywordsExpandHandler = () => {
    setKeywordsExpanded(!keywordsExpanded);
  };

  return (
    <article className="w-full bg-white lg:rounded-lg lg:border lg:border-neutral-200">
      <div className="w-full flex flex-col gap-3 text-[#1f2328] p-4 lg:p-5">
        {/* 헤더: 프로필 + 메타 정보 */}
        <header className="flex gap-3">
          <div className="relative shrink-0">
            <Image
              src={`${FEEDS_URLS.GITHUB_TIL_ASSETS_RAW}/profile-img.jpg`}
              alt={'프로필'}
              width={48}
              height={48}
              className="size-10 sm:size-11 rounded-full border border-neutral-200 object-cover"
              loading={'lazy'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900 text-sm">kh1012</span>
              <span className="text-neutral-400 text-xs">·</span>
              <span className="text-neutral-500 text-xs">
                {formatDateWithDay(content.date)}
              </span>
            </div>
            {/* Domain / Category 배지 */}
            {docMeta && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-600">
                  {formatName(docMeta.domain)}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-neutral-100 text-neutral-600">
                  {formatName(docMeta.category)}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* 키워드 태그 */}
        {displayKeywords.length > 0 && (
          <div className="flex flex-row flex-wrap gap-1.5">
            {displayKeywords.map((keyword) => (
              <Tag key={keyword}>{keyword}</Tag>
            ))}
            {isLongKeywords && (
              <Button onClick={onClickKeywordsExpandHandler} transparent>
                <span className="text-xs text-blue-400">{!keywordsExpanded ? '...' : ''}</span>
              </Button>
            )}
          </div>
        )}

        {/* 마크다운 본문 */}
        <div className="prose-github max-w-none text-[#1f2328] text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {displayedMarkdown}
          </ReactMarkdown>
        </div>

        {/* 더보기 버튼 */}
        {isLong && (
          <div className="flex justify-center pt-1">
            <Button onClick={onClickExpandHandler} transparent>
              <span className="text-blue-500 text-sm">
                {expanded ? '접기' : '더보기'}
              </span>
            </Button>
          </div>
        )}

        {/* GitHub 링크 */}
        <div className="pt-2 border-t border-neutral-100">
          <a
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-blue-500 transition-colors"
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="truncate hidden sm:inline">{content.url}</span>
            <span className="sm:hidden">{shortUrl}</span>
          </a>
        </div>
      </div>
    </article>
  );
};
