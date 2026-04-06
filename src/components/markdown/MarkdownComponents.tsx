'use client';

import { type Components } from 'react-markdown';
import { type EmbedInfo, getEmbedInfo, isBareUrl } from '@/utils/embedUtils';

function EmbedIframe({ embedUrl, aspectRatio = '16/9' }: { embedUrl: string; aspectRatio?: string }) {
  return (
    <div className="embed-container" style={{ aspectRatio }}>
      <iframe
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="Embedded content"
      />
    </div>
  );
}

function EmbedCard({ embed }: { embed: EmbedInfo }) {
  const hostname = (() => {
    try { return new URL(embed.originalUrl).hostname; }
    catch { return ''; }
  })();

  return (
    <a
      href={embed.originalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="embed-card"
    >
      <div className="embed-card-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
      <div className="embed-card-body">
        <span className="embed-card-label">{embed.label ?? embed.type}</span>
        <span className="embed-card-url">{hostname}{new URL(embed.originalUrl).pathname}</span>
      </div>
      <span className="embed-card-action">열기 &rarr;</span>
    </a>
  );
}

function renderEmbed(embed: EmbedInfo) {
  if (embed.render === 'iframe') {
    return <EmbedIframe embedUrl={embed.embedUrl} aspectRatio={embed.aspectRatio} />;
  }
  return <EmbedCard embed={embed} />;
}

export const markdownComponents: Components = {
  a({ href, children, ...props }) {
    if (!href) return <a {...props}>{children}</a>;

    const linkText = typeof children === 'string' ? children : '';

    // bare URL (텍스트 === href)이고 embeddable이면 embed 렌더링
    if (isBareUrl(href, linkText)) {
      const embed = getEmbedInfo(href);
      if (embed) return renderEmbed(embed);
    }

    // 일반 외부 링크: 새 탭으로 열기
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    return (
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
};
