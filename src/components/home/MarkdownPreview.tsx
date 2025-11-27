import type { KeyboardEvent, ReactNode } from 'react';
import { MarkdownBlock } from '@/define/markdownDefines';

const renderInline = (text: string): ReactNode[] => {
  const segments = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return segments.map((segment, index) => {
    const isBold = segment.startsWith('**') && segment.endsWith('**');
    if (isBold) {
      return (
        <strong key={`${segment}-${index}`} className="font-semibold text-white">
          {segment.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
};

export const MarkdownPreview = ({
  blocks,
  showFade,
  expandable,
  expanded,
  onToggle,
}: {
  blocks: (MarkdownBlock & { lineCount: number })[];
  showFade: boolean;
  expandable: boolean;
  expanded: boolean;
  onToggle?: () => void;
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!expandable || !onToggle) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className={`relative mt-3 space-y-3 text-white/80 ${expandable ? 'cursor-pointer' : ''}`}
      onClick={expandable ? onToggle : undefined}
      onKeyDown={expandable ? handleKeyDown : undefined}
      role={expandable ? 'button' : undefined}
      tabIndex={expandable ? 0 : undefined}
      aria-expanded={expandable ? expanded : undefined}
    >
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const base = 'font-semibold tracking-tight text-white';
          const size =
            block.level === 1
              ? 'text-xl'
              : block.level === 2
                ? 'text-lg'
                : 'text-base text-white/70';

          return (
            <div key={`heading-${index}`} className={`${base} ${size}`}>
              {renderInline(block.text)}
            </div>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className="space-y-1 text-sm text-white/75">
              {block.items.map((item, itemIndex) => (
                <li key={`list-item-${itemIndex}`} className="flex gap-2">
                  <span aria-hidden>•</span>
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <div
            key={`paragraph-${index}`}
            className="space-y-1 text-sm leading-relaxed text-white/80"
          >
            {block.lines.map((line, lineIndex) => (
              <p key={`paragraph-line-${lineIndex}`}>{renderInline(line)}</p>
            ))}
          </div>
        );
      })}

      {showFade && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#1c1c1e] via-[#1c1c1e]/70 to-transparent"
          aria-hidden
        >
          <div className="absolute bottom-1.5 right-3 text-2xl text-white/60">…</div>
        </div>
      )}
    </div>
  );
};
