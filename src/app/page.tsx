import HomeViewContent from '@/components/home/HomeViewContent';
import HomeViewHeader from '@/components/home/HomeViewHeader';

export default function Home() {
  return (
    <div className="min-h-screen bg-whitetext-[#1f2328]">
      <header className="flex items-center justify-between p-4 bg-[#1b1f23]">
        <HomeViewHeader />
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <main>
          <HomeViewContent />
        </main>
      </div>
    </div>
  );
}
