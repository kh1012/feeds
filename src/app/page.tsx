export default function Home() {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-5xl px-4 py-8 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
        <main className="space-y-4">{/* 피드 카드들 */}</main>
        <aside className="space-y-4 md:block hidden">{/* 인기 글, 태그, Now 섹션 */}</aside>
      </div>
    </div>
  );
}
