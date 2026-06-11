import type { Role } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'mid',
  ADC: 'adc',
  SUP: 'support',
};

export interface OpggCounterEntry {
  championId: string;
  winRate: number;
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
  const results: OpggCounterEntry[] = [];
  const pattern = /alt="([A-Za-z']+)"[^>]*\/?><span[^>]*>[^<]+<\/span><\/div>.*?text-main-\d+[^>]*>([\d.]+)<!-- -->%/gs;

  const seen = new Set<string>();
  for (const m of html.matchAll(pattern)) {
    const champId = m[1].trim();
    const winRate = parseFloat(m[2]);

    if (champId === championId || isNaN(winRate) || seen.has(champId)) continue;
    if (winRate < 45 || winRate > 75) continue;

    seen.add(champId);
    results.push({ championId: champId, winRate });
  }

  return results.slice(0, 10);
}
