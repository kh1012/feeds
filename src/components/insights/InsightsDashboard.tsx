'use client';

import { useMemo, useState } from 'react';
import { DocMetaWithUrl } from '@/components/heatmap/matrixBuilder';

interface InsightsDashboardProps {
  data: DocMetaWithUrl[];
}

// 만족도 구간 정의
const SCORE_RANGES = [
  { min: 0, max: 20, label: '매우 낮음', color: '#ef4444' },
  { min: 21, max: 40, label: '낮음', color: '#f97316' },
  { min: 41, max: 60, label: '보통', color: '#eab308' },
  { min: 61, max: 80, label: '높음', color: '#22c55e' },
  { min: 81, max: 100, label: '매우 높음', color: '#10b981' },
];

// 카테고리명 포맷팅
function formatName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function InsightsDashboard({ data }: InsightsDashboardProps) {
  const [selectedRange, setSelectedRange] = useState<string | null>(null);

  // 만족도 데이터가 있는 항목만 필터링
  const dataWithSatisfaction = useMemo(() => {
    return data.filter((d) => d.satisfaction && d.satisfaction.score !== undefined);
  }, [data]);

  // 전체 통계
  const stats = useMemo(() => {
    if (dataWithSatisfaction.length === 0) return null;

    const scores = dataWithSatisfaction.map((d) => d.satisfaction!.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    return { avg, median, max, min, total: scores.length };
  }, [dataWithSatisfaction]);

  // 점수 구간별 분포
  const distribution = useMemo(() => {
    const dist = SCORE_RANGES.map((range) => ({
      ...range,
      count: dataWithSatisfaction.filter(
        (d) => d.satisfaction!.score >= range.min && d.satisfaction!.score <= range.max
      ).length,
      items: dataWithSatisfaction.filter(
        (d) => d.satisfaction!.score >= range.min && d.satisfaction!.score <= range.max
      ),
    }));
    return dist;
  }, [dataWithSatisfaction]);

  // 카테고리별 평균 만족도
  const categoryStats = useMemo(() => {
    const categoryMap = new Map<string, { total: number; count: number; items: DocMetaWithUrl[] }>();

    for (const doc of dataWithSatisfaction) {
      const existing = categoryMap.get(doc.category);
      if (existing) {
        existing.total += doc.satisfaction!.score;
        existing.count++;
        existing.items.push(doc);
      } else {
        categoryMap.set(doc.category, {
          total: doc.satisfaction!.score,
          count: 1,
          items: [doc],
        });
      }
    }

    const result = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      avg: data.total / data.count,
      count: data.count,
      items: data.items,
    }));

    return result.sort((a, b) => b.avg - a.avg);
  }, [dataWithSatisfaction]);

  // 도메인별 평균 만족도
  const domainStats = useMemo(() => {
    const domainMap = new Map<string, { total: number; count: number }>();

    for (const doc of dataWithSatisfaction) {
      const existing = domainMap.get(doc.domain);
      if (existing) {
        existing.total += doc.satisfaction!.score;
        existing.count++;
      } else {
        domainMap.set(doc.domain, {
          total: doc.satisfaction!.score,
          count: 1,
        });
      }
    }

    return Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        avg: data.total / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [dataWithSatisfaction]);

  // 높은 만족도 컨텐츠 (상위 20%)
  const highSatisfactionContent = useMemo(() => {
    const threshold = 80;
    return dataWithSatisfaction
      .filter((d) => d.satisfaction!.score >= threshold)
      .sort((a, b) => b.satisfaction!.score - a.satisfaction!.score);
  }, [dataWithSatisfaction]);

  // 낮은 만족도 컨텐츠 (하위 20%)
  const lowSatisfactionContent = useMemo(() => {
    const threshold = 40;
    return dataWithSatisfaction
      .filter((d) => d.satisfaction!.score <= threshold)
      .sort((a, b) => a.satisfaction!.score - b.satisfaction!.score);
  }, [dataWithSatisfaction]);

  // 키워드 분석 (높은 만족도 vs 낮은 만족도)
  const keywordAnalysis = useMemo(() => {
    const highKeywords = new Map<string, number>();
    const lowKeywords = new Map<string, number>();

    for (const doc of highSatisfactionContent) {
      for (const keyword of doc.keywords) {
        highKeywords.set(keyword, (highKeywords.get(keyword) || 0) + 1);
      }
    }

    for (const doc of lowSatisfactionContent) {
      for (const keyword of doc.keywords) {
        lowKeywords.set(keyword, (lowKeywords.get(keyword) || 0) + 1);
      }
    }

    return {
      high: Array.from(highKeywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      low: Array.from(lowKeywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
  }, [highSatisfactionContent, lowSatisfactionContent]);

  // 만족도 이유 분석
  const reasonsAnalysis = useMemo(() => {
    const highReasons = highSatisfactionContent
      .filter((d) => d.satisfaction?.reason)
      .map((d) => ({
        reason: d.satisfaction!.reason,
        score: d.satisfaction!.score,
        topic: d.topic,
        category: d.category,
      }));

    const lowReasons = lowSatisfactionContent
      .filter((d) => d.satisfaction?.reason)
      .map((d) => ({
        reason: d.satisfaction!.reason,
        score: d.satisfaction!.score,
        topic: d.topic,
        category: d.category,
      }));

    return { high: highReasons, low: lowReasons };
  }, [highSatisfactionContent, lowSatisfactionContent]);

  // 선택된 구간의 컨텐츠
  const selectedRangeContent = useMemo(() => {
    if (!selectedRange) return [];
    const range = distribution.find((d) => d.label === selectedRange);
    return range?.items || [];
  }, [selectedRange, distribution]);

  // 만족도 데이터가 없는 경우
  if (dataWithSatisfaction.length === 0) {
    return (
      <div>
        <div className="mx-auto px-4 lg:px-6 py-8" style={{ maxWidth: 1248 }}>
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-2">만족도 데이터가 없습니다</h2>
            <p className="text-sm text-neutral-500">
              마크다운 파일의 frontmatter에 satisfaction 데이터를 추가하면
              <br />
              학습 인사이트를 확인할 수 있습니다.
            </p>
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg text-left">
              <p className="text-xs text-neutral-500 mb-2">예시:</p>
              <pre className="text-xs text-neutral-700 font-mono">
{`satisfaction:
  score: 85
  reason: 실무에 바로 적용 가능한 내용이어서 만족`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxDistCount = Math.max(...distribution.map((d) => d.count));

  return (
    <div>
      <div className="mx-auto px-4 lg:px-6 py-6" style={{ maxWidth: 1248 }}>
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-900">📊 Learning Insights</h1>
          <p className="text-sm text-neutral-500 mt-1">
            만족도 기반 학습 패턴 분석 · {stats?.total}개 컨텐츠 분석 중
          </p>
        </div>

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">평균 만족도</p>
            <p className="text-2xl font-bold text-neutral-900">{stats?.avg.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">중앙값</p>
            <p className="text-2xl font-bold text-neutral-900">{stats?.median}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">최고 점수</p>
            <p className="text-2xl font-bold text-emerald-600">{stats?.max}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">최저 점수</p>
            <p className="text-2xl font-bold text-red-500">{stats?.min}</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 col-span-2 lg:col-span-1">
            <p className="text-xs text-neutral-500 mb-1">분석 대상</p>
            <p className="text-2xl font-bold text-neutral-900">{stats?.total}개</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 만족도 분포 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">📈 만족도 분포</h2>
            <div className="space-y-3">
              {distribution.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setSelectedRange(selectedRange === range.label ? null : range.label)}
                  className={`w-full text-left transition-all ${
                    selectedRange === range.label ? 'ring-2 ring-blue-500 rounded-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-xs text-neutral-600">{range.label}</div>
                    <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${maxDistCount > 0 ? (range.count / maxDistCount) * 100 : 0}%`,
                          backgroundColor: range.color,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-neutral-700">
                      {range.count}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 선택된 구간의 컨텐츠 */}
            {selectedRange && selectedRangeContent.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-2">
                  {selectedRange} 만족도 컨텐츠 ({selectedRangeContent.length}개)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedRangeContent.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700 truncate flex-1">{item.topic}</span>
                      <span className="text-neutral-500 ml-2">{item.satisfaction?.score}점</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 카테고리별 만족도 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">🏷️ 카테고리별 평균 만족도</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {categoryStats.map((cat, idx) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="w-6 text-xs text-neutral-400">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-neutral-700">{formatName(cat.category)}</span>
                      <span className="text-sm font-medium text-neutral-900">{cat.avg.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.avg}%`,
                          backgroundColor: cat.avg >= 80 ? '#10b981' : cat.avg >= 60 ? '#22c55e' : cat.avg >= 40 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-xs text-neutral-400 text-right">{cat.count}개</div>
                </div>
              ))}
            </div>
          </div>

          {/* 높은 만족도 컨텐츠 특징 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-1">🏆 높은 만족도 컨텐츠</h2>
            <p className="text-xs text-neutral-500 mb-4">만족도 80점 이상 · {highSatisfactionContent.length}개</p>

            {highSatisfactionContent.length > 0 ? (
              <>
                {/* 주요 키워드 */}
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">자주 등장하는 키워드</p>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordAnalysis.high.map(([keyword, count]) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-full"
                      >
                        {keyword} ({count})
                      </span>
                    ))}
                  </div>
                </div>

                {/* 만족 이유 */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">만족 이유</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {reasonsAnalysis.high.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="p-2 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-emerald-600">{item.score}점</span>
                          <span className="text-xs text-neutral-500">{item.topic}</span>
                        </div>
                        <p className="text-xs text-neutral-700">&ldquo;{item.reason}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-500">높은 만족도 컨텐츠가 없습니다.</p>
            )}
          </div>

          {/* 낮은 만족도 컨텐츠 특징 */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-800 mb-1">📌 낮은 만족도 컨텐츠</h2>
            <p className="text-xs text-neutral-500 mb-4">만족도 40점 이하 · {lowSatisfactionContent.length}개</p>

            {lowSatisfactionContent.length > 0 ? (
              <>
                {/* 주요 키워드 */}
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">자주 등장하는 키워드</p>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordAnalysis.low.map(([keyword, count]) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-full"
                      >
                        {keyword} ({count})
                      </span>
                    ))}
                  </div>
                </div>

                {/* 불만족 이유 */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">불만족 이유</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {reasonsAnalysis.low.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="p-2 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-red-600">{item.score}점</span>
                          <span className="text-xs text-neutral-500">{item.topic}</span>
                        </div>
                        <p className="text-xs text-neutral-700">&ldquo;{item.reason}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-500">낮은 만족도 컨텐츠가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 도메인별 만족도 비교 */}
        <div className="mt-6 bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">🌐 도메인별 만족도 비교</h2>
          <div className="flex flex-wrap gap-4">
            {domainStats.map((domain) => (
              <div
                key={domain.domain}
                className="flex-1 min-w-[140px] p-4 bg-neutral-50 rounded-lg text-center"
              >
                <p className="text-xs text-neutral-500 mb-1">{formatName(domain.domain)}</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: domain.avg >= 80 ? '#10b981' : domain.avg >= 60 ? '#22c55e' : domain.avg >= 40 ? '#eab308' : '#ef4444',
                  }}
                >
                  {domain.avg.toFixed(1)}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{domain.count}개</p>
              </div>
            ))}
          </div>
        </div>

        {/* 인사이트 요약 */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-5">
          <h2 className="text-sm font-semibold text-blue-900 mb-3">💡 핵심 인사이트</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            {categoryStats.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  가장 높은 만족도를 보인 카테고리는{' '}
                  <strong>{formatName(categoryStats[0].category)}</strong>
                  (평균 {categoryStats[0].avg.toFixed(1)}점)입니다.
                </span>
              </li>
            )}
            {categoryStats.length > 1 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  개선이 필요한 카테고리는{' '}
                  <strong>{formatName(categoryStats[categoryStats.length - 1].category)}</strong>
                  (평균 {categoryStats[categoryStats.length - 1].avg.toFixed(1)}점)입니다.
                </span>
              </li>
            )}
            {highSatisfactionContent.length > 0 && keywordAnalysis.high.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  높은 만족도 컨텐츠에서 자주 등장하는 키워드:{' '}
                  <strong>{keywordAnalysis.high.slice(0, 3).map(([k]) => k).join(', ')}</strong>
                </span>
              </li>
            )}
            {stats && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  전체 {stats.total}개 컨텐츠 중{' '}
                  <strong>{distribution.find((d) => d.label === '높음' || d.label === '매우 높음')?.count || 0}개</strong>
                  가 높은 만족도(60점 이상)를 기록했습니다.
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

