'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PortalOverlay from '@/components/common/PortalOverlay';
import { DocMetaWithUrl } from '@/define/metaDefines';
import { searchFeeds, highlightText } from '@/utils/searchUtils';
import { getSlugFromUrl } from '@/utils/feedUtils';
import { formatName } from '@/utils/formatUtils';
import { Search, X } from 'lucide-react';

type SearchBarProps = {
  docs: DocMetaWithUrl[];
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchBar({ docs, isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 디바운스 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 열릴 때 input 포커스 + 쿼리 초기화
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      // 약간의 딜레이 후 포커스 (Portal 마운트 대기)
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = searchFeeds(docs, debouncedQuery);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <PortalOverlay>
      <div
        className="fixed inset-0 flex items-start justify-center pt-[10vh] px-4"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-2xl bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] shadow-2xl overflow-hidden">
          {/* 검색 입력 */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--light-border)]">
            <Search size={18} className="text-[var(--text-muted)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="피드 검색... (topic, keyword, category)"
              className="flex-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none text-sm"
            />
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* 검색 결과 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {debouncedQuery && results.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                검색 결과가 없습니다
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((result) => {
                  const slug = getSlugFromUrl(result.rawUrl);
                  return (
                    <Link
                      key={result.rawUrl}
                      href={`/feeds/${slug}`}
                      onClick={onClose}
                      className="block px-5 py-3 hover:bg-[var(--hover-bg)] transition-colors duration-150"
                    >
                      <div
                        className="text-sm font-medium text-[var(--foreground)] mb-1"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(result.topic, debouncedQuery),
                        }}
                      />
                      {result.summary && (
                        <div
                          className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-1.5"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(result.summary, debouncedQuery),
                          }}
                        />
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--accent-light)] text-[var(--accent-text)]">
                          {formatName(result.domain)}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--hover-bg)] text-[var(--text-secondary)]">
                          {formatName(result.category)}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                          {result.date}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!debouncedQuery && (
              <div className="px-5 py-10 text-center text-xs text-[var(--text-muted)]">
                검색어를 입력하세요
              </div>
            )}
          </div>

          {/* 하단 힌트 */}
          <div className="px-5 py-2.5 border-t border-[var(--light-border)] flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--hover-bg)] text-[var(--text-secondary)] font-mono">ESC</kbd> 닫기
            </span>
            {results.length > 0 && (
              <span className="ml-auto">{results.length}개 결과</span>
            )}
          </div>
        </div>
      </div>
    </PortalOverlay>
  );
}
