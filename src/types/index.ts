export type Role = 'TOP' | 'JG' | 'MID' | 'ADC' | 'SUP';

export interface Champion {
  id: string;
  nameJa: string;
  nameEn: string;
  roles: Role[];
}

export interface CounterEntry {
  championId: string;
  nameJa: string;
  winRate: number;
  sampleCount?: number;
}

export interface CounterResult {
  targetChampionId: string;
  targetNameJa: string;
  role: Role;
  patch: string;
  counters: CounterEntry[];
  fetchedAt: number;
}
