'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Champion, Role } from '@/types';

const ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];
const ROLE_LABELS: Record<Role, string> = { TOP: 'TOP', JG: 'JG', MID: 'MID', ADC: 'ADC', SUP: 'SUP' };

function ChampionIcon({ championId, patch, size = 44 }: { championId: string; patch: string; size?: number }) {
  const src = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championId}.png`;
  return (
    <div
      className="rounded-full border-2 overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, borderColor: 'var(--border)', background: 'linear-gradient(135deg,#1a2234,#2d3a50)' }}
    >
      <img src={src} alt={championId} width={size + 8} height={size + 8} style={{ margin: -4, width: size + 8, height: size + 8, objectFit: 'cover' }} />
    </div>
  );
}

export default function ChampionSearch({ initialChampionId, initialRole }: { initialChampionId?: string; initialRole?: Role }) {
  const router = useRouter();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patch, setPatch] = useState('15.1.1');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role>(initialRole ?? 'TOP');
  const [showList, setShowList] = useState(false);
  const [selected, setSelected] = useState<Champion | null>(null);

  useEffect(() => {
    fetch('/api/champions')
      .then((r) => r.json())
      .then((data: Champion[]) => {
        setChampions(data);
        if (initialChampionId) {
          const found = data.find((c) => c.id.toLowerCase() === initialChampionId.toLowerCase());
          if (found) { setSelected(found); setQuery(found.nameJa); }
        }
      });
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then((r) => r.json())
      .then((v: string[]) => setPatch(v[0]));
  }, [initialChampionId]);

  const filteredByRole = role
    ? champions.filter((c) => c.roles.includes(role))
    : champions;

  const suggestions = query.length > 0
    ? filteredByRole.filter((c) =>
        c.nameJa.includes(query) ||
        c.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        c.id.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSelect = useCallback((c: Champion) => {
    setSelected(c);
    setQuery(c.nameJa);
    setShowList(false);
  }, []);

  const handleSearch = () => {
    if (!selected) return;
    router.push(`/counter/${selected.id}/${role}`);
  };

  return (
    <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid var(--gold)' }}>
      <h2 className="text-xs font-bold tracking-widest mb-4 uppercase" style={{ color: 'var(--gold)' }}>
        チャンピオン検索
      </h2>

      {/* テキスト入力 */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            onFocus={() => setShowList(false)}
            placeholder="チャンピオン名を入力（日本語・英語）"
            className="flex-1 rounded-md px-4 py-2.5 text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: '#E5E7EB' }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={!selected}
            className="px-5 py-2.5 rounded-md text-sm font-bold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-light))' }}
          >
            検索
          </button>
        </div>

        {/* オートコンプリート */}
        {suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 top-full mt-1 rounded-md shadow-lg overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {suggestions.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors hover:opacity-80"
                style={{ background: 'transparent', borderBottom: '1px solid var(--border)' }}
              >
                <ChampionIcon championId={c.id} patch={patch} size={32} />
                <span>{c.nameJa}</span>
                <span className="ml-auto text-xs" style={{ color: '#9CA3AF' }}>{c.nameEn}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ロール選択 */}
      <div className="mb-4">
        <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>ロール</p>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="px-4 py-1.5 rounded-md text-sm font-bold tracking-wide transition-all"
              style={role === r
                ? { background: 'linear-gradient(135deg, var(--purple), var(--purple-light))', color: 'white', border: '1px solid transparent' }
                : { background: 'var(--bg-input)', color: '#9CA3AF', border: '1px solid var(--border)' }
              }
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* 一覧から選ぶ */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowList((v) => !v)}
          className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-75"
          style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {showList ? '▲' : '▼'} 一覧から選ぶ
        </button>

        {showList && (
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))' }}>
            {filteredByRole.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                className="flex flex-col items-center gap-1 p-1.5 rounded-md transition-all"
                style={selected?.id === c.id
                  ? { background: 'rgba(79,70,229,0.15)', border: '1px solid var(--purple)' }
                  : { background: 'transparent', border: '1px solid transparent' }
                }
                title={c.nameJa}
              >
                <ChampionIcon championId={c.id} patch={patch} size={44} />
                <span className="text-center leading-tight" style={{ fontSize: '0.6rem', color: '#9CA3AF', wordBreak: 'keep-all' }}>
                  {c.nameJa}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
