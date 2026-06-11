import * as cheerio from 'cheerio';
import type { Role } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'mid',
  ADC: 'adc',
  SUP: 'support',
};

export interface LolpsCounterEntry {
  championId: string;
  winRate: number;
}

export async function scrapeLolps(
  championId: string,
  role: Role
): Promise<LolpsCounterEntry[]> {
  const url = `https://lol.ps/champion/${championId.toLowerCase()}/counter?lane=${ROLE_PARAM[role]}&tier=6`;

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
  const results: LolpsCounterEntry[] = [];

  $('table tbody tr, [class*="counter-champion"], [class*="CounterChampion"]').each((_, el) => {
    const row = $(el);

    const imgSrc = row.find('img').first().attr('src') ?? '';
    const href = row.find('a').first().attr('href') ?? '';
    const idFromImg = imgSrc.match(/\/champion\/([^/.]+)/)?.[1];
    const idFromHref = href.match(/\/champion\/([^/]+)/)?.[1];
    const champId = idFromImg ?? idFromHref;
    if (!champId || champId.length < 2) return;

    const winRateText = row.find('[class*="win"], [class*="rate"], td').filter((_, td) => {
      return /\d+\.\d+%/.test($(td).text());
    }).first().text();
    const winRate = parseFloat(winRateText.replace('%', ''));
    if (isNaN(winRate)) return;

    results.push({ championId: champId, winRate });
  });

  return results.slice(0, 10);
}
