'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { DocMetaWithUrl } from '@/define/metaDefines';
import { FeedNavigation } from './FeedNavigation';
import { getSlugFromUrl } from '@/utils/feedUtils';
import { fetchTilContentMarkdown } from '@/utils/tilUtils';
import { parseMarkdownWithMeta } from '@/utils/mdParseUtils';
import { formatDateWithDay, sortByDateDesc } from '@/utils/dateUtils';
import { formatName } from '@/utils/formatUtils';
import { FEEDS_URLS } from '@/define/urlDefines';
import { HEIGHTS } from '@/define/heightDefines';
import Tag from '@/components/common/Tag';
import { Loader } from 'lucide-react';
import RelatedFeeds from '@/components/feeds/RelatedFeeds';

type FeedDetailContentProps = {
  doc: DocMetaWithUrl;
  docs: DocMetaWithUrl[];
  slug: string;
};

/** 이전/다음 문서 정보 계산 */
function getAdjacentDocs(docs: DocMetaWithUrl[], currentSlug: string) {
  const sortedDocs = sortByDateDesc(docs);
  const currentIndex = sortedDocs.findIndex((d) => getSlugFromUrl(d.rawUrl) === currentSlug);

  return {
    sortedDocs,
    prevDoc: currentIndex > 0 ? sortedDocs[currentIndex - 1] : null,
    nextDoc: currentIndex < sortedDocs.length - 1 ? sortedDocs[currentIndex + 1] : null,
  };
}

/** 스켈레톤 컴포넌트 */
function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 제목 스켈레톤 */}
      <div className="h-6 bg-[var(--light-border)] rounded-lg w-3/4" />

      {/* 문단 스켈레톤 */}
      <div className="space-y-3">
        <div className="h-4 bg-[var(--light-border)] rounded w-full" />
        <div className="h-4 bg-[var(--light-border)] rounded w-full" />
        <div className="h-4 bg-[var(--light-border)] rounded w-5/6" />
      </div>

      {/* 코드 블록 스켈레톤 */}
      <div className="h-32 bg-[var(--content-bg)] rounded-xl border border-[var(--card-border)]" />

      {/* 문단 스켈레톤 */}
      <div className="space-y-3">
        <div className="h-4 bg-[var(--light-border)] rounded w-full" />
        <div className="h-4 bg-[var(--light-border)] rounded w-4/5" />
        <div className="h-4 bg-[var(--light-border)] rounded w-full" />
        <div className="h-4 bg-[var(--light-border)] rounded w-2/3" />
      </div>

      {/* 소제목 스켈레톤 */}
      <div className="h-5 bg-[var(--light-border)] rounded-lg w-1/2" />

      {/* 리스트 스켈레톤 */}
      <div className="space-y-2 pl-4">
        <div className="h-4 bg-[var(--light-border)] rounded w-5/6" />
        <div className="h-4 bg-[var(--light-border)] rounded w-3/4" />
        <div className="h-4 bg-[var(--light-border)] rounded w-4/5" />
      </div>
    </div>
  );
}

export function FeedDetailContent({ doc, docs, slug }: FeedDetailContentProps) {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setNavigatingTo(null);

    const loadContent = async () => {
      try {
        const md = await fetchTilContentMarkdown(doc.rawUrl);
        const { writing } = parseMarkdownWithMeta(md);
        setMarkdownContent(writing);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [doc.rawUrl]);

  const { sortedDocs, prevDoc, nextDoc } = useMemo(
    () => getAdjacentDocs(docs, slug),
    [docs, slug]
  );

  const handleNavigate = (direction: 'prev' | 'next') => {
    setNavigatingTo(direction);
  };

  return (
    <div style={{ paddingTop: HEIGHTS.GNB_HEIGHT }}>
      <div className="bg-[var(--content-bg)] min-h-screen">
        <div className="mx-auto py-4 lg:px-8 lg:py-6" style={{ maxWidth: 1248 }}>
          <div className="flex gap-8">
            {/* 좌측 네비게이션 (데스크탑만) */}
            <FeedNavigation docs={sortedDocs} currentSlug={slug} />

            {/* 본문 영역 */}
            <main className="flex-1 min-w-0">
              {/* 뒤로가기 */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] active:text-[var(--accent-text)] transition-colors duration-200 mb-5 px-4 lg:px-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                목록으로
              </Link>

              {/* 본문 카드 */}
              <article className="bg-[var(--card-bg)] lg:rounded-xl lg:border lg:border-[var(--card-border)]/80 p-5 lg:p-10">
                {/* 헤더 */}
                <header className="mb-8">
                  {/* 프로필 */}
                  <div className="flex items-center gap-3 mb-5">
                    <Image
                      src={`${FEEDS_URLS.GITHUB_TIL_ASSETS_RAW}/profile-img.jpg`}
                      alt="프로필"
                      width={48}
                      height={48}
                      className="size-11 rounded-full border border-[var(--card-border)] object-cover"
                    />
                    <div>
                      <div className="font-medium text-[var(--foreground)]">kh1012</div>
                      <div className="text-sm text-[var(--text-muted)]">{formatDateWithDay(doc.date)}</div>
                    </div>
                  </div>

                  {/* 제목 */}
                  <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] mb-4 tracking-tight leading-tight">
                    {doc.topic}
                  </h1>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--accent-light)] text-[var(--accent-text)]">
                      {formatName(doc.domain)}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--hover-bg)] text-[var(--text-secondary)]">
                      {formatName(doc.category)}
                    </span>
                  </div>

                  {/* 키워드 */}
                  {doc.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {doc.keywords.map((keyword) => (
                        <Tag key={keyword}>{keyword}</Tag>
                      ))}
                    </div>
                  )}
                </header>

                {/* 본문 */}
                {isLoading ? (
                  <ContentSkeleton />
                ) : (
                  <div className="prose-github max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                )}

                {/* GitHub 링크 */}
                <div className="mt-10 pt-5 border-t border-[var(--light-border)]">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub에서 보기
                  </a>
                </div>
              </article>

              {/* 관련 글 추천 */}
              <RelatedFeeds currentDoc={doc} allDocs={docs} />

              {/* 이전/다음 네비게이션 */}
              <div className="mt-5 grid grid-cols-2 gap-4 px-4 lg:px-0 pb-6 lg:pb-0">
                {prevDoc ? (
                  <Link
                    href={`/feeds/${getSlugFromUrl(prevDoc.rawUrl)}`}
                    onClick={() => handleNavigate('prev')}
                    className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]/80 p-5 hover:border-[var(--accent)]/40 hover:shadow-[0_2px_12px_rgba(171,155,133,0.08)] active:scale-[0.97] active:shadow-none transition-all duration-200"
                  >
                    {navigatingTo === 'prev' ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader size={14} className="text-[var(--accent)] animate-spin" />
                        <span className="text-xs text-[var(--text-muted)]">로딩 중...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-[var(--text-muted)] mb-1.5">이전 글 (최신)</div>
                        <div className="text-sm font-medium text-[var(--foreground)] truncate">
                          {prevDoc.topic}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1.5">
                          {formatDateWithDay(prevDoc.date)}
                        </div>
                      </>
                    )}
                  </Link>
                ) : (
                  <div />
                )}
                {nextDoc ? (
                  <Link
                    href={`/feeds/${getSlugFromUrl(nextDoc.rawUrl)}`}
                    onClick={() => handleNavigate('next')}
                    className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]/80 p-5 hover:border-[var(--accent)]/40 hover:shadow-[0_2px_12px_rgba(171,155,133,0.08)] active:scale-[0.97] active:shadow-none transition-all duration-200 text-right"
                  >
                    {navigatingTo === 'next' ? (
                      <div className="flex items-center justify-end gap-2 py-2">
                        <Loader size={14} className="text-[var(--accent)] animate-spin" />
                        <span className="text-xs text-[var(--text-muted)]">로딩 중...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-[var(--text-muted)] mb-1.5">다음 글 (이전)</div>
                        <div className="text-sm font-medium text-[var(--foreground)] truncate">
                          {nextDoc.topic}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1.5">
                          {formatDateWithDay(nextDoc.date)}
                        </div>
                      </>
                    )}
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
