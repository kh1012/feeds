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

interface FeedCardProps {
  content: TilContentType;
}

export const FeedCard = ({ content }: FeedCardProps) => {
  const [markdownValue, setMarkdownValue] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    const asyncF = async () => {
      try {
        const md = await fetchTilContentMarkdown(content.rawUrl);
        const { meta, writing } = parseMarkdownWithMeta(md);
        return writing;
      } catch (err) {
        console.error(err);
        notFound();
      }
    };

    asyncF().then((r) => setMarkdownValue(r));
  }, [content.rawUrl]);

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

  return (
    <article className="w-full bg-white flex justify-center border-t border-neutral-200">
      <div className="w-full flex flex-col gap-4 text-[#1f2328] p-4 bg-white sm:p-8 sm:max-w-3xl">
        <header className="flex gap-4">
          <div className="relative">
            <Image
              src={`${FEEDS_URLS.GITHUB_TIL_ASSETS_RAW}/profile-img.jpg`}
              alt={'프로필'}
              width={56}
              height={56}
              className="size-10 rounded-full border border-[#d1d9e0] object-cover sm:size-12"
              loading={'lazy'}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col flex-wrap items-start h-full">
              <p className="text-neutral-700 text-sm sm:text-base">
                {formatDateWithDay(content.date)}
              </p>
              <a
                className={'overflow-hidden sm:max-w-[618px]'}
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="truncate text-base text-blue-400 hidden sm:block">
                  {content.url}
                </span>
                <span className={'text-sm text-blue-400 sm:hidden'}>{shortUrl}</span>
              </a>
            </div>
          </div>
        </header>

        <div className="prose-github max-w-none mt-4 text-[#1f2328]">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {displayedMarkdown}
          </ReactMarkdown>
        </div>

        {isLong && (
          <div className={'flex justify-center'}>
            <Button onClick={onClickExpandHandler}>{expanded ? '접기' : '더보기'}</Button>
          </div>
        )}
      </div>
    </article>
  );
};
