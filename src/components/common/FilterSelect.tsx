import { formatName } from '@/utils/formatUtils';

type FilterSelectProps = {
  label: string;
  value: string | null;
  options: string[];
  placeholder: string;
  onChange: (value: string | null) => void;
};

/**
 * 필터용 셀렉트 컴포넌트
 */
export function FilterSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
}: FilterSelectProps) {
  return (
    <div>
      <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full px-3 py-2 pr-8 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {formatName(option)}
            </option>
          ))}
        </select>
        <ChevronDownIcon />
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

