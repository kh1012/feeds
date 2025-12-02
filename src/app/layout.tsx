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
  title: 'kh1012 - TIL',
  description: 'Feeds',
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
        <title>kh1012 - TIL</title>
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
