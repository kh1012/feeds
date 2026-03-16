import { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
}

export default function Tag({ children }: TagProps) {
  return (
    <div className="rounded-full bg-[var(--hover-bg)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] w-fit">
      {children}
    </div>
  );
}
