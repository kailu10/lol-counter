import type { Role, Tier } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'middle',
  ADC: 'bottom',
  SUP: 'support',
};

const VALID_TIERS = new Set<string>(['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'D']);

function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface TierEntry {
  tier?: Tier;
  pickRate: number;
}

// Qwikテンプレートは7要素グループ:
// [0]=表示名, [1]=サブタイトル, [2]=表示名(重複), [3]=ティア, [4]="", [5]=変化, [6]=""
const HEADER_ITEMS = 9;
const GROUP_SIZE = 7;
const TIER_OFFSET = 3;

export async function scrapeTierList(role: Role): Promise<Map<string, TierEntry>> {
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

    // ティアをQwikテンプレートから抽出
    const values = [...html.matchAll(/<!--t=\w+-->(.*?)<!---->/gs)].map((m) => m[1].trim());
    const tierByName = new Map<string, Tier>();
    for (let i = HEADER_ITEMS; i + TIER_OFFSET < values.length; i += GROUP_SIZE) {
      const name = values[i];
      const tier = values[i + TIER_OFFSET];
      if (name && VALID_TIERS.has(tier)) {
        tierByName.set(normalizeId(name), tier as Tier);
      }
    }

    // ピック率をビルドURLと隣接する width:48px プレーンテキストdivから抽出
    // 構造: href="/lol/{id}/build/" ... winRateSpan ... <div width:48px>{pickRate}</div>
    const pickRateByChamp = new Map<string, number>();
    const pickPattern =
      /href="\/lol\/([\w]+)\/build\/"(?:(?!href="\/lol\/).)*?<div style="width:48px"[^>]*>\s*([\d.]+)\s*<\/div>/gs;
    for (const m of html.matchAll(pickPattern)) {
      const champId = m[1];
      const pickRate = parseFloat(m[2]);
      if (!isNaN(pickRate) && !pickRateByChamp.has(champId)) {
        pickRateByChamp.set(champId, pickRate);
      }
    }

    // 両データを統合
    const result = new Map<string, TierEntry>();
    for (const [normId, tier] of tierByName.entries()) {
      const pickRate = pickRateByChamp.get(normId) ?? 0;
      result.set(normId, { tier, pickRate });
    }
    // ティアなしでもピック率があるチャンピオンを追加
    for (const [champId, pickRate] of pickRateByChamp.entries()) {
      const normId = normalizeId(champId);
      if (!result.has(normId)) {
        result.set(normId, { pickRate });
      }
    }

    return result;
  } catch {
    return new Map();
  }
}
