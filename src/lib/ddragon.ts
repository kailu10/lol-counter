import type { Champion, Role } from '@/types';

const BASE = 'https://ddragon.leagueoflegends.com';

const ROLE_MAP: Record<string, Role[]> = {
  Fighter: ['TOP', 'JG'],
  Tank: ['TOP', 'SUP'],
  Mage: ['MID', 'SUP'],
  Assassin: ['MID', 'JG'],
  Marksman: ['ADC'],
  Support: ['SUP'],
};

export async function getLatestPatch(): Promise<string> {
  const res = await fetch(`${BASE}/api/versions.json`, { next: { revalidate: 3600 } });
  const versions: string[] = await res.json();
  return versions[0];
}

export async function getAllChampions(): Promise<Champion[]> {
  const patch = await getLatestPatch();
  const res = await fetch(`${BASE}/cdn/${patch}/data/ja_JP/champion.json`, {
    next: { revalidate: 3600 },
  });
  const data = await res.json();

  return Object.values(data.data as Record<string, {
    id: string;
    name: string;
    tags: string[];
  }>).map((c) => {
    const roles = Array.from(
      new Set(c.tags.flatMap((tag) => ROLE_MAP[tag] ?? []))
    ) as Role[];
    return {
      id: c.id,
      nameJa: c.name,
      nameEn: c.id,
      roles: roles.length > 0 ? roles : ['TOP', 'JG', 'MID', 'ADC', 'SUP'],
    };
  });
}

export function championImageUrl(patch: string, championId: string): string {
  return `${BASE}/cdn/${patch}/img/champion/${championId}.png`;
}
