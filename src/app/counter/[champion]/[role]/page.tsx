import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ChampionSearch from '@/components/ChampionSearch';
import CounterList from '@/components/CounterList';
import type { Role, CounterResult } from '@/types';

const VALID_ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

async function fetchCounter(champion: string, role: Role): Promise<CounterResult | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/counter?champion=${champion}&role=${role}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CounterPage({
  params,
}: {
  params: Promise<{ champion: string; role: string }>;
}) {
  const { champion, role } = await params;
  const upperRole = role.toUpperCase() as Role;

  if (!VALID_ROLES.includes(upperRole)) notFound();

  const result = await fetchCounter(champion, upperRole);

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
