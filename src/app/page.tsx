import HomeViewContent from '@/components/home/HomeViewContent';
import HomeViewHeader from '@/components/home/HomeViewHeader';

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-4 text-[#1f2328]">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <HomeViewHeader />
        </header>
        <main>
          <HomeViewContent />
        </main>
      </div>
    </div>
  );
}
