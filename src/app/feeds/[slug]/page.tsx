import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadAllDocsWithUrl } from '@/components/heatmap/matrixBuilder';
import { FeedDetailContent } from '@/components/feeds/FeedDetailContent';
import { getSlugFromUrl } from '@/utils/feedUtils';

type Props = {
  params: Promise<{ slug: string }>;
};

// 동적 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const docs = await loadAllDocsWithUrl();
  const doc = docs.find((d) => getSlugFromUrl(d.rawUrl) === slug);

  if (!doc) {
    return {
      title: 'Not Found - TIL',
    };
  }

  return {
    title: `${doc.topic} - kh1012 TIL`,
    description: doc.summary,
    keywords: doc.keywords,
    openGraph: {
      title: doc.topic,
      description: doc.summary,
      type: 'article',
    },
  };
}

// 정적 경로 생성 (빌드 시)
export async function generateStaticParams() {
  const docs = await loadAllDocsWithUrl();
  return docs.map((doc) => ({
    slug: getSlugFromUrl(doc.rawUrl),
  }));
}

export default async function FeedDetailPage({ params }: Props) {
  const { slug } = await params;
  const docs = await loadAllDocsWithUrl();
  const doc = docs.find((d) => getSlugFromUrl(d.rawUrl) === slug);

  if (!doc) {
    notFound();
  }

  return <FeedDetailContent doc={doc} docs={docs} slug={slug} />;
}

