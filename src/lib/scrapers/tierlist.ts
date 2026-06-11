import type { Role, Tier } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'middle',
  ADC: 'bottom',
  SUP: 'support',
};

const VALID_TIERS = new Set<string>(['S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D']);

function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// lolalytics tierlist のQwikテンプレートは以下の7要素グループで並ぶ:
// [0]=表示名, [1]=サブタイトル, [2]=表示名(重複), [3]=ティア, [4]="", [5]="+"/"-"/"", [6]=""
const HEADER_ITEMS = 9;
const GROUP_SIZE = 7;
const TIER_OFFSET = 3;

export async function scrapeTierList(role: Role): Promise<Map<string, Tier>> {
  const url = `https://lolalytics.com/lol/tierlist/?lane=${ROLE_PARAM[role]}&tier=emerald_plus`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return new Map();

    const html = await res.text();
    const values = [...html.matchAll(/<!--t=\w+-->(.*?)<!---->/gs)].map((m) => m[1].trim());

    const tierMap = new Map<string, Tier>();
    for (let i = HEADER_ITEMS; i + TIER_OFFSET < values.length; i += GROUP_SIZE) {
      const name = values[i];
      const tier = values[i + TIER_OFFSET];
      if (name && VALID_TIERS.has(tier)) {
        tierMap.set(normalizeId(name), tier as Tier);
      }
    }
    return tierMap;
  } catch {
    return new Map();
  }
}
