import { useQuery } from '@tanstack/react-query';
import type { ContributionsData } from '@/types/github';

// 타입 재export (하위 호환성)
export type { ContributionDay, ContributionWeek, ContributionsData } from '@/types/github';

async function fetchContributions(): Promise<ContributionsData> {
  const res = await fetch('/api/github/contributions');

  if (!res.ok) {
    throw new Error('Failed to fetch contributions');
  }

  return res.json();
}

export function useGetGithubContributions() {
  return useQuery({
    queryKey: ['github-contributions'],
    queryFn: fetchContributions,
    staleTime: 1000 * 60 * 60, // 1시간
    gcTime: 1000 * 60 * 60 * 24, // 24시간
    retry: 2,
  });
}
