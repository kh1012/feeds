import matter from 'gray-matter';
import { DocMeta } from '@/define/metaDefines';

export type ParsedMarkdown = {
  meta: DocMeta;
  writing: string;
};

export function parseMarkdownWithMeta(raw: string): ParsedMarkdown {
  const { data, content } = matter(raw);

  return {
    meta: data as DocMeta,
    writing: content,
  };
}
