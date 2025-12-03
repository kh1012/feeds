import { formatDateWithDay } from '@/utils/dateUtils';
import { getTopicReviewLevel, needsReview, REVIEW_LEVEL_CONFIG } from '@/utils/reviewUtils';
import type { TopicDocInfo } from './matrixBuilder';
import { ReviewIndicator } from './StatusLegend';
import { DocLinkItem } from './TopicCards';
import {
  getTopicStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  abbreviateTopic,
  formatTopicName,
  type TopicStatus,
} from './heatmapConstants';

interface TopicData {
  name: string;
  value: number;
  docs: TopicDocInfo[];
}

interface TopicGridViewProps {
  topics: TopicData[];
  selectedDomain: string | null;
  selectedTopic: { name: string; docs: TopicDocInfo[] } | null;
  onTopicClick: (e: React.MouseEvent, topic: TopicData) => void;
}

export function TopicGridView({ topics, selectedDomain, selectedTopic, onTopicClick }: TopicGridViewProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2">
      {topics.map((topic) => {
        const count = topic.docs.length;
        const status = getTopicStatus(count);
        const colors = STATUS_COLORS[status];
        const isClickable = count > 0;
        const isTopicSelected = selectedTopic?.name === topic.name;
        const reviewLevel = getTopicReviewLevel(topic.docs.map((d) => d.date), count, selectedDomain ?? undefined);
        const hasReview = needsReview(reviewLevel);
        const reviewConfig = REVIEW_LEVEL_CONFIG[reviewLevel];

        return (
          <div key={topic.name} className="group relative floating-panel-trigger">
            <button
              onClick={(e) => onTopicClick(e, topic)}
              disabled={!isClickable}
              className={`
                w-full aspect-square rounded flex flex-col items-center justify-center
                transition-colors duration-150
                ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-1' : 'cursor-default'}
                ${isTopicSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
              `}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                boxShadow: hasReview ? `inset 0 0 0 3px ${reviewConfig.color}` : undefined,
              }}
            >
              <span className="text-[10px] font-semibold leading-tight">{abbreviateTopic(topic.name)}</span>
              {count > 0 && <span className="text-[8px] opacity-70 mt-0.5">{count}</span>}
            </button>
            <ReviewIndicator level={reviewLevel} />

            {/* 툴팁 - PC only */}
            <div
              className={`
                hidden sm:block absolute z-20 bottom-full mb-2
                left-0 sm:left-1/2 sm:-translate-x-1/2
                px-2 py-1 rounded shadow-lg
                bg-neutral-800 text-white text-xs
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-opacity duration-150 pointer-events-none
                min-w-max max-w-[180px]
              `}
            >
              <div className="font-medium truncate">{formatTopicName(topic.name)}</div>
              <div className="text-neutral-400 text-[10px] mt-0.5">
                {count === 0 ? STATUS_LABELS.NOT_STARTED : `${STATUS_LABELS[status]} (${count}회)`}
              </div>
              <div className="absolute top-full left-4 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface TopicListViewProps {
  topics: TopicData[];
  selectedDomain: string | null;
  selectedTopic: { name: string; docs: TopicDocInfo[] } | null;
  onTopicSelect: (topic: TopicData | null) => void;
}

export function TopicListView({ topics, selectedDomain, selectedTopic, onTopicSelect }: TopicListViewProps) {
  return (
    <div className="space-y-1">
      {topics.map((topic) => {
        const count = topic.docs.length;
        const status = getTopicStatus(count);
        const colors = STATUS_COLORS[status];
        const isClickable = count > 0;
        const isTopicSelected = selectedTopic?.name === topic.name;
        const reviewLevel = getTopicReviewLevel(topic.docs.map((d) => d.date), count, selectedDomain ?? undefined);
        const hasReview = needsReview(reviewLevel);
        const reviewConfig = REVIEW_LEVEL_CONFIG[reviewLevel];

        return (
          <div key={topic.name} className="space-y-1">
            <button
              onClick={() => {
                if (!isClickable) return;
                if (selectedTopic?.name === topic.name) {
                  onTopicSelect(null);
                } else {
                  onTopicSelect(topic);
                }
              }}
              disabled={!isClickable}
              className={`
                w-full flex items-center gap-2 px-2.5 py-1.5 rounded border transition-colors
                ${isClickable ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-default'}
                ${isTopicSelected ? 'ring-1 ring-blue-500 border-blue-300 bg-blue-50' : 'border-neutral-100'}
              `}
            >
              {/* 상태 표시 */}
              <div
                className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  boxShadow: hasReview ? `inset 0 0 0 2px ${reviewConfig.color}` : undefined,
                }}
              >
                <span className="text-[10px] font-bold">{count}</span>
              </div>

              {/* 토픽 정보 */}
              <div className="flex-1 text-left min-w-0 flex items-center gap-1.5">
                <span className="text-xs font-medium text-neutral-800 truncate">{formatTopicName(topic.name)}</span>
                {hasReview && (
                  <span
                    className="px-1 py-0.5 text-[9px] font-medium rounded shrink-0"
                    style={{ backgroundColor: reviewConfig.bgColor, color: reviewConfig.color }}
                  >
                    {reviewConfig.shortLabel}
                  </span>
                )}
              </div>

              {/* 상태 라벨 */}
              <span
                className="text-[10px] font-medium shrink-0 px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: status === 'NOT_STARTED' ? '1px solid #d0d7de' : 'none',
                }}
              >
                {STATUS_LABELS[status]}
              </span>
              {isClickable && (
                <svg
                  className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform ${isTopicSelected ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* 인라인 문서 목록 */}
            {isTopicSelected && (
              <div className="ml-9 pl-2 border-l-2 border-blue-200 space-y-1 py-1">
                {topic.docs
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((doc, idx) => (
                    <DocLinkItem key={idx} doc={doc} />
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

