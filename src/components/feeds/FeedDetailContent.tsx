'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { DocMetaWithUrl } from '@/components/heatmap/heatmapTypes';
import { FeedNavigation } from './FeedNavigation';
import { getSlugFromUrl } from '@/utils/feedUtils';
import { fetchTilContentMarkdown } from '@/utils/tilUtils';
import { parseMarkdownWithMeta } from '@/utils/mdParseUtils';
import { formatDateWithDay } from '@/utils/dateUtils';
import { formatName } from '@/utils/formatUtils';
import { FEEDS_URLS } from '@/define/urlDefines';
import { HEIGHTS } from '@/define/heightDefines';
import Tag from '@/components/common/Tag';
import { Spinner } from '@/components/common/Spinner';

type FeedDetailContentProps = {
  doc: DocMetaWithUrl;
  docs: DocMetaWithUrl[];
  slug: string;
};

export function FeedDetailContent({ doc, docs, slug }: FeedDetailContentProps) {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  // 날짜순(최근순) 정렬된 문서 목록
  const sortedDocs = useMemo(() => {
    return [...docs].sort((a, b) => b.date.localeCompare(a.date));
  }, [docs]);

  // 이전/다음 문서 찾기 (날짜순 기준)
  const currentIndex = sortedDocs.findIndex((d) => getSlugFromUrl(d.rawUrl) === slug);
  const prevDoc = currentIndex > 0 ? sortedDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < sortedDocs.length - 1 ? sortedDocs[currentIndex + 1] : null;

  return (
    <div style={{ paddingTop: HEIGHTS.GNB_HEIGHT }}>
      <div className="bg-neutral-50 min-h-screen">
        <div className="mx-auto lg:px-6 lg:py-4" style={{ maxWidth: 1248 }}>
          <div className="flex gap-6">
            {/* 좌측 네비게이션 (데스크탑만) */}
            <FeedNavigation docs={sortedDocs} currentSlug={slug} />

            {/* 본문 영역 */}
            <main className="flex-1 min-w-0">
              {/* 뒤로가기 */}
              <div className="mb-4 px-4 lg:px-0 pt-4 lg:pt-0">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
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
              </div>

              {/* 본문 카드 */}
              <article className="bg-white lg:rounded-lg lg:border lg:border-neutral-200 p-4 lg:p-6">
                {/* 헤더 */}
                <header className="mb-6">
                  {/* 프로필 */}
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={`${FEEDS_URLS.GITHUB_TIL_ASSETS_RAW}/profile-img.jpg`}
                      alt="프로필"
                      width={48}
                      height={48}
                      className="size-12 rounded-full border border-neutral-200 object-cover"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">kh1012</div>
                      <div className="text-sm text-neutral-500">{formatDateWithDay(doc.date)}</div>
                    </div>
                  </div>

                  {/* 제목 */}
                  <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 mb-3">{doc.topic}</h1>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                      {formatName(doc.domain)}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600">
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
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : (
                  <div className="prose-github max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                )}

                {/* GitHub 링크 */}
                <div className="mt-8 pt-4 border-t border-neutral-100">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-blue-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub에서 보기
                  </a>
                </div>
              </article>

              {/* 이전/다음 네비게이션 */}
              <div className="mt-4 grid grid-cols-2 gap-4 px-4 lg:px-0 pb-4 lg:pb-0">
                {prevDoc ? (
                  <Link
                    href={`/feeds/${getSlugFromUrl(prevDoc.rawUrl)}`}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="text-xs text-neutral-400 mb-1">이전 글 (최신)</div>
                    <div className="text-sm font-medium text-neutral-700 truncate">
                      {prevDoc.topic}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {formatDateWithDay(prevDoc.date)}
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextDoc ? (
                  <Link
                    href={`/feeds/${getSlugFromUrl(nextDoc.rawUrl)}`}
                    className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-blue-300 transition-colors text-right"
                  >
                    <div className="text-xs text-neutral-400 mb-1">다음 글 (이전)</div>
                    <div className="text-sm font-medium text-neutral-700 truncate">
                      {nextDoc.topic}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {formatDateWithDay(nextDoc.date)}
                    </div>
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
