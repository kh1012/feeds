import { DocMetaWithUrl } from '@/define/metaDefines';

export type SearchResult = DocMetaWithUrl & { score: number };

/**
 * 검색어의 특수문자를 이스케이프하여 안전한 RegExp 패턴으로 변환
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 피드 검색 함수
 * 스코어링: topic(x3) > keywords(x2) > summary(x1.5) > category(x1)
 */
export function searchFeeds(docs: DocMetaWithUrl[], query: string): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results: SearchResult[] = [];

  for (const doc of docs) {
    let score = 0;

    // topic (x3)
    if (doc.topic.toLowerCase().includes(trimmed)) {
      score += 3;
    }

    // keywords (x2)
    for (const kw of doc.keywords) {
      if (kw.toLowerCase().includes(trimmed)) {
        score += 2;
      }
    }

    // summary (x1.5)
    if (doc.summary && doc.summary.toLowerCase().includes(trimmed)) {
      score += 1.5;
    }

    // category (x1)
    if (doc.category.toLowerCase().includes(trimmed)) {
      score += 1;
    }

    // domain (x1)
    if (doc.domain.toLowerCase().includes(trimmed)) {
      score += 1;
    }

    if (score > 0) {
      results.push({ ...doc, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * 검색어를 <mark> 태그로 감싸서 하이라이팅
 * XSS 방지를 위해 특수문자를 이스케이프
 */
export function highlightText(text: string, query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const escaped = escapeRegExp(trimmed);
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 관련글 추천 함수
 * 현재 글의 keywords + relatedCategories + category 기준으로 유사도 계산
 */
export function findRelatedDocs(
  currentDoc: DocMetaWithUrl,
  allDocs: DocMetaWithUrl[],
  maxCount: number = 3
): DocMetaWithUrl[] {
  const currentKeywords = new Set(currentDoc.keywords.map((k) => k.toLowerCase()));
  const currentRelatedCategories = new Set(currentDoc.relatedCategories.map((c) => c.toLowerCase()));
  const currentCategory = currentDoc.category.toLowerCase();

  const scored: { doc: DocMetaWithUrl; score: number }[] = [];

  for (const doc of allDocs) {
    // 자기 자신 제외
    if (doc.rawUrl === currentDoc.rawUrl) continue;

    let score = 0;

    // 공통 keywords 수
    for (const kw of doc.keywords) {
      if (currentKeywords.has(kw.toLowerCase())) {
        score += 1;
      }
    }

    // 공통 relatedCategories 수
    for (const rc of doc.relatedCategories) {
      if (currentRelatedCategories.has(rc.toLowerCase())) {
        score += 1;
      }
    }

    // 같은 category
    if (doc.category.toLowerCase() === currentCategory) {
      score += 1;
    }

    if (score > 0) {
      scored.push({ doc, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map((s) => s.doc);
}
