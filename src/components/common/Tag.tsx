import { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
}

export default function Tag({ children }: TagProps) {
  return (
    <div className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 w-fit">
      {children}
    </div>
  );
}
