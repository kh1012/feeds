'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { DocMetaWithUrl } from '@/define/metaDefines';
import { getSlugFromUrl } from '@/utils/feedUtils';
import {
  formatDateWithDay,
  sortByDateDesc,
  getYearMonthKey,
  formatYearMonthLabel,
} from '@/utils/dateUtils';

type FeedNavigationProps = {
  docs: DocMetaWithUrl[];
  currentSlug: string;
};

type MonthGroup = {
  key: string;
  label: string;
  docs: DocMetaWithUrl[];
};

/** 문서를 월별로 그룹화 */
function groupDocsByMonth(docs: DocMetaWithUrl[]): MonthGroup[] {
  const sortedDocs = sortByDateDesc(docs);
  const monthMap = new Map<string, DocMetaWithUrl[]>();

  for (const doc of sortedDocs) {
    const key = getYearMonthKey(doc.date);
    if (!monthMap.has(key)) {
      monthMap.set(key, []);
    }
    monthMap.get(key)!.push(doc);
  }

  return Array.from(monthMap.entries()).map(([key, monthDocs]) => ({
    key,
    label: formatYearMonthLabel(key),
    docs: monthDocs,
  }));
}

/** 현재 문서의 월 라벨 반환 */
function getCurrentMonthLabel(docs: DocMetaWithUrl[], currentSlug: string): string | null {
  const currentDoc = docs.find((d) => getSlugFromUrl(d.rawUrl) === currentSlug);
  if (!currentDoc) return null;

  const key = getYearMonthKey(currentDoc.date);
  return formatYearMonthLabel(key);
}

export function FeedNavigation({ docs, currentSlug }: FeedNavigationProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const groupedData = useMemo(() => groupDocsByMonth(docs), [docs]);

  // 현재 문서의 월 자동 확장
  useEffect(() => {
    const label = getCurrentMonthLabel(docs, currentSlug);
    if (label) {
      setExpandedMonths((prev) => new Set(prev).add(label));
    }
  }, [docs, currentSlug]);

  const toggleMonth = (label: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <nav className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]/80 p-5 max-h-[31.25rem] overflow-y-auto custom-scrollbar">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">목차</h2>

        <div className="space-y-1">
          {groupedData.map((monthGroup) => {
            const isExpanded = expandedMonths.has(monthGroup.label);

            return (
              <div key={monthGroup.key}>
                {/* 월 헤더 */}
                <button
                  onClick={() => toggleMonth(monthGroup.label)}
                  className="w-full flex items-center justify-between py-2 px-2.5 hover:bg-[var(--hover-bg)]/60 rounded-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">{monthGroup.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">{monthGroup.docs.length}</span>
                    <svg
                      className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* 문서 목록 */}
                {isExpanded && (
                  <div className="mt-1 space-y-0.5">
                    {monthGroup.docs.map((doc) => {
                      const slug = getSlugFromUrl(doc.rawUrl);
                      const isActive = slug === currentSlug;

                      return (
                        <Link
                          key={doc.rawUrl}
                          href={`/feeds/${slug}`}
                          className={`block px-2.5 py-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-[var(--accent-light)] text-[var(--accent-text)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]/60'
                          }`}
                          title={doc.topic}
                        >
                          <div className={`text-xs truncate ${isActive ? 'font-medium' : ''}`}>
                            {doc.topic}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {formatDateWithDay(doc.date)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
