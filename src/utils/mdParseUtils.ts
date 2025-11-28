import matter from 'gray-matter';

export type Meta = {
  title: string;
  date: string;
  type?: string;
  tags?: string[];
  summary?: string;
  featured?: boolean;
  [key: string]: any;
};

export type ParsedMarkdown = {
  meta: Meta;
  writing: string;
};

export function parseMarkdownWithMeta(raw: string): ParsedMarkdown {
  const { data, content } = matter(raw);

  return {
    meta: data as Meta,
    writing: content,
  };
}
