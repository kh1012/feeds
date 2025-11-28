'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TilContentType } from '@/define/tilDefines';
import { fetchTilContentMarkdown } from '@/utils/tilUtils';
import { notFound } from 'next/navigation';
import { URL } from '@/define/urlDefines';
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
    <article className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#1c1c1e] p-6 text-white/90 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
      <header className="flex gap-4">
        <div className="relative">
          <Image
            src={`${URL.GITHUB_TIL_ASSETS_RAW}/profile-img.jpg`}
            alt={'프로필'}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-white/10 object-cover"
            loading={'lazy'}
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-10 h-full">
            <p className="font-semibold text-white">{content.date}</p>
            {/*<span className="text-sm text-white/50">{content.url}</span>*/}
          </div>
        </div>
      </header>

      <div className="prose prose-invert prose-sm max-w-none mt-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedMarkdown}</ReactMarkdown>
      </div>
      {isLong && (
        <button type={'button'} onClick={onClickExpandHandler}>
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </article>
  );
};
