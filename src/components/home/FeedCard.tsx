'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Post } from '@/define/postDefines';
import { buildBlocks, clampBlocks } from '@/utils/markdownUtils';
import { MAX_VISIBLE_LINES } from '@/define/markdownDefines';
import { MarkdownPreview } from './MarkdownPreview';

export const FeedCard = ({ post }: { post: Post }) => {
  const [expanded, setExpanded] = useState(false);
  const blocks = useMemo(() => buildBlocks(post.content), [post.content]);
  const { visible: clampedBlocks, truncated } = useMemo(
    () => clampBlocks(blocks, MAX_VISIBLE_LINES),
    [blocks],
  );

  const displayedBlocks = expanded ? blocks : clampedBlocks;
  const showFade = !expanded && truncated;
  const handleToggle = () => setExpanded((prev) => !prev);

  return (
    <article className="rounded-[28px] border border-white/10 bg-[#1c1c1e] p-6 text-white/90 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
      <header className="flex gap-4">
        <div className="relative">
          <Image
            src={post.author.avatar}
            alt={`${post.author.name} 아바타`}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-white/10 object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 h-full">
            <p className="font-semibold text-white">{post.author.name}</p>
            <span className="text-sm text-white/50">{post.author.handle}</span>
            <span className="text-sm text-white/30">· {post.timestamp}</span>
          </div>
        </div>
      </header>

      <MarkdownPreview
        blocks={displayedBlocks}
        showFade={showFade}
        expandable={truncated}
        expanded={expanded}
        onToggle={truncated ? handleToggle : undefined}
      />
    </article>
  );
};
