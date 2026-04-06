export type EmbedRender = 'iframe' | 'card';

export type EmbedInfo = {
  type: string;
  embedUrl: string;
  originalUrl: string;
  render: EmbedRender;
  aspectRatio?: string; // e.g. "16/9"
  label?: string;       // 카드에 표시할 서비스명
};

type EmbedPattern = {
  type: string;
  render: EmbedRender;
  match: (url: string) => string | null; // returns embedUrl or null
  aspectRatio?: string;
  label?: string;
};

const EMBED_PATTERNS: EmbedPattern[] = [
  // Claude Artifact (iframe 차단 → 카드로 렌더링)
  {
    type: 'claude-artifact',
    render: 'card',
    label: 'Claude Artifact',
    match(url) {
      try {
        const u = new URL(url);
        if (u.hostname === 'claude.ai' && u.pathname.startsWith('/public/artifacts/')) return url;
        return null;
      } catch {
        return null;
      }
    },
  },
  // YouTube: watch, shorts, embed, youtu.be
  {
    type: 'youtube',
    render: 'iframe',
    aspectRatio: '16/9',
    match(url) {
      let videoId: string | null = null;
      try {
        const u = new URL(url);
        if (u.hostname.includes('youtube.com')) {
          if (u.pathname === '/watch') videoId = u.searchParams.get('v');
          else if (u.pathname.startsWith('/embed/')) videoId = u.pathname.split('/embed/')[1];
          else if (u.pathname.startsWith('/shorts/')) videoId = u.pathname.split('/shorts/')[1];
        } else if (u.hostname === 'youtu.be') {
          videoId = u.pathname.slice(1);
        }
      } catch {
        return null;
      }
      if (!videoId) return null;
      const clean = videoId.split(/[?&#]/)[0];
      return `https://www.youtube.com/embed/${clean}`;
    },
  },
  // Vimeo
  {
    type: 'vimeo',
    render: 'iframe',
    aspectRatio: '16/9',
    match(url) {
      try {
        const u = new URL(url);
        if (!u.hostname.includes('vimeo.com')) return null;
        const id = u.pathname.split('/').filter(Boolean).pop();
        if (!id || !/^\d+$/.test(id)) return null;
        return `https://player.vimeo.com/video/${id}`;
      } catch {
        return null;
      }
    },
  },
  // CodeSandbox
  {
    type: 'codesandbox',
    render: 'iframe',
    aspectRatio: '16/10',
    match(url) {
      try {
        const u = new URL(url);
        if (!u.hostname.includes('codesandbox.io')) return null;
        const parts = u.pathname.split('/').filter(Boolean);
        // /s/{id} or /p/sandbox/{id}
        if (parts[0] === 's' && parts[1]) return `https://codesandbox.io/embed/${parts[1]}`;
        if (parts[0] === 'p' && parts[2]) return `https://codesandbox.io/embed/${parts[2]}`;
        return null;
      } catch {
        return null;
      }
    },
  },
  // CodePen
  {
    type: 'codepen',
    render: 'iframe',
    aspectRatio: '16/10',
    match(url) {
      try {
        const u = new URL(url);
        if (!u.hostname.includes('codepen.io')) return null;
        // /user/pen/id → /user/embed/id
        const m = u.pathname.match(/^\/([^/]+)\/pen\/([^/]+)/);
        if (!m) return null;
        return `https://codepen.io/${m[1]}/embed/${m[2]}?default-tab=result`;
      } catch {
        return null;
      }
    },
  },
  // StackBlitz
  {
    type: 'stackblitz',
    render: 'iframe',
    aspectRatio: '16/10',
    match(url) {
      try {
        const u = new URL(url);
        if (!u.hostname.includes('stackblitz.com')) return null;
        const parts = u.pathname.split('/').filter(Boolean);
        // /edit/{id} → /embed/{id}
        if (parts[0] === 'edit' && parts[1]) return `https://stackblitz.com/embed/${parts[1]}`;
        return null;
      } catch {
        return null;
      }
    },
  },
];

/** URL이 임베드 가능한지 판별하고, 가능하면 embed 정보를 반환 */
export function getEmbedInfo(url: string): EmbedInfo | null {
  for (const pattern of EMBED_PATTERNS) {
    const embedUrl = pattern.match(url);
    if (embedUrl) {
      return {
        type: pattern.type,
        embedUrl,
        originalUrl: url,
        render: pattern.render,
        aspectRatio: pattern.aspectRatio,
        label: pattern.label,
      };
    }
  }
  return null;
}

/** bare URL인지 판별 (링크 텍스트 === href) */
export function isBareUrl(href: string, linkText: string): boolean {
  return linkText.trim() === href.trim();
}
