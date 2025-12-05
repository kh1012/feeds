// GitHub Contribution 관련 타입 정의

/** 일별 기여 데이터 */
export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

/** 주별 기여 데이터 */
export type ContributionWeek = {
  days: ContributionDay[];
};

/** Contribution 응답 데이터 */
export type ContributionsData = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

/** GitHub GraphQL API 원본 타입 */
export type GitHubContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE';

/** GitHub GraphQL API 응답의 일별 데이터 */
export type GitHubContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel: GitHubContributionLevel;
};

/** GitHub GraphQL API 응답의 주별 데이터 */
export type GitHubContributionWeek = {
  contributionDays: GitHubContributionDay[];
};

/** GitHub GraphQL API 응답의 캘린더 데이터 */
export type GitHubContributionCalendar = {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
};

/** GitHub GraphQL API 전체 응답 */
export type GitHubGraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: GitHubContributionCalendar;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

/** Contribution 레벨 맵핑 */
export const CONTRIBUTION_LEVEL_MAP: Record<GitHubContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

