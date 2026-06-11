import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ChampionSearch from '@/components/ChampionSearch';
import CounterList from '@/components/CounterList';
import { getCounterData } from '@/lib/counter';
import type { Role } from '@/types';

const VALID_ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

export default async function CounterPage({
  params,
}: {
  params: Promise<{ champion: string; role: string }>;
}) {
  const { champion, role } = await params;
  const upperRole = role.toUpperCase() as Role;

  if (!VALID_ROLES.includes(upperRole)) notFound();

  const result = await getCounterData(champion, upperRole);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <ChampionSearch initialChampionId={champion} initialRole={upperRole} />
        {result ? (
          <CounterList result={result} patch={result.patch} />
        ) : (
          <div
            className="rounded-lg p-8 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              データを取得できませんでした。しばらくしてから再試行してください。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
