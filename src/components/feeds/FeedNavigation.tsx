'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { DocMetaWithUrl } from '@/components/heatmap/heatmapTypes';
import { getSlugFromUrl } from '@/utils/feedUtils';
import { formatDateWithDay } from '@/utils/dateUtils';

type FeedNavigationProps = {
  docs: DocMetaWithUrl[];
  currentSlug: string;
};

type MonthGroup = {
  label: string;
  docs: DocMetaWithUrl[];
};

export function FeedNavigation({ docs, currentSlug }: FeedNavigationProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // 날짜순(최근순)으로 정렬 후 월별 그룹화
  const groupedData = useMemo(() => {
    // 날짜 내림차순 정렬
    const sortedDocs = [...docs].sort((a, b) => b.date.localeCompare(a.date));

    // 월별 그룹화
    const monthMap = new Map<string, DocMetaWithUrl[]>();

    for (const doc of sortedDocs) {
      const date = new Date(doc.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      const label = `${year}년 ${month}월`;

      if (!monthMap.has(key)) {
        monthMap.set(key, []);
      }
      monthMap.get(key)!.push(doc);
    }

    const result: MonthGroup[] = [];
    for (const [key, monthDocs] of monthMap) {
      const date = new Date(key + '-01');
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      result.push({
        label: `${year}년 ${month}월`,
        docs: monthDocs,
      });
    }

    return result;
  }, [docs]);

  // 현재 문서의 월 자동 확장
  useEffect(() => {
    const currentDoc = docs.find((d) => getSlugFromUrl(d.rawUrl) === currentSlug);
    if (currentDoc) {
      const date = new Date(currentDoc.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const label = `${year}년 ${month}월`;
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
      <div className="sticky top-16 bg-white rounded-lg border border-neutral-200 p-4 max-h-[calc(100vh-80px)] overflow-y-auto">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">목차</h2>

        <div className="space-y-1">
          {groupedData.map((monthGroup) => {
            const isExpanded = expandedMonths.has(monthGroup.label);

            return (
              <div key={monthGroup.label}>
                {/* 월 헤더 */}
                <button
                  onClick={() => toggleMonth(monthGroup.label)}
                  className="w-full flex items-center justify-between py-1.5 px-2 hover:bg-neutral-50 rounded-md transition-colors"
                >
                  <span className="text-sm font-medium text-neutral-700">
                    {monthGroup.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">{monthGroup.docs.length}</span>
                    <svg
                      className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                          className={`block px-2 py-1.5 rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-neutral-600 hover:bg-neutral-50'
                          }`}
                          title={doc.topic}
                        >
                          <div className={`text-xs truncate ${isActive ? 'font-medium' : ''}`}>
                            {doc.topic}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
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
