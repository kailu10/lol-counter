import { scrapeLolalytics } from './scrapers/lolalytics';
import { scrapeTierList } from './scrapers/tierlist';
import { cacheKey, getCached, setCached } from './cache';
import { getAllChampions, getLatestPatch } from './ddragon';
import type { Role, CounterResult, CounterEntry, Tier, Champion } from '@/types';

function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function getCounterData(
  championId: string,
  role: Role
): Promise<CounterResult | null> {
  const key = cacheKey(championId, role);
  const cached = getCached(key);
  if (cached) return cached;

  const [champions, patch] = await Promise.all([getAllChampions(), getLatestPatch()]);

  const champion = champions.find(
    (c) => c.id.toLowerCase() === championId.toLowerCase()
  );
  if (!champion) return null;

  // 正規化IDから ddragon チャンピオンを引くための索引
  const champByNorm = new Map<string, Champion>();
  for (const c of champions) champByNorm.set(normalizeId(c.id), c);

  // データソースは lolalytics に一本化（カウンター勝率・試合数・ティア）
  const [lolalyticsData, tierData] = await Promise.allSettled([
    scrapeLolalytics(championId, role),
    scrapeTierList(role),
  ]);

  const lolalytics = lolalyticsData.status === 'fulfilled' ? lolalyticsData.value : [];
  const tierMap = tierData.status === 'fulfilled' ? tierData.value : new Map();

  if (lolalytics.length === 0) return null;

  const counters: CounterEntry[] = [];
  for (const e of lolalytics) {
    const norm = normalizeId(e.championId);
    const champ = champByNorm.get(norm);
    if (!champ) continue; // ddragon に存在しないキャラはスキップ

    const tier = tierMap.get(norm)?.tier as Tier | undefined;
    counters.push({
      championId: champ.id, // 正準な ddragon ID に統一（アイコン・ティア照合の一貫性）
      nameJa: champ.nameJa,
      winRate: e.winRate,
      sampleCount: e.sampleCount && e.sampleCount > 0 ? e.sampleCount : undefined,
      tier,
    });
  }

  counters.sort((a, b) => b.winRate - a.winRate);

  const result: CounterResult = {
    targetChampionId: champion.id,
    targetNameJa: champion.nameJa,
    role,
    patch,
    counters: counters.slice(0, 10),
    fetchedAt: Date.now(),
  };

  setCached(key, result);
  return result;
}
