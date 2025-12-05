import { useQuery } from '@tanstack/react-query';

export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type ContributionWeek = {
  days: ContributionDay[];
};

export type ContributionsData = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

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

