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
          className="rounded-[9999] border border-[#d1d9e0] bg-[#f6f8fa] px-4 py-2 text-xs text-[#1f2328] transition-colors hover:bg-[#eaeef2] cursor-pointer w-fit sm:text-sm"
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </>
  );
}
