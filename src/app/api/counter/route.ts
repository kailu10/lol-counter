import { NextRequest, NextResponse } from 'next/server';
import { scrapeOpgg } from '@/lib/scrapers/opgg';
import { scrapeLolalytics } from '@/lib/scrapers/lolalytics';
import { scrapeLolps } from '@/lib/scrapers/lolps';
import { aggregateCounters } from '@/lib/aggregator';
import { cacheKey, getCached, setCached } from '@/lib/cache';
import { getAllChampions, getLatestPatch } from '@/lib/ddragon';
import type { Role, CounterResult } from '@/types';

const VALID_ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const championId = searchParams.get('champion');
  const role = searchParams.get('role') as Role;

  if (!championId || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'パラメーターが不正です' }, { status: 400 });
  }

  const key = cacheKey(championId, role);
  const cached = getCached(key);
  if (cached) return NextResponse.json(cached);

  const [champions, patch] = await Promise.all([getAllChampions(), getLatestPatch()]);

  const champion = champions.find(
    (c) => c.id.toLowerCase() === championId.toLowerCase()
  );
  if (!champion) {
    return NextResponse.json({ error: 'チャンピオンが見つかりません' }, { status: 404 });
  }

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
    return NextResponse.json({ error: 'データを取得できませんでした' }, { status: 503 });
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
  return NextResponse.json(result);
}
