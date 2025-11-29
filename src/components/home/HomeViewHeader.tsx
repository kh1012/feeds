'use client';

import Button from '@/components/common/Button';
import { FEEDS_URLS } from '@/define/urlDefines';

export default function HomeViewHeader() {
  const onClickGithub = () => {
    if (typeof window !== 'undefined') {
      window.open(FEEDS_URLS.GITHUB_TIL_REPO, '_blank');
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-[#1f2328]">Feeds</h1>
      </div>
      <Button onClick={onClickGithub}>Github</Button>
    </>
  );
}
