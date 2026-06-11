export type Role = 'TOP' | 'JG' | 'MID' | 'ADC' | 'SUP';

export interface Champion {
  id: string;
  nameJa: string;
  nameEn: string;
  roles: Role[];
}

export type Difficulty = '易しい' | '普通' | '難しい';

export interface CounterEntry {
  championId: string;
  nameJa: string;
  winRate: number;
  difficulty: Difficulty | null;
  sourceCount: number;
}

export interface CounterResult {
  targetChampionId: string;
  targetNameJa: string;
  role: Role;
  patch: string;
  counters: CounterEntry[];
  fetchedAt: number;
}
