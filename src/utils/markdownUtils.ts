import { MarkdownBlock } from '@/define/markdownDefines';

export const buildBlocks = (markdown: string): (MarkdownBlock & { lineCount: number })[] => {
  const lines = markdown.split('\n');
  const blocks: (MarkdownBlock & { lineCount: number })[] = [];

  let index = 0;
  while (index < lines.length) {
    const raw = lines[index];
    const trimmed = raw.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^###\s*/, '');
      blocks.push({ type: 'heading', level: 3, text, lines: [trimmed], lineCount: 1 });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^##\s*/, '');
      blocks.push({ type: 'heading', level: 2, text, lines: [trimmed], lineCount: 1 });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      const text = trimmed.replace(/^#\s*/, '');
      blocks.push({ type: 'heading', level: 1, text, lines: [trimmed], lineCount: 1 });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().replace(/^-+\s*/, ''));
        index += 1;
      }
      blocks.push({ type: 'list', items, lineCount: items.length });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('#') &&
      !lines[index].trim().startsWith('- ')
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push({ type: 'paragraph', lines: paragraphLines, lineCount: paragraphLines.length });
    }
  }

  return blocks;
};

export const clampBlocks = (
  blocks: (MarkdownBlock & { lineCount: number })[],
  maxLines: number,
): { visible: (MarkdownBlock & { lineCount: number })[]; truncated: boolean } => {
  const visible: (MarkdownBlock & { lineCount: number })[] = [];
  let remaining = maxLines;
  let truncated = false;

  for (const block of blocks) {
    if (remaining <= 0) {
      truncated = true;
      break;
    }

    if (block.lineCount <= remaining) {
      visible.push(block);
      remaining -= block.lineCount;
      continue;
    }

    truncated = true;

    if (block.type === 'paragraph') {
      visible.push({
        ...block,
        lines: block.lines.slice(0, remaining),
        lineCount: remaining,
      });
    } else if (block.type === 'list') {
      visible.push({
        ...block,
        items: block.items.slice(0, remaining),
        lineCount: remaining,
      });
    }

    break;
  }

  return { visible, truncated };
};
