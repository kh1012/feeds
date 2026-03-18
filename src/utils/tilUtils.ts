import { type TilContentType } from '@/define/tilDefines';
import { FEEDS_URLS } from '@/define/urlDefines';

/** GitHub Contents API 응답 타입 */
type GitHubContentEntry = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  html_url: string;
  download_url: string | null;
};

/** 제외할 디렉토리/파일 목록 */
const EXCLUDED_DIRS = new Set(['codes', 'assets', 'node_modules', '.github']);
const EXCLUDED_FILES = new Set(['README.md']);

/** 파일명이 6자리 숫자(YYMMDD)로 시작하는지 검사 */
const DATE_PREFIX_REGEX = /^\d{6}/;

/** GitHub Contents API를 호출하여 디렉토리 내용을 가져옴 */
async function fetchGitHubContents(path: string): Promise<GitHubContentEntry[]> {
  const url = `${FEEDS_URLS.GITHUB_TIL_CONTENTS_API}/${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub contents: ${path} (${res.status})`);
  }

  return res.json();
}

/** 디렉토리를 재귀 탐색하여 .md 파일을 수집 */
async function collectMarkdownFiles(path: string): Promise<GitHubContentEntry[]> {
  const entries = await fetchGitHubContents(path);
  const files: GitHubContentEntry[] = [];

  const subDirPromises: Promise<GitHubContentEntry[]>[] = [];

  for (const entry of entries) {
    if (entry.type === 'dir') {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      subDirPromises.push(collectMarkdownFiles(entry.path));
    } else if (entry.type === 'file' && entry.name.endsWith('.md')) {
      if (EXCLUDED_FILES.has(entry.name)) continue;
      if (!DATE_PREFIX_REGEX.test(entry.name)) continue;
      files.push(entry);
    }
  }

  const subResults = await Promise.all(subDirPromises);
  for (const subFiles of subResults) {
    files.push(...subFiles);
  }

  return files;
}

export async function fetchTilContents(): Promise<TilContentType[]> {
  // 루트 디렉토리를 조회하여 연도 디렉토리(숫자 4자리)만 필터링
  const rootEntries = await fetchGitHubContents('');
  const yearDirs = rootEntries.filter(
    (entry) => entry.type === 'dir' && /^\d{4}$/.test(entry.name)
  );

  // 각 연도 디렉토리를 병렬로 재귀 탐색
  const allFilesArrays = await Promise.all(
    yearDirs.map((dir) => collectMarkdownFiles(dir.path))
  );
  const allFiles = allFilesArrays.flat();

  const items: TilContentType[] = allFiles.map((file) => {
    const fileName = file.name;

    // 파일명에서 날짜 추출 (앞 6자리: YYMMDD)
    // 예: 251127_Context.md
    const datePart = fileName.slice(0, 6);
    const yy = datePart.slice(0, 2);
    const mm = datePart.slice(2, 4);
    const dd = datePart.slice(4, 6);
    const fullYear = `20${yy}`;
    const date = `${fullYear}-${mm}-${dd}`;

    const url = file.html_url;
    const rawUrl = file.download_url ?? '';

    // slug: 확장자 떼고, 소문자 & 공백은 하이픈으로
    const slug = fileName.replace(/\.md$/i, '').replace(/\s+/g, '-').toLowerCase();

    return { title: fileName, url, rawUrl, date, slug };
  });

  // 날짜 내림차순 정렬
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function fetchTilContentMarkdown(rawUrl: string): Promise<string> {
  const res = await fetch(rawUrl, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('FAIL TO FETCH TIL README.md');
  }

  return await res.text();
}
