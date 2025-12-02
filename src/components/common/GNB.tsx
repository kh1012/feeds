'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/common/Button';
import { FEEDS_URLS } from '@/define/urlDefines';
import IconGithubLogoWhite from '@/icons/githubLogoWhite';

const navItems = [
  { href: '/', label: 'Feeds' },
  { href: '/heatmap', label: 'Heatmap' },
  { href: '/analysis', label: 'Analysis' },
] as const;

export default function GNB() {
  const pathname = usePathname();

  const onClickGithub = () => {
    if (typeof window !== 'undefined') {
      window.open(FEEDS_URLS.GITHUB_TIL_REPO, '_blank');
    }
  };

  return (
    <header className="fixed inset-x-0 z-[9999]">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1b1f23]">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }
              `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button onClick={onClickGithub} transparent>
          <IconGithubLogoWhite />
        </Button>
      </div>
    </header>
  );
}
