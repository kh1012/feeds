import { getFirstTwoChars } from './heatmapConstants';

// 카테고리 아이콘 설정
const CATEGORY_ICON_CONFIG: Record<string, { text: string; bg: string; color: string }> = {
  javascript: { text: 'JS', bg: '#f7df1e', color: '#000' },
  typescript: { text: 'TS', bg: '#3178c6', color: '#fff' },
  react: { text: 'Re', bg: '#61dafb', color: '#000' },
  nextjs: { text: 'Nx', bg: '#000', color: '#fff' },
  'state-management': { text: 'SM', bg: '#764abc', color: '#fff' },
  'server-state': { text: 'RQ', bg: '#ff4154', color: '#fff' },
  performance: { text: 'Pf', bg: '#ff6b00', color: '#fff' },
  'ui-ux': { text: 'UX', bg: '#ff69b4', color: '#fff' },
  css: { text: 'CS', bg: '#264de4', color: '#fff' },
  testing: { text: 'Te', bg: '#15c213', color: '#fff' },
  'build-infra': { text: 'CI', bg: '#2088ff', color: '#fff' },
  troubleshoot: { text: 'Tr', bg: '#e53935', color: '#fff' },
};

// 도메인 아이콘 설정
const DOMAIN_ICON_CONFIG: Record<string, { text: string; bg: string; color: string }> = {
  frontend: { text: 'FE', bg: '#3b82f6', color: '#fff' },
  backend: { text: 'BE', bg: '#10b981', color: '#fff' },
  devops: { text: 'DO', bg: '#f59e0b', color: '#fff' },
  database: { text: 'DB', bg: '#8b5cf6', color: '#fff' },
  mobile: { text: 'Mo', bg: '#ec4899', color: '#fff' },
};

export function CategoryIcon({ category }: { category: string }) {
  const config = CATEGORY_ICON_CONFIG[category] || {
    text: getFirstTwoChars(category),
    bg: '#6b7280',
    color: '#fff',
  };

  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold shrink-0"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.text}
    </span>
  );
}

export function DomainIcon({ domain }: { domain: string }) {
  const config = DOMAIN_ICON_CONFIG[domain] || {
    text: getFirstTwoChars(domain),
    bg: '#6b7280',
    color: '#fff',
  };

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.text}
    </span>
  );
}

