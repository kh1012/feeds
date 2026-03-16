'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { FEEDS_URLS } from '@/define/urlDefines';
import IconGithubLogoWhite from '@/icons/githubLogoWhite';
import { useTheme } from '@/components/providers/ThemeProvider';

const navItems = [
  { href: '/', label: 'Feeds' },
] as const;

export default function GNB() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const onClickGithub = () => {
    if (typeof window !== 'undefined') {
      window.open(FEEDS_URLS.GITHUB_TIL_REPO, '_blank');
    }
  };

  return (
    <header className="fixed inset-x-0 z-[9999]">
      <div className="flex items-center justify-between px-6 py-3.5 bg-[var(--gnb-bg)]/95 backdrop-blur-md border-b border-[var(--card-border)]/60">
        <nav className="flex items-center gap-1">
          <Link href="/" className="text-lg font-semibold text-[var(--foreground)] tracking-tight mr-4">TIL</Link>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-[var(--hover-bg)] text-[var(--foreground)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]/60'
                }
              `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]/60 transition-all duration-200 cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            type="button"
            onClick={onClickGithub}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]/60 transition-all duration-200 cursor-pointer"
          >
            <IconGithubLogoWhite />
          </button>
        </div>
      </div>
    </header>
  );
}
