export type SatisfactionData = {
  score: number; // 0-100점
  reason: string; // 만족도 점수를 준 이유
};

export type DocMeta = {
  type: string;
  domain: string;
  category: string;
  topic: string;
  updatedAt: string;
  keywords: string[];
  relatedCategories: string[];
  // 만족도 데이터
  satisfaction?: SatisfactionData;
};
