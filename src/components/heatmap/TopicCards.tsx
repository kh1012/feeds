import { formatDateWithDay } from '@/utils/dateUtils';
import type { TopicDocInfo } from './matrixBuilder';
import { formatTopicName } from './heatmapConstants';

// 축소된 FeedCard 컴포넌트
export function CompactFeedCard({ doc }: { doc: TopicDocInfo }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-neutral-200">
      <p className="text-xs text-neutral-500 mb-1">{formatDateWithDay(doc.date)}</p>
      <h4 className="text-sm font-medium text-neutral-900 truncate">{doc.title}</h4>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline truncate block mt-1"
      >
        GitHub에서 보기
      </a>
    </div>
  );
}

// 플로팅 카드 패널 (PC용)
export function FloatingCardPanel({
  topic,
  position,
  onClose,
}: {
  topic: { name: string; docs: TopicDocInfo[] };
  position: { x: number; y: number; showLeft: boolean };
  onClose: () => void;
}) {
  return (
    <div
      className="fixed z-50 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden"
      style={{
        top: position.y,
        left: position.showLeft ? position.x - 288 : position.x + 16,
      }}
    >
      <div className="flex items-center justify-between p-3 border-b border-neutral-100 bg-neutral-50">
        <h4 className="text-sm font-medium text-neutral-900">{formatTopicName(topic.name)}</h4>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {topic.docs.map((doc, idx) => (
          <CompactFeedCard key={idx} doc={doc} />
        ))}
      </div>
    </div>
  );
}

// 문서 링크 아이템
export function DocLinkItem({ doc }: { doc: TopicDocInfo }) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-2 py-1.5 bg-white rounded border border-neutral-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
    >
      <span className="text-[10px] text-neutral-400 font-mono shrink-0">{formatDateWithDay(doc.date)}</span>
      <span className="text-xs text-neutral-700 truncate flex-1">{doc.title.replace('.md', '')}</span>
      <svg className="w-3 h-3 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}

// 모바일 문서 목록 패널
export function MobileDocPanel({
  topic,
  onClose,
}: {
  topic: { name: string; docs: TopicDocInfo[] };
  onClose: () => void;
}) {
  return (
    <div className="border-t border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-neutral-900">
          {formatTopicName(topic.name)}
          <span className="ml-2 text-xs font-normal text-neutral-500">{topic.docs.length}개 문서</span>
        </h4>
        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {topic.docs
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((doc, idx) => (
            <a
              key={idx}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-neutral-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <span className="text-[10px] text-neutral-400 font-mono shrink-0">{formatDateWithDay(doc.date)}</span>
              <span className="text-xs text-neutral-700 truncate flex-1">{doc.title.replace('.md', '')}</span>
              <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ))}
      </div>
    </div>
  );
}

