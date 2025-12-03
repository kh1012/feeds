import { needsReview, REVIEW_LEVEL_CONFIG, type ReviewLevel } from '@/utils/reviewUtils';
import { STATUS_COLORS, STATUS_LABELS, STATUS_CONDITIONS, type TopicStatus } from './heatmapConstants';

// 재활성 인디케이터 컴포넌트
export function ReviewIndicator({ level, size = 'sm' }: { level: ReviewLevel; size?: 'sm' | 'md' }) {
  if (!needsReview(level)) return null;

  const config = REVIEW_LEVEL_CONFIG[level];
  const sizeClasses = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <span
      className={`absolute -top-0.5 -right-0.5 ${sizeClasses} rounded-full border border-white`}
      style={{ backgroundColor: config.color }}
      title={config.description}
    />
  );
}

// 상태 레전드 아이템
export function StatusLegendItem({ status }: { status: TopicStatus }) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const condition = STATUS_CONDITIONS[status];

  return (
    <div className="group relative flex items-center gap-1.5 cursor-help">
      <div
        className="w-2.5 h-2.5 rounded-sm"
        style={{
          backgroundColor: colors.bg,
          border: status === 'NOT_STARTED' ? '1px solid #d0d7de' : 'none',
        }}
      />
      <span>{label}</span>

      {/* 조건 툴팁 (아래 방향) */}
      <div
        className={`
          absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2
          px-2 py-1 rounded shadow-lg
          bg-neutral-800 text-white text-[10px] whitespace-nowrap
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-opacity duration-150 pointer-events-none
        `}
      >
        <span className="font-mono">{condition}</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-neutral-800" />
      </div>
    </div>
  );
}

// 상태별 개수 표기
export function StatusCountBar({
  counts,
}: {
  counts: { total: number; NOT_STARTED: number; STARTED: number; FOCUSED: number; MASTERED: number };
}) {
  return (
    <div className="flex items-center justify-center gap-4 py-2 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-neutral-500">Total</span>
        <span className="font-semibold text-neutral-700">{counts.total}</span>
      </div>
      <div className="flex items-center gap-1">
        <span
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: STATUS_COLORS.NOT_STARTED.bg, border: '1px solid #d0d7de' }}
        />
        <span className="text-neutral-400">{counts.NOT_STARTED}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: STATUS_COLORS.STARTED.bg }} />
        <span className="text-neutral-500">{counts.STARTED}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: STATUS_COLORS.FOCUSED.bg }} />
        <span className="text-neutral-500">{counts.FOCUSED}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: STATUS_COLORS.MASTERED.bg }} />
        <span className="text-neutral-600 font-medium">{counts.MASTERED}</span>
      </div>
    </div>
  );
}

// Re-active 레전드
export function ReactiveLegend() {
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center sm:justify-start">
      <span className="font-medium text-neutral-600">Re-active:</span>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REVIEW_LEVEL_CONFIG.LEVEL_1.color }} />
        <span>1M</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REVIEW_LEVEL_CONFIG.LEVEL_2.color }} />
        <span>3M</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REVIEW_LEVEL_CONFIG.LEVEL_3.color }} />
        <span>6M</span>
      </div>
    </div>
  );
}

