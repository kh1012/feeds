import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      className="rounded-md border border-[#d1d9e0] bg-[#f6f8fa] px-4 py-2 text-sm font-medium text-[#1f2328] transition-colors hover:bg-[#eaeef2] cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
