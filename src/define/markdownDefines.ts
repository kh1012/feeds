export const MAX_VISIBLE_LINES = 4;

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string; lines: string[] }
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] };
