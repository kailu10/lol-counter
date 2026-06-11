import * as cheerio from 'cheerio';
import type { Role } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'middle',
  ADC: 'bottom',
  SUP: 'support',
};

export interface LolalyticsCounterEntry {
  championId: string;
  winRate: number;
}

export async function scrapeLolalytics(
  championId: string,
  role: Role
): Promise<LolalyticsCounterEntry[]> {
  const url = `https://lolalytics.com/lol/${championId.toLowerCase()}/vs/${ROLE_PARAM[role]}/?tier=emerald_plus`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ja,en;q=0.9',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return [];

  const html = await res.text();
  const $ = cheerio.load(html);
  const results: LolalyticsCounterEntry[] = [];

  // lolalyticsのカウンターテーブルをパース
  $('[class*="counter"] tr, [class*="MatchupRow"], table tr').each((_, el) => {
    const row = $(el);

    const imgSrc = row.find('img').first().attr('src') ?? '';
    const href = row.find('a').first().attr('href') ?? '';
    const idFromImg = imgSrc.match(/\/([A-Za-z]+)\.webp/)?.[1] ??
                      imgSrc.match(/champion\/([^.]+)\.png/)?.[1];
    const idFromHref = href.match(/\/lol\/([^/]+)\//)?.[1];
    const champId = idFromImg ?? idFromHref;
    if (!champId || champId.length < 2) return;

    const winRateText = row.find('[class*="win"], td').filter((_, td) => {
      return /\d+\.\d+%/.test($(td).text());
    }).first().text();
    const winRate = parseFloat(winRateText.replace('%', ''));
    if (isNaN(winRate)) return;

    results.push({ championId: champId, winRate });
  });

  return results.slice(0, 10);
}
