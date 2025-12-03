'use client';

import { useMemo, useState } from 'react';
import { DocMetaWithUrl } from '@/components/heatmap/matrixBuilder';
import {
  calculateReviewItems,
  REVIEW_LEVEL_CONFIG,
  type ReviewLevel,
  type ReviewItem,
} from '@/utils/reviewUtils';
import { formatName } from '@/utils/formatUtils';

interface ReviewListProps {
  data: DocMetaWithUrl[];
}

/** 재활성 레벨별 통계 카드 */
function ReviewStatCard({
  level,
  count,
  isSelected,
  onClick,
}: {
  level: ReviewLevel;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = REVIEW_LEVEL_CONFIG[level];

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 min-w-[100px] p-3 rounded-lg border transition-all
        ${isSelected ? 'ring-2 ring-offset-1' : 'hover:bg-neutral-50'}
      `}
      style={{
        borderColor: isSelected ? config.color : '#e5e7eb',
        backgroundColor: isSelected ? config.bgColor : 'white',
        ringColor: config.color,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs font-medium text-neutral-700">{config.shortLabel}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: config.color }}>
        {count}
      </p>
      <p className="text-[10px] text-neutral-500 mt-0.5">{config.label}</p>
    </button>
  );
}

/** 재활성 항목 카드 */
function ReviewItemCard({ item }: { item: ReviewItem }) {
  const config = REVIEW_LEVEL_CONFIG[item.level];
  const daysSinceLastReview = Math.floor(
    (Date.now() - new Date(item.lastDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className="p-3 rounded-lg border bg-white"
      style={{ borderLeftWidth: 3, borderLeftColor: config.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-1.5 py-0.5 text-[10px] font-medium rounded"
              style={{ backgroundColor: config.bgColor, color: config.color }}
            >
              {config.shortLabel}
            </span>
            <span className="text-xs text-neutral-500">
              {formatName(item.domain)} / {formatName(item.category)}
            </span>
          </div>
          <h4 className="text-sm font-medium text-neutral-900 truncate">
            {formatName(item.topic)}
          </h4>
          <p className="text-xs text-neutral-500 mt-1">
            마지막 학습: {item.lastDate} ({daysSinceLastReview}일 전)
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-neutral-700">{item.count}회</p>
          <p className="text-[10px] text-neutral-400">학습</p>
        </div>
      </div>
      {item.urls.length > 0 && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <a
            href={item.urls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            GitHub에서 보기
          </a>
        </div>
      )}
    </div>
  );
}

export default function ReviewList({ data }: ReviewListProps) {
  const [selectedLevel, setSelectedLevel] = useState<ReviewLevel | null>(null);

  // 재활성 항목 계산
  const reviewItems = useMemo(() => {
    return calculateReviewItems(data);
  }, [data]);

  // 레벨별 카운트
  const levelCounts = useMemo(() => {
    const counts: Record<ReviewLevel, number> = {
      NONE: 0,
      LEVEL_1: 0,
      LEVEL_2: 0,
      LEVEL_3: 0,
    };

    for (const item of reviewItems) {
      counts[item.level]++;
    }

    return counts;
  }, [reviewItems]);

  // 필터링된 항목
  const filteredItems = useMemo(() => {
    if (!selectedLevel) return reviewItems;
    return reviewItems.filter((item) => item.level === selectedLevel);
  }, [reviewItems, selectedLevel]);

  // 재활성이 필요한 항목이 없는 경우
  if (reviewItems.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-1">
            모든 학습이 최신 상태입니다
          </h3>
          <p className="text-sm text-neutral-500">
            재활성이 필요한 토픽이 없습니다. 계속 학습을 이어가세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">📚 재활성(Re-active) 필요 토픽</h2>
        <span className="text-xs text-neutral-500">
          총 {reviewItems.length}개 토픽
        </span>
      </div>

      {/* 레벨별 통계 */}
      <div className="flex gap-2 mb-4">
        <ReviewStatCard
          level="LEVEL_1"
          count={levelCounts.LEVEL_1}
          isSelected={selectedLevel === 'LEVEL_1'}
          onClick={() => setSelectedLevel(selectedLevel === 'LEVEL_1' ? null : 'LEVEL_1')}
        />
        <ReviewStatCard
          level="LEVEL_2"
          count={levelCounts.LEVEL_2}
          isSelected={selectedLevel === 'LEVEL_2'}
          onClick={() => setSelectedLevel(selectedLevel === 'LEVEL_2' ? null : 'LEVEL_2')}
        />
        <ReviewStatCard
          level="LEVEL_3"
          count={levelCounts.LEVEL_3}
          isSelected={selectedLevel === 'LEVEL_3'}
          onClick={() => setSelectedLevel(selectedLevel === 'LEVEL_3' ? null : 'LEVEL_3')}
        />
      </div>

      {/* 필터 상태 표시 */}
      {selectedLevel && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-neutral-500">
            {REVIEW_LEVEL_CONFIG[selectedLevel].label} 필터 적용 중
          </span>
          <button
            onClick={() => setSelectedLevel(null)}
            className="text-xs text-blue-500 hover:underline"
          >
            필터 초기화
          </button>
        </div>
      )}

      {/* 재활성 항목 리스트 */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <ReviewItemCard
            key={`${item.domain}-${item.category}-${item.topic}`}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

