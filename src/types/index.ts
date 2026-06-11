export type Role = 'TOP' | 'JG' | 'MID' | 'ADC' | 'SUP';

export interface Champion {
  id: string;
  nameJa: string;
  nameEn: string;
  roles: Role[];
}

export type Tier = 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C' | 'D';

export interface CounterEntry {
  championId: string;
  nameJa: string;
  winRate: number;
  sourceCount: number;
  sampleCount?: number;
  tier?: Tier;
}

export interface CounterResult {
  targetChampionId: string;
  targetNameJa: string;
  role: Role;
  patch: string;
  counters: CounterEntry[];
  fetchedAt: number;
}
