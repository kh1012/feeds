'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TilContentType } from '@/define/tilDefines';
import { fetchTilContentMarkdown } from '@/utils/tilUtils';
import { notFound } from 'next/navigation';
import { FEEDS_URLS } from '@/define/urlDefines';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseMarkdownWithMeta } from '@/utils/mdParseUtils';

const MAX_LINES = 4;

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
  const isLong = lines.length > 4;
  const preview = lines.slice(0, 4).join('\n');
  const displayedMarkdown = expanded ? markdownValue : preview;

  const onClickExpandHandler = () => {
    setExpanded(!expanded);
  };

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#d1d9e0] bg-white p-6 text-[#1f2328] shadow-sm hover:shadow-md transition-shadow">
      <header className="flex gap-4">
        <div className="relative">
          <Image
            src={`${FEEDS_URLS.GITHUB_TIL_ASSETS_RAW}/profile-img.jpg`}
            alt={'프로필'}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-[#d1d9e0] object-cover"
            loading={'lazy'}
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-10 h-full">
            <p className="font-semibold text-[#1f2328]">{content.date}</p>
            {/*<span className="text-sm text-white/50">{content.url}</span>*/}
          </div>
        </div>
      </header>

      <div className="prose prose-sm max-w-none mt-4 prose-headings:text-[#1f2328] prose-p:text-[#1f2328] prose-a:text-[#0969da]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedMarkdown}</ReactMarkdown>
      </div>
      {isLong && (
        <button
          type={'button'}
          onClick={onClickExpandHandler}
          className="text-[#0969da] hover:underline text-sm font-medium"
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </article>
  );
};
