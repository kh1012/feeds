import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  transparent?: boolean;
}

export default function Button({ children, onClick, transparent }: ButtonProps) {
  return (
    <>
      {transparent ? (
        <button type={'button'} className={'cursor-pointer w-fit'} onClick={onClick}>
          {children}
        </button>
      ) : (
        <button
          type={'button'}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-xs text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--hover-bg)] hover:border-[var(--text-muted)] cursor-pointer w-fit sm:text-sm"
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </>
  );
}
