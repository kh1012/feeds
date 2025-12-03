import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import { fetchTilContentMarkdown, fetchTilContents } from '@/utils/tilUtils';
import { extractSummary } from '@/utils/mdParseUtils';
import { TilContentType } from '@/define/tilDefines';

export type ContentItem = {
  type: string;
  domain: string;
  category: string;
  topic: string;
  title: string;
  date: string;
  updatedAt: string;
  keywords: string[];
  relatedCategories: string[];
  summary: string;
  rawUrl: string;
  url: string;
  satisfaction?: {
    score: number;
    reason: string;
  };
};

export type ContentsResponse = {
  contents: ContentItem[];
  fetchedAt: string;
};

/** satisfaction 데이터 파싱 */
function parseSatisfaction(data: unknown) {
  if (!data || typeof data !== 'object') return undefined;

  const obj = data as Record<string, unknown>;
  const score = obj.score;
  const reason = obj.reason;

  if (typeof score === 'number' && score >= 0 && score <= 100) {
    return {
      score,
      reason: reason ? String(reason) : '',
    };
  }
  return undefined;
}

export async function GET() {
  try {
    const tilContents = await fetchTilContents();
    const contents: ContentItem[] = [];

    const markdownPromises = tilContents.map(async (til: TilContentType) => {
      try {
        const markdown = await fetchTilContentMarkdown(til.rawUrl);
        return { til, markdown };
      } catch {
        console.warn(`Failed to fetch: ${til.rawUrl}`);
        return null;
      }
    });

    const markdownResults = await Promise.all(markdownPromises);

    for (const result of markdownResults) {
      if (!result) continue;

      try {
        const { data, content } = matter(result.markdown);
        if (!data?.type || !data?.category || !data?.topic) continue;

        contents.push({
          type: data.type,
          domain: String(data.domain ?? 'frontend').toLowerCase(),
          category: String(data.category).toLowerCase(),
          topic: String(data.topic),
          title: result.til.title,
          date: result.til.date,
          updatedAt: String(data.updatedAt ?? result.til.date),
          keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
          relatedCategories: Array.isArray(data.relatedCategories)
            ? data.relatedCategories.map(String)
            : [],
          summary: extractSummary(content),
          rawUrl: result.til.rawUrl,
          url: result.til.url,
          satisfaction: parseSatisfaction(data.satisfaction),
        });
      } catch {
        console.warn(`Failed to parse frontmatter: ${result.til.rawUrl}`);
      }
    }

    // 날짜 기준 내림차순 정렬
    contents.sort((a, b) => (a.date < b.date ? 1 : -1));

    const response: ContentsResponse = {
      contents,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Failed to fetch contents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contents' },
      { status: 500 }
    );
  }
}

