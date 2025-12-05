import { NextResponse } from 'next/server';

// GitHub Contribution 데이터 타입
type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

type GitHubGraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

export type ContributionsResponse = {
  totalContributions: number;
  weeks: Array<{
    days: Array<{
      date: string;
      count: number;
      level: number;
    }>;
  }>;
};

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const CONTRIBUTION_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

function mapContributionLevel(level: ContributionDay['contributionLevel']): number {
  const levelMap: Record<ContributionDay['contributionLevel'], number> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };
  return levelMap[level];
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    console.error('GitHub credentials not configured');
    return NextResponse.json(
      { error: 'GitHub credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { username },
      }),
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data: GitHubGraphQLResponse = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const calendar = data.data?.user?.contributionsCollection.contributionCalendar;

    if (!calendar) {
      throw new Error('No contribution data found');
    }

    const result: ContributionsResponse = {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map((week) => ({
        days: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: mapContributionLevel(day.contributionLevel),
        })),
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch GitHub contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

