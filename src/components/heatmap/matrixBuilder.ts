import matter from 'gray-matter';
import { fetchTilContents, fetchTilContentMarkdown } from '@/utils/tilUtils';
import { baseCategories, baseTopics } from './skillSchema';

// Front-matter 구조 정의
export type DocMeta = {
  type: 'skill' | 'troubleshooting';
  domain: string;
  category: string;
  topic: string;
  updatedAt: string;
  keywords: string[];
  relatedCategories: string[];
};

// 모든 TIL md에서 frontmatter 읽어오기 (비동기)
export async function loadAllDocs(): Promise<DocMeta[]> {
  const tilContents = await fetchTilContents();
  const docs: DocMeta[] = [];

  // 모든 md 파일의 raw content를 병렬로 가져오기
  const markdownPromises = tilContents.map(async (til) => {
    try {
      const markdown = await fetchTilContentMarkdown(til.rawUrl);
      return { rawUrl: til.rawUrl, markdown };
    } catch {
      console.warn(`Failed to fetch: ${til.rawUrl}`);
      return null;
    }
  });

  const markdownResults = await Promise.all(markdownPromises);

  for (const result of markdownResults) {
    if (!result) continue;

    try {
      const { data } = matter(result.markdown);

      // 필수 필드 검증
      if (!data?.type || !data?.category || !data?.topic) continue;
      if (data.type !== 'skill' && data.type !== 'troubleshooting') continue;

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
      });
    } catch {
      console.warn(`Failed to parse frontmatter: ${result.rawUrl}`);
    }
  }

  return docs;
}

// Heatmap용 매트릭스 생성 (base 스키마 + 동적 추가)
export function buildHeatmapMatrix(docs: DocMeta[]) {
  // 1) 카테고리: base + 실제 md에서 등장한 카테고리
  const docCategorySet = new Set<string>();
  for (const d of docs) {
    docCategorySet.add(d.category);
  }

  const dynamicCategories = Array.from(docCategorySet).filter(
    (c) => !(baseCategories as readonly string[]).includes(c),
  );

  const categories: string[] = [
    ...baseCategories,
    ...dynamicCategories.sort(), // base에 없는 건 뒤에 정렬해서 붙이기
  ];

  // 2) 토픽: baseTopics + 실제 md 토픽
  const topicSet = new Set<string>();

  // baseTopics에서 기본값 채우기
  for (const cat of Object.keys(baseTopics)) {
    for (const t of baseTopics[cat] ?? []) {
      topicSet.add(t);
    }
  }

  // md에서 나온 토픽도 추가
  for (const d of docs) {
    topicSet.add(d.topic);
  }

  const topics: string[] = Array.from(topicSet);

  // 3) 매트릭스 초기화
  const matrix: number[][] = categories.map(() => topics.map(() => 0));

  // 4) 데이터 채우기 (skill=1, troubleshooting=2 가중치)
  for (const doc of docs) {
    const row = categories.indexOf(doc.category);
    const col = topics.indexOf(doc.topic);

    if (row === -1 || col === -1) continue;

    const weight = doc.type === 'troubleshooting' ? 2 : 1;
    matrix[row][col] += weight;
  }

  return { categories, topics, matrix };
}

// 페이지에서 한 번에 호출할 헬퍼 (비동기)
export async function getHeatmapData() {
  const docs = await loadAllDocs();
  return buildHeatmapMatrix(docs);
}

// 카테고리별 토픽-값 데이터 구조
export type CategoryTopicData = {
  category: string;
  topics: Array<{
    name: string;
    value: number;
  }>;
  totalValue: number;
};

// 카테고리별 히트맵 데이터 생성 (비동기)
export async function getCategoryBasedHeatmapData(): Promise<CategoryTopicData[]> {
  const docs = await loadAllDocs();

  // 카테고리별 토픽 값 계산
  const categoryMap = new Map<string, Map<string, number>>();

  // baseCategories 기준으로 초기화
  for (const cat of baseCategories) {
    const topicMap = new Map<string, number>();
    const topics = baseTopics[cat] ?? [];
    for (const topic of topics) {
      topicMap.set(topic, 0);
    }
    categoryMap.set(cat, topicMap);
  }

  // 문서 데이터 반영
  for (const doc of docs) {
    const topicMap = categoryMap.get(doc.category);
    if (!topicMap) {
      // 새로운 카테고리인 경우
      const newTopicMap = new Map<string, number>();
      newTopicMap.set(doc.topic, doc.type === 'troubleshooting' ? 2 : 1);
      categoryMap.set(doc.category, newTopicMap);
    } else {
      const currentValue = topicMap.get(doc.topic) ?? 0;
      const weight = doc.type === 'troubleshooting' ? 2 : 1;
      topicMap.set(doc.topic, currentValue + weight);
    }
  }

  // 결과 배열로 변환
  const result: CategoryTopicData[] = [];

  for (const [category, topicMap] of categoryMap) {
    const topics = Array.from(topicMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    const totalValue = topics.reduce((sum, t) => sum + t.value, 0);

    result.push({
      category,
      topics,
      totalValue,
    });
  }

  // baseCategories 순서대로 정렬, 나머지는 뒤에
  result.sort((a, b) => {
    const aIdx = (baseCategories as readonly string[]).indexOf(a.category);
    const bIdx = (baseCategories as readonly string[]).indexOf(b.category);

    if (aIdx === -1 && bIdx === -1) return a.category.localeCompare(b.category);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  return result;
}
