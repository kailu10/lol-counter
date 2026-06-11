'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Champion, Role } from '@/types';

const ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];
const FAV_KEY = 'lol-favorites';

function normalizeId(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  const [champions, setChampions] = useState<Champion[]>([]);
  const [patch, setPatch] = useState('15.1.1');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role>(initialRole ?? 'TOP');
  const [showList, setShowList] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<Champion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [rolePickRates, setRolePickRates] = useState<Record<string, { pickRate: number }>>({});

  // 初期データ取得
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

  // favoritesをlocalStorageから復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAV_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  }, []);

  // ロール変更時にピック率データ取得（使用率順ソート用）
  useEffect(() => {
    fetch(`/api/tierlist?role=${role}`)
      .then((r) => r.json())
      .then((data: Record<string, { pickRate: number }>) => setRolePickRates(data))
      .catch(() => {});
  }, [role]);

  // 外クリックでサジェスト閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestRef.current && !suggestRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const filteredByRole = role ? champions.filter((c) => c.roles.includes(role)) : champions;

  // ピック率降順ソート（データなしは末尾）
  const sortedChampions = [...filteredByRole].sort((a, b) => {
    const pa = rolePickRates[normalizeId(a.id)]?.pickRate ?? -1;
    const pb = rolePickRates[normalizeId(b.id)]?.pickRate ?? -1;
    if (pa !== pb) return pb - pa;
    return a.nameJa.localeCompare(b.nameJa, 'ja');
  });

  const favoriteChampions = sortedChampions.filter((c) => favorites.includes(c.id));

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
    setShowSuggestions(false);
    inputRef.current?.blur();
  }, []);

  const handleSearch = () => {
    if (!selected || isSearching) return;
    setIsSearching(true);
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
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); setShowSuggestions(true); }}
              onFocus={() => { if (query.length > 0) setShowSuggestions(true); }}
              placeholder="チャンピオン名を入力（日本語・英語）"
              className="w-full rounded-md px-4 py-2.5 text-sm"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: '#E5E7EB', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); if (e.key === 'Escape') setShowSuggestions(false); }}
            />
            {/* サジェスト */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestRef}
                className="absolute z-30 left-0 right-0 top-full mt-1 rounded-md overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(c); }}
                    className="autocomplete-item w-full flex items-center gap-3 px-4 py-2 text-sm text-left"
                    style={{ background: 'transparent', borderBottom: '1px solid var(--border)', color: '#E5E7EB' }}
                  >
                    <ChampionIcon championId={c.id} patch={patch} size={32} />
                    <span className="font-medium">{c.nameJa}</span>
                    <span className="ml-auto text-xs" style={{ color: '#6B7280' }}>{c.nameEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!selected || isSearching}
            className="btn-search px-5 py-2.5 rounded-md text-sm font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-light))', minWidth: 72 }}
          >
            {isSearching ? <span className="spinner" /> : '検索'}
          </button>
        </div>
      </div>

      {/* ロール選択 */}
      <div className="mb-4">
        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>ロール</p>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`role-tab px-4 py-1.5 rounded-md text-sm font-bold tracking-wide ${role === r ? 'active' : ''}`}
              style={role === r
                ? { background: 'linear-gradient(135deg, var(--purple), var(--purple-light))', color: 'white', border: '1px solid transparent' }
                : { background: 'var(--bg-input)', color: '#9CA3AF', border: '1px solid var(--border)' }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 一覧から選ぶ */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowList((v) => !v)}
          className="text-sm flex items-center gap-1.5 w-full"
          style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <span style={{ fontSize: '0.65rem' }}>{showList ? '▲' : '▼'}</span>
          <span>一覧から選ぶ</span>
          <span className="ml-auto text-xs" style={{ color: '#6B7280' }}>
            ピック率順
          </span>
        </button>

        {showList && (
          <div className="mt-3">
            {/* お気に入りセクション */}
            {favoriteChampions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs mb-2 font-bold" style={{ color: 'var(--gold)' }}>
                  ★ お気に入り
                </p>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))' }}>
                  {favoriteChampions.map((c) => (
                    <ChampionGridItem
                      key={c.id}
                      champion={c}
                      patch={patch}
                      isSelected={selected?.id === c.id}
                      isFavorite={true}
                      onSelect={handleSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
                <div className="mt-3" style={{ borderTop: '1px solid var(--border)' }} />
              </div>
            )}

            {/* 全チャンピオングリッド */}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))' }}>
              {sortedChampions.map((c) => (
                <ChampionGridItem
                  key={c.id}
                  champion={c}
                  patch={patch}
                  isSelected={selected?.id === c.id}
                  isFavorite={favorites.includes(c.id)}
                  onSelect={handleSelect}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChampionGridItem({
  champion, patch, isSelected, isFavorite, onSelect, onToggleFavorite,
}: {
  champion: Champion;
  patch: string;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (c: Champion) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={() => onSelect(champion)}
      className={`champ-item flex flex-col items-center gap-1 p-1.5 rounded-md ${isSelected ? 'selected' : ''}`}
      style={{
        background: isSelected ? 'rgba(79,70,229,0.12)' : 'transparent',
        border: `1px solid ${isSelected ? 'var(--purple)' : 'transparent'}`,
      }}
      title={champion.nameJa}
    >
      <div className="relative">
        <ChampionIcon championId={champion.id} patch={patch} size={42} />
        {/* お気に入りボタン */}
        <button
          onClick={(e) => onToggleFavorite(champion.id, e)}
          className="btn-fav absolute -top-1 -left-1 flex items-center justify-center rounded-full"
          style={{ width: 18, height: 18, background: isFavorite ? 'rgba(200,155,60,0.9)' : 'rgba(0,0,0,0.7)', border: `1px solid ${isFavorite ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}`, fontSize: '0.6rem', lineHeight: 1 }}
          title={isFavorite ? 'お気に入り解除' : 'お気に入り追加'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
      <span
        className="text-center leading-tight w-full overflow-hidden"
        style={{ fontSize: '0.6rem', color: '#9CA3AF', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
      >
        {champion.nameJa}
      </span>
    </button>
  );
}
