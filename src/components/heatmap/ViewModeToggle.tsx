interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  listSortBy: 'default' | 'status';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (sort: 'default' | 'status') => void;
}

export function ViewModeToggle({ viewMode, listSortBy, onViewModeChange, onSortChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0">
      {viewMode === 'list' && (
        <select
          value={listSortBy}
          onChange={(e) => onSortChange(e.target.value as 'default' | 'status')}
          className="text-xs pl-2 pr-6 py-1 border border-neutral-200 rounded bg-white text-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-no-repeat bg-size-[12px] bg-position-[right_6px_center]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          }}
        >
          <option value="default">기본순</option>
          <option value="status">상태순</option>
        </select>
      )}
      <div className="flex items-center gap-0.5 bg-neutral-100 rounded p-0.5">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
          title="그리드 뷰"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
          title="리스트 뷰"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

