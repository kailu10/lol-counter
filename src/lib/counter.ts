import { scrapeOpgg } from './scrapers/opgg';
import { scrapeLolalytics } from './scrapers/lolalytics';
import { scrapeLolps } from './scrapers/lolps';
import { aggregateCounters } from './aggregator';
import { cacheKey, getCached, setCached } from './cache';
import { getAllChampions, getLatestPatch } from './ddragon';
import type { Role, CounterResult } from '@/types';

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

  const jaNameMap = new Map(champions.map((c) => [c.id, c.nameJa]));

  const [opggData, lolalyticsData, lolpsData] = await Promise.allSettled([
    scrapeOpgg(championId, role),
    scrapeLolalytics(championId, role),
    scrapeLolps(championId, role),
  ]);

  const opgg = opggData.status === 'fulfilled' ? opggData.value : [];
  const lolalytics = lolalyticsData.status === 'fulfilled' ? lolalyticsData.value : [];
  const lolps = lolpsData.status === 'fulfilled' ? lolpsData.value : [];

  if (opgg.length === 0 && lolalytics.length === 0 && lolps.length === 0) {
    return null;
  }

  const counters = aggregateCounters(opgg, lolalytics, lolps, jaNameMap);

  const result: CounterResult = {
    targetChampionId: champion.id,
    targetNameJa: champion.nameJa,
    role,
    patch,
    counters,
    fetchedAt: Date.now(),
  };

  setCached(key, result);
  return result;
}
