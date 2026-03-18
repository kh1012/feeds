'use client';

import Button from '@/components/common/Button';
import { FEEDS_URLS } from '@/define/urlDefines';
import IconGithubLogoWhite from '@/icons/githubLogoWhite';
import { Search } from 'lucide-react';

type HomeViewHeaderProps = {
  onSearchClick?: () => void;
};

export default function HomeViewHeader({ onSearchClick }: HomeViewHeaderProps) {
  const onClickGithub = () => {
    if (typeof window !== 'undefined') {
      window.open(FEEDS_URLS.GITHUB_TIL_REPO, '_blank');
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl text-[#fff]">Feeds</h1>
      </div>
      <div className="flex items-center gap-1">
        {onSearchClick && (
          <Button onClick={onSearchClick} transparent>
            <Search size={20} className="text-[var(--text-muted)] hover:text-[var(--foreground)]" />
          </Button>
        )}
        <Button onClick={onClickGithub} transparent>
          <IconGithubLogoWhite />
        </Button>
      </div>
    </>
  );
}
