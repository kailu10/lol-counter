import * as cheerio from 'cheerio';
import type { Role } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'mid',
  ADC: 'adc',
  SUP: 'support',
};

const DIFFICULTY_MAP: Record<string, import('@/types').Difficulty> = {
  Easy: '易しい',
  Normal: '普通',
  Hard: '難しい',
  Medium: '普通',
};

export interface OpggCounterEntry {
  championId: string;
  winRate: number;
  difficulty: import('@/types').Difficulty | null;
}

export async function scrapeOpgg(
  championId: string,
  role: Role
): Promise<OpggCounterEntry[]> {
  const url = `https://www.op.gg/champions/${championId.toLowerCase()}/counters?position=${ROLE_PARAM[role]}&tier=emerald`;

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
  const results: OpggCounterEntry[] = [];

  // op.ggのカウンターテーブルをパース
  $('table tbody tr, [class*="counter"] [class*="champion-item"], [class*="CounterItem"]').each((_, el) => {
    const row = $(el);

    // チャンピオン名からIDを取得（imgのsrcまたはhrefから）
    const imgSrc = row.find('img').first().attr('src') ?? '';
    const href = row.find('a').first().attr('href') ?? '';

    const idFromImg = imgSrc.match(/\/champions\/([^/]+)\//)?.[1] ??
                      imgSrc.match(/champion\/([^.]+)\.png/)?.[1];
    const idFromHref = href.match(/\/champions\/([^/]+)/)?.[1];
    const championId = idFromImg ?? idFromHref;
    if (!championId) return;

    // 勝率テキストを取得
    const winRateText = row.find('[class*="win-rate"], [class*="winrate"], td').filter((_, td) => {
      const text = $(td).text();
      return /\d+\.\d+%/.test(text);
    }).first().text();
    const winRate = parseFloat(winRateText.replace('%', ''));
    if (isNaN(winRate)) return;

    // 難易度
    const diffText = row.find('[class*="difficulty"], [class*="Difficulty"]').first().text().trim();
    const difficulty = DIFFICULTY_MAP[diffText] ?? null;

    results.push({ championId, winRate, difficulty });
  });

  return results.slice(0, 10);
}
