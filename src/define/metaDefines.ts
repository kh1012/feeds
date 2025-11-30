export type DocMeta = {
  type: 'skill' | 'troubleshooting';
  domain: string;
  category: string;
  topic: string;
  updatedAt: string;
  keywords: string[];
  relatedCategories: string[];
};
