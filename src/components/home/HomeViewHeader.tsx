'use client';

import Button from '@/components/common/Button';
import { FEEDS_URLS } from '@/define/urlDefines';
import IconGithubLogoWhite from '@/icons/githubLogoWhite';

export default function HomeViewHeader() {
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
      <Button onClick={onClickGithub} transparent>
        <IconGithubLogoWhite />
      </Button>
    </>
  );
}
