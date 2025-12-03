import { DocMeta } from '@/define/metaDefines';

/** URL이 포함된 문서 메타 타입 */
export type DocMetaWithUrl = DocMeta & {
  rawUrl: string;
  url: string;
  title: string;
  date: string;
  summary: string;
};

/** 토픽 관련 문서 정보 */
export type TopicDocInfo = {
  rawUrl: string;
  url: string;
  title: string;
  date: string;
};

/** 카테고리별 토픽-값 데이터 구조 */
export type CategoryTopicData = {
  category: string;
  topics: Array<{
    name: string;
    value: number;
    docs: TopicDocInfo[];
  }>;
  totalValue: number;
};

/** Domain 기반 트리 구조 데이터 */
export type DomainTreeData = {
  domain: string;
  categories: CategoryTopicData[];
  totalValue: number;
};

/** 토픽별 데이터 (값 + 문서 목록) */
export type TopicData = {
  value: number;
  docs: TopicDocInfo[];
};

/** 히트맵 매트릭스 결과 */
export type HeatmapMatrixResult = {
  categories: string[];
  topics: string[];
  matrix: number[][];
};

