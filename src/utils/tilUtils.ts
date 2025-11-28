import { type TilContentType } from '@/define/tilDefines';
import { URL } from '@/define/urlDefines';

export async function fetchTilContents(): Promise<TilContentType[]> {
  const res = await fetch(`${URL.GITHUB_TIL_README_RAW}`, {
    next: { revalidate: 60 }, //60초 리패칭
  });

  if (!res.ok) {
    throw new Error('FAIL TO FETCH TIL README.md');
  }

  const text = await res.text();

  //  '- '라인만 찾아 배열로
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '));

  const items: TilContentType[] = lines.map((line) => {
    const match = /^-\s+\[(.+?)\]\((https:\/\/github\.com\/.+?)\)/.exec(line);
    if (!match) {
      throw new Error(`Invalid TIL line: ${line}`);
    }

    const [, title, url] = match;

    // 파일명에서 날짜 추출 (앞 6자리: YYMMDD)
    // 예: 251127_Context.md
    const fileName = title;
    const datePart = fileName.slice(0, 6); // "251127"
    const yy = datePart.slice(0, 2);
    const mm = datePart.slice(2, 4);
    const dd = datePart.slice(4, 6);
    const fullYear = `20${yy}`;
    const date = `${fullYear}-${mm}-${dd}`;

    // RAW URL로 변환
    const rawUrl = url
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');

    // slug: 확장자 떼고, 소문자 & 공백/한글은 일단 그대로 두거나 encode할 수 있음
    const slug = fileName.replace(/\.md$/i, '').replace(/\s+/g, '-').toLowerCase();

    return { title: fileName, url, rawUrl, date, slug };
  });

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
