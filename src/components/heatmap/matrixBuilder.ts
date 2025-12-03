import matter from 'gray-matter';
import { fetchTilContentMarkdown, fetchTilContents } from '@/utils/tilUtils';
import { baseCategories, baseTopics } from './skillSchema';
import { DocMeta } from '@/define/metaDefines';
import { TilContentType } from '@/define/tilDefines';
import { extractSummary } from '@/utils/mdParseUtils';
import { DocMetaWithUrl, HeatmapMatrixResult } from './heatmapTypes';

// 타입 및 함수 재export (하위 호환성)
export type {
  DocMetaWithUrl,
  TopicDocInfo,
  CategoryTopicData,
  DomainTreeData,
} from './heatmapTypes';
export { getDomainBasedHeatmapData } from './domainHeatmap';

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

/** Heatmap용 매트릭스 생성 */
export function buildHeatmapMatrix(docs: DocMeta[]): HeatmapMatrixResult {
  const docCategorySet = new Set<string>();
  for (const d of docs) {
    docCategorySet.add(d.category);
  }

  const dynamicCategories = Array.from(docCategorySet).filter(
    (c) => !(baseCategories as readonly string[]).includes(c),
  );

  const categories: string[] = [...baseCategories, ...dynamicCategories.sort()];

  const topicSet = new Set<string>();
  for (const cat of Object.keys(baseTopics)) {
    for (const t of baseTopics[cat] ?? []) {
      topicSet.add(t);
    }
  }
  for (const d of docs) {
    topicSet.add(d.topic);
  }

  const topics: string[] = Array.from(topicSet);
  const matrix: number[][] = categories.map(() => topics.map(() => 0));

  for (const doc of docs) {
    const row = categories.indexOf(doc.category);
    const col = topics.indexOf(doc.topic);
    if (row === -1 || col === -1) continue;

    const weight = doc.type === 'troubleshooting' ? 2 : 1;
    matrix[row][col] += weight;
  }

  return { categories, topics, matrix };
}

/** 페이지에서 한 번에 호출할 헬퍼 (비동기) */
export async function getHeatmapData() {
  const docs = await loadAllDocs();
  return buildHeatmapMatrix(docs);
}
