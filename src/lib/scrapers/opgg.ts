import type { Role, Difficulty } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'mid',
  ADC: 'adc',
  SUP: 'support',
};

const DIFFICULTY_COLOR: Record<string, Difficulty> = {
  'teal': '易しい',
  'yellow': '普通',
  'purple': '難しい',
  'orange': '普通',
};

export interface OpggCounterEntry {
  championId: string;
  winRate: number;
  difficulty: Difficulty | null;
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

  // op.gg の counter list 構造:
  // alt="ChampionName" → span>ChampionName → strong.text-main-XXX>XX.XX<!-- -->%
  const pattern = /alt="([A-Za-z']+)"[^>]*\/?><span[^>]*>[^<]+<\/span><\/div>.*?text-main-\d+[^>]*>([\d.]+)<!-- -->%/gs;

  const seen = new Set<string>();
  for (const m of html.matchAll(pattern)) {
    const champId = m[1].trim();
    const winRate = parseFloat(m[2]);

    if (champId === championId || isNaN(winRate) || seen.has(champId)) continue;
    if (winRate < 45 || winRate > 75) continue; // 明らかに違うデータを除外

    seen.add(champId);

    // 難易度: チャンピオンアイコンのborder色から推定
    const diffMatch = html.slice(
      Math.max(0, html.indexOf(`alt="${champId}"`) - 200),
      html.indexOf(`alt="${champId}"`)
    ).match(/border-(teal|yellow|purple|orange)-500/);
    const difficulty: Difficulty | null = diffMatch ? (DIFFICULTY_COLOR[diffMatch[1]] ?? null) : null;

    results.push({ championId: champId, winRate, difficulty });
  }

  return results.slice(0, 10);
}
