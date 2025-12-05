// slug 추출 유틸 (rawUrl에서 파일명 추출)
export function getSlugFromUrl(rawUrl: string): string {
  const filename = rawUrl.split('/').pop() ?? '';
  return filename.replace('.md', '');
}

