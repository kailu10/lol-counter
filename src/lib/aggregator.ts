import type { CounterEntry, Difficulty, Tier } from '@/types';
import type { OpggCounterEntry } from './scrapers/opgg';
import type { LolalyticsCounterEntry } from './scrapers/lolalytics';
import type { LolpsCounterEntry } from './scrapers/lolps';

function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function aggregateCounters(
  opggResults: OpggCounterEntry[],
  lolalyticsResults: LolalyticsCounterEntry[],
  lolpsResults: LolpsCounterEntry[],
  jaNameMap: Map<string, string>,
  tierMap: Map<string, Tier> = new Map()
): CounterEntry[] {
  const map = new Map<string, {
    winRateSum: number;
    count: number;
    difficulty: Difficulty | null;
    sampleCount: number;
  }>();

  const addEntry = (
    id: string,
    winRate: number,
    difficulty: Difficulty | null = null,
    sampleCount = 0
  ) => {
    const key = normalizeId(id);
    const existing = map.get(key);
    if (existing) {
      existing.winRateSum += winRate;
      existing.count += 1;
      if (difficulty && !existing.difficulty) existing.difficulty = difficulty;
      existing.sampleCount += sampleCount;
    } else {
      map.set(key, { winRateSum: winRate, count: 1, difficulty, sampleCount });
    }
  };

  opggResults.forEach((e) => addEntry(e.championId, e.winRate, e.difficulty));
  lolalyticsResults.forEach((e) => addEntry(e.championId, e.winRate, null, e.sampleCount ?? 0));
  lolpsResults.forEach((e) => addEntry(e.championId, e.winRate));

  const entries: CounterEntry[] = [];

  for (const [normalizedId, data] of map.entries()) {
    const originalId = findOriginalId(normalizedId, [
      ...opggResults.map((e) => e.championId),
      ...lolalyticsResults.map((e) => e.championId),
      ...lolpsResults.map((e) => e.championId),
    ]);
    if (!originalId) continue;

    const nameJa = findJaName(originalId, jaNameMap);
    if (!nameJa) continue;

    const tier = tierMap.get(normalizedId);

    entries.push({
      championId: originalId,
      nameJa,
      winRate: Math.round((data.winRateSum / data.count) * 10) / 10,
      difficulty: data.difficulty,
      sourceCount: data.count,
      sampleCount: data.sampleCount > 0 ? data.sampleCount : undefined,
      tier,
    });
  }

  entries.sort((a, b) => {
    if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
    return b.winRate - a.winRate;
  });

  return entries.slice(0, 10);
}

function findOriginalId(normalizedId: string, ids: string[]): string | null {
  return ids.find((id) => normalizeId(id) === normalizedId) ?? null;
}

function findJaName(championId: string, jaNameMap: Map<string, string>): string | null {
  const normalized = normalizeId(championId);
  for (const [key, value] of jaNameMap.entries()) {
    if (normalizeId(key) === normalized) return value;
  }
  return null;
}
