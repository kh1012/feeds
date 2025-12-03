import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import GNB from '@/components/common/GNB';
import QueryProvider from '@/components/providers/QueryProvider';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'kh1012 - TIL',
    template: '%s | kh1012 TIL',
  },
  description: '프론트엔드 개발자의 TIL(Today I Learned) - React, TypeScript, Next.js 학습 기록',
  keywords: ['TIL', 'Today I Learned', 'Frontend', 'React', 'TypeScript', 'Next.js'],
  authors: [{ name: 'kh1012', url: 'https://github.com/kh1012' }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <QueryProvider>
          <GNB />
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
