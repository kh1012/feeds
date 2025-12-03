import { baseCategories, baseTopics } from './skillSchema';
import { loadAllDocsWithUrl } from './matrixBuilder';
import {
  DocMetaWithUrl,
  TopicData,
  DomainTreeData,
  CategoryTopicData,
} from './heatmapTypes';

/** Domain 기반 트리 구조 히트맵 데이터 생성 */
export async function getDomainBasedHeatmapData(): Promise<DomainTreeData[]> {
  const docs = await loadAllDocsWithUrl();
  const domainMap = initializeDomainMap();

  populateDomainMap(domainMap, docs);

  return buildDomainTreeResult(domainMap);
}

/** Domain Map 초기화 */
function initializeDomainMap(): Map<string, Map<string, Map<string, TopicData>>> {
  const domainMap = new Map<string, Map<string, Map<string, TopicData>>>();
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

  return domainMap;
}

/** Domain Map에 문서 데이터 채우기 */
function populateDomainMap(
  domainMap: Map<string, Map<string, Map<string, TopicData>>>,
  docs: DocMetaWithUrl[],
) {
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
}

/** Domain Map을 결과 배열로 변환 */
function buildDomainTreeResult(
  domainMap: Map<string, Map<string, Map<string, TopicData>>>,
): DomainTreeData[] {
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
      categories.push({ category, topics, totalValue });
    }

    sortCategories(categories);

    const domainTotal = categories.reduce((sum, c) => sum + c.totalValue, 0);
    result.push({ domain, categories, totalValue: domainTotal });
  }

  sortDomains(result);

  return result;
}

/** 카테고리 정렬 */
function sortCategories(categories: CategoryTopicData[]) {
  categories.sort((a, b) => {
    const aIdx = (baseCategories as readonly string[]).indexOf(a.category);
    const bIdx = (baseCategories as readonly string[]).indexOf(b.category);

    if (aIdx === -1 && bIdx === -1) return a.category.localeCompare(b.category);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });
}

/** 도메인 정렬: frontend 먼저, 나머지는 알파벳순 */
function sortDomains(result: DomainTreeData[]) {
  result.sort((a, b) => {
    if (a.domain === 'frontend') return -1;
    if (b.domain === 'frontend') return 1;
    return a.domain.localeCompare(b.domain);
  });
}

