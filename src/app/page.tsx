import { Metadata } from 'next';
import HomeViewContent from '@/components/home/HomeViewContent';
import { loadAllDocsWithUrl } from '@/components/heatmap/matrixBuilder';

// 동적 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  const docs = await loadAllDocsWithUrl();

  // 최근 5개 피드의 토픽을 description에 포함
  const recentDocs = docs.slice(0, 5);
  const feedTopics = recentDocs.map((doc) => doc.topic).join(', ');

  // 전체 키워드 수집 (중복 제거, 최대 15개)
  const allKeywords = new Set<string>();
  for (const doc of docs) {
    for (const keyword of doc.keywords) {
      allKeywords.add(keyword);
    }
    allKeywords.add(doc.category);
    allKeywords.add(doc.domain);
  }
  const keywords = Array.from(allKeywords).slice(0, 15);

  // 첫 번째 피드의 요약을 대표 description으로 사용
  const primaryDescription =
    recentDocs[0]?.summary || '프론트엔드 개발자의 TIL(Today I Learned) 기록입니다.';

  const description = `${primaryDescription} | 최근 주제: ${feedTopics}`;

  return {
    title: 'kh1012 - TIL | 개발 학습 기록',
    description,
    keywords,
    authors: [{ name: 'kh1012', url: 'https://github.com/kh1012' }],
    openGraph: {
      title: 'kh1012 - TIL',
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: 'kh1012 TIL',
    },
    twitter: {
      card: 'summary',
      title: 'kh1012 - TIL',
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default function Home() {
  return (
    <div className="mx-auto flex flex-col">
      <HomeViewContent />
    </div>
  );
}
