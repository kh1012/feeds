import matter from 'gray-matter';
import { fetchTilContentMarkdown, fetchTilContents } from '@/utils/tilUtils';
import { baseCategories, baseTopics } from './skillSchema';
import { DocMeta } from '@/define/metaDefines';
import { TilContentType } from '@/define/tilDefines';
import { extractSummary } from '@/utils/mdParseUtils';

// URL이 포함된 문서 메타 타입
export type DocMetaWithUrl = DocMeta & {
  rawUrl: string;
  url: string;
  title: string;
  date: string;
  summary: string;
};

// 모든 TIL md에서 frontmatter 읽어오기 (비동기)
export async function loadAllDocs(): Promise<DocMeta[]> {
  const result = await loadAllDocsWithUrl();
  return result;
}

// URL 정보가 포함된 문서 로드
export async function loadAllDocsWithUrl(): Promise<DocMetaWithUrl[]> {
  const tilContents = await fetchTilContents();
  const docs: DocMetaWithUrl[] = [];

  // 모든 md 파일의 raw content를 병렬로 가져오기
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

      // 필수 필드 검증
      if (!data?.type || !data?.category || !data?.topic) continue;

      // satisfaction 파싱 (객체 형태: { score, reason })
      let satisfaction = undefined;
      if (data.satisfaction && typeof data.satisfaction === 'object') {
        const score = data.satisfaction.score;
        const reason = data.satisfaction.reason;
        if (typeof score === 'number' && score >= 0 && score <= 100) {
          satisfaction = {
            score,
            reason: reason ? String(reason) : '',
          };
        }
      }

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

// 토픽 관련 문서 정보
export type TopicDocInfo = {
  rawUrl: string;
  url: string;
  title: string;
  date: string;
};

// 카테고리별 토픽-값 데이터 구조
export type CategoryTopicData = {
  category: string;
  topics: Array<{
    name: string;
    value: number;
    docs: TopicDocInfo[];
  }>;
  totalValue: number;
};

// Domain 기반 트리 구조 데이터
export type DomainTreeData = {
  domain: string;
  categories: CategoryTopicData[];
  totalValue: number;
};

// 카테고리별 히트맵 데이터 생성 (비동기) - deprecated, getDomainBasedHeatmapData 사용 권장
export async function getCategoryBasedHeatmapData(): Promise<CategoryTopicData[]> {
  const docs = await loadAllDocsWithUrl();

  // 카테고리별 토픽 값 계산
  const categoryMap = new Map<string, Map<string, TopicData>>();

  // baseCategories 기준으로 초기화
  for (const cat of baseCategories) {
    const topicMap = new Map<string, TopicData>();
    const topics = baseTopics[cat] ?? [];
    for (const topic of topics) {
      topicMap.set(topic, { value: 0, docs: [] });
    }
    categoryMap.set(cat, topicMap);
  }

  // 문서 데이터 반영
  for (const doc of docs) {
    const topicMap = categoryMap.get(doc.category);
    if (!topicMap) {
      // 새로운 카테고리인 경우
      const newTopicMap = new Map<string, TopicData>();
      newTopicMap.set(doc.topic, {
        value: doc.type === 'troubleshooting' ? 2 : 1,
        docs: [{ rawUrl: doc.rawUrl, url: doc.url, title: doc.title, date: doc.date }],
      });
      categoryMap.set(doc.category, newTopicMap);
    } else {
      const current = topicMap.get(doc.topic) ?? { value: 0, docs: [] };
      const weight = doc.type === 'troubleshooting' ? 2 : 1;
      topicMap.set(doc.topic, {
        value: current.value + weight,
        docs: [
          ...current.docs,
          { rawUrl: doc.rawUrl, url: doc.url, title: doc.title, date: doc.date },
        ],
      });
    }
  }

  // 결과 배열로 변환
  const result: CategoryTopicData[] = [];

  for (const [category, topicMap] of categoryMap) {
    const topics = Array.from(topicMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      docs: data.docs,
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

// 토픽별 데이터 (값 + 문서 목록)
type TopicData = {
  value: number;
  docs: TopicDocInfo[];
};

// Domain 기반 트리 구조 히트맵 데이터 생성 (비동기)
export async function getDomainBasedHeatmapData(): Promise<DomainTreeData[]> {
  const docs = await loadAllDocsWithUrl();

  // Domain > Category > Topic 구조로 데이터 구성
  // Map<domain, Map<category, Map<topic, TopicData>>>
  const domainMap = new Map<string, Map<string, Map<string, TopicData>>>();

  // baseCategories 기준으로 초기화 (frontend domain에 배치)
  const frontendCategoryMap = new Map<string, Map<string, TopicData>>();
  for (const cat of baseCategories) {
    const topicMap = new Map<string, TopicData>();
    const topics = baseTopics[cat] ?? [];
    for (const topic of topics) {
      topicMap.set(topic, { value: 0, docs: [] });
    }
    frontendCategoryMap.set(cat, topicMap);
  }
  domainMap.set('frontend', frontendCategoryMap);

  // 문서 데이터 반영
  for (const doc of docs) {
    const domain = doc.domain || 'frontend';

    if (!domainMap.has(domain)) {
      domainMap.set(domain, new Map());
    }

    const categoryMap = domainMap.get(domain)!;

    if (!categoryMap.has(doc.category)) {
      categoryMap.set(doc.category, new Map());
    }

    const topicMap = categoryMap.get(doc.category)!;
    const current = topicMap.get(doc.topic) ?? { value: 0, docs: [] };
    const weight = doc.type === 'troubleshooting' ? 2 : 1;

    topicMap.set(doc.topic, {
      value: current.value + weight,
      docs: [
        ...current.docs,
        {
          rawUrl: doc.rawUrl,
          url: doc.url,
          title: doc.title,
          date: doc.date,
        },
      ],
    });
  }

  // 결과 배열로 변환
  const result: DomainTreeData[] = [];

  for (const [domain, categoryMap] of domainMap) {
    const categories: CategoryTopicData[] = [];

    for (const [category, topicMap] of categoryMap) {
      const topics = Array.from(topicMap.entries()).map(([name, data]) => ({
        name,
        value: data.value,
        docs: data.docs,
      }));

      const totalValue = topics.reduce((sum, t) => sum + t.value, 0);

      categories.push({
        category,
        topics,
        totalValue,
      });
    }

    // 카테고리 정렬
    categories.sort((a, b) => {
      const aIdx = (baseCategories as readonly string[]).indexOf(a.category);
      const bIdx = (baseCategories as readonly string[]).indexOf(b.category);

      if (aIdx === -1 && bIdx === -1) return a.category.localeCompare(b.category);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    const domainTotal = categories.reduce((sum, c) => sum + c.totalValue, 0);

    result.push({
      domain,
      categories,
      totalValue: domainTotal,
    });
  }

  // domain 정렬: frontend 먼저, 나머지는 알파벳순
  result.sort((a, b) => {
    if (a.domain === 'frontend') return -1;
    if (b.domain === 'frontend') return 1;
    return a.domain.localeCompare(b.domain);
  });

  return result;
}
