'use client';

import Giscus from '@giscus/react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function GiscusComments() {
  const { theme } = useTheme();

  return (
    <section className="mt-5 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]/80 p-5 lg:p-8 mx-4 lg:mx-0">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-5">
        댓글
      </h2>
      <Giscus
        repo="kh1012/feeds"
        repoId="R_kgDOQeEtbQ"
        category="comments"
        categoryId="DIC_kwDOQeEtbc4C5O49"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="1"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark_dimmed' : 'light'}
        lang="ko"
        loading="lazy"
      />
    </section>
  );
}
