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
  const url = `https://lolalytics.com/lol/${championId.toLowerCase()}/counters/?lane=${ROLE_PARAM[role]}&tier=emerald_plus`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return [];

  const html = await res.text();
  const results: LolalyticsCounterEntry[] = [];
  const seen = new Set<string>();

  // パターン: "wins against <!--t=XX-->ChampionName<!----> <span class="text-green-XXX">XX.XX%</span> of the time"
  // lolalytics は target の win rate を表示。counter win rate = 100 - target win rate
  const pattern = /wins against <!--t=\w+-->([\w\s'.]+?)<!---->.*?<span class="text-green-\d+">([\d.]+)%<\/span> of the time/gs;

  for (const m of html.matchAll(pattern)) {
    const champName = m[1].trim().replace(/\s+/g, ' ');
    const targetWinRate = parseFloat(m[2]);
    const counterWinRate = Math.round((100 - targetWinRate) * 10) / 10;

    if (isNaN(counterWinRate) || seen.has(champName)) continue;
    seen.add(champName);

    // lolalytics の表示名（英語）をそのまま championId として使う
    const championIdGuess = champName.replace(/['\s.]/g, '');
    results.push({ championId: championIdGuess, winRate: counterWinRate });
  }

  return results.slice(0, 10);
}
