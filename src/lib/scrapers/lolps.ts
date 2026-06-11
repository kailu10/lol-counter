import type { Role } from '@/types';

export interface LolpsCounterEntry {
  championId: string;
  winRate: number;
}

// lol.ps はカウンターデータが有料会員限定のため利用不可
export async function scrapeLolps(
  _championId: string,
  _role: Role
): Promise<LolpsCounterEntry[]> {
  return [];
}
