import HomeViewContent from '@/components/home/HomeViewContent';
import GNB from '@/components/common/GNB';

export default function Home() {
  return (
    <div className="min-h-screen  text-[#1f2328]">
      <GNB />
      <div className="mx-auto flex flex-col">
        <main>
          <HomeViewContent />
        </main>
      </div>
    </div>
  );
}
