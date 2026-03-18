import matter from 'gray-matter';
import { fetchTilContentMarkdown, fetchTilContents } from '@/utils/tilUtils';
import { DocMeta, DocMetaWithUrl } from '@/define/metaDefines';
import { TilContentType } from '@/define/tilDefines';
import { extractSummary, extractHeading } from '@/utils/mdParseUtils';

/** 모든 TIL md에서 frontmatter 읽어오기 (비동기) */
export async function loadAllDocs(): Promise<DocMeta[]> {
  return await loadAllDocsWithUrl();
}

/** URL 정보가 포함된 문서 로드 */
export async function loadAllDocsWithUrl(): Promise<DocMetaWithUrl[]> {
  const tilContents = await fetchTilContents();
  const docs: DocMetaWithUrl[] = [];

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

      const satisfaction = parseSatisfaction(data.satisfaction);

      docs.push({
        type: data.type,
        domain: String(data.domain ?? 'frontend').toLowerCase(),
        category: String(data.category).toLowerCase(),
        topic: String(data.topic),
        updatedAt: String(data.updatedAt ?? ''),
        keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
        relatedCategories: Array.isArray(data.relatedCategories)
          ? data.relatedCategories.map(String)
          : [],
        satisfaction,
        rawUrl: result.til.rawUrl,
        url: result.til.url,
        title: result.til.title,
        date: result.til.date,
        summary: extractSummary(content),
        heading: extractHeading(content),
      });
    } catch {
      console.warn(`Failed to parse frontmatter: ${result.til.rawUrl}`);
    }
  }

  return docs;
}

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
