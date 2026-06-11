import type { Role } from '@/types';

const ROLE_PARAM: Record<Role, string> = {
  TOP: 'top',
  JG: 'jungle',
  MID: 'middle',
  ADC: 'bottom',
  SUP: 'support',
};

function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface PickRateEntry {
  pickRate: number;
}

// lolalytics のティアリストページから各チャンピオンのピック率を抽出（一覧の使用率順ソート用）。
// 注: lolalytics のティア文字はクライアント側で算出されるためサーバーからは取得不可。
// ピック率も SSR されるのは上位の一部のみで、レーンフィルタはクライアント適用。完全な値ではない点に留意。
export async function scrapePickRates(role: Role): Promise<Map<string, PickRateEntry>> {
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

    // 構造: href="/lol/{id}/build/" ... winRateSpan ... <div width:48px>{pickRate}</div>
    const result = new Map<string, PickRateEntry>();
    const pickPattern =
      /href="\/lol\/([\w]+)\/build\/"(?:(?!href="\/lol\/).)*?<div style="width:48px"[^>]*>\s*([\d.]+)\s*<\/div>/gs;
    for (const m of html.matchAll(pickPattern)) {
      const normId = normalizeId(m[1]);
      const pickRate = parseFloat(m[2]);
      if (!isNaN(pickRate) && !result.has(normId)) {
        result.set(normId, { pickRate });
      }
    }

    return result;
  } catch {
    return new Map();
  }
}
