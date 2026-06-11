import Header from '@/components/Header';
import ChampionSearch from '@/components/ChampionSearch';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <ChampionSearch />
        <p className="text-xs text-center mt-4" style={{ color: '#4B5563' }}>
          チャンピオンを選択してロールを指定し、検索してください
        </p>
      </main>
    </div>
  );
}
