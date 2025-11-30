import { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
}

export default function Tag({ children }: TagProps) {
  return (
    <div className="rounded-[9999] bg-neutral-100 px-2 py-1 text-xs text-neutral-600 w-fit sm:text-sm">
      {children}
    </div>
  );
}
