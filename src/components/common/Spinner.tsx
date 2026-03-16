import { Loader } from 'lucide-react';

export function Spinner() {
  return (
    <Loader className="w-6 h-6 text-[var(--accent)] animate-spin" />
  );
}
