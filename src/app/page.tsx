import FeedCards from '@/components/home/FeedCards';

export default function Home() {
  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Feeds</h1>
          </div>
          <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10">
            Github
          </button>
        </header>

        <main>
          <FeedCards />
        </main>
      </div>
    </div>
  );
}
