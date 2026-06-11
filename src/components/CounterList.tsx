'use client';
import type { CounterResult, Tier } from '@/types';

function confidenceStars(count: number) {
  return '★'.repeat(count) + '☆'.repeat(3 - count);
}

function difficultyStyle(d: string | null) {
  if (d === '易しい') return { background: 'rgba(16,185,129,0.15)', color: 'var(--green)' };
  if (d === '難しい') return { background: 'rgba(239,68,68,0.15)', color: 'var(--red)' };
  return { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' };
}

const TIER_COLOR: Record<Tier, { bg: string; color: string }> = {
  'S+': { bg: 'rgba(255,215,0,0.2)',   color: '#FFD700' },
  'S':  { bg: 'rgba(255,165,0,0.2)',   color: '#FFA500' },
  'A+': { bg: 'rgba(99,255,132,0.15)', color: '#63FF84' },
  'A':  { bg: 'rgba(34,197,94,0.15)',  color: 'var(--green)' },
  'B+': { bg: 'rgba(96,165,250,0.15)', color: '#60A5FA' },
  'B':  { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  'C':  { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' },
  'D':  { bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
};

function patchNotesUrl(patch: string): string {
  const parts = patch.split('.');
  if (parts.length < 2) return 'https://www.leagueoflegends.com/en-us/news/game-updates/';
  return `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${parts[0]}-${parts[1]}-notes/`;
}

function formatSample(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function CounterList({ result, patch }: { result: CounterResult; patch: string }) {
  const BASE = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion`;

  return (
    <div className="rounded-lg p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid var(--purple)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">
          <span style={{ color: 'var(--gold)' }}>{result.targetNameJa}</span>
          <span className="text-sm font-normal ml-1" style={{ color: '#9CA3AF' }}>（{result.role}）のカウンター</span>
        </h2>
        <span className="text-xs px-2 py-1 rounded" style={{ color: '#9CA3AF', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
          複数サイト集計
        </span>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--green)' }} />
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            エメラルド以下
          </span>
        </div>
        <a
          href={patchNotesUrl(result.patch)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:underline"
          style={{ color: 'var(--gold)' }}
        >
          パッチ {result.patch} ↗
        </a>
      </div>

      <div className="flex flex-col gap-2">
        {result.counters.map((c, i) => (
          <div
            key={c.championId}
            className="counter-row rounded-md px-3 py-2"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
          >
            {/* 上段: 順位・アイコン・名前・ティア・勝率 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold w-5 text-center shrink-0" style={{ color: i < 3 ? 'var(--gold)' : '#9CA3AF' }}>
                {i + 1}
              </span>

              <div
                className="rounded-full border-2 overflow-hidden shrink-0"
                style={{ width: 36, height: 36, borderColor: 'var(--border)', background: 'linear-gradient(135deg,#1f2d45,#2d3a50)' }}
              >
                <img
                  src={`${BASE}/${c.championId}.png`}
                  alt={c.nameJa}
                  width={44}
                  height={44}
                  style={{ margin: -4, width: 44, height: 44, objectFit: 'cover' }}
                />
              </div>

              <span className="text-sm font-semibold flex-1 truncate">{c.nameJa}</span>

              {/* ティア */}
              {c.tier && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ ...TIER_COLOR[c.tier], fontSize: '0.7rem' }}
                >
                  {c.tier}
                </span>
              )}

              {/* 勝率 */}
              <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--green)' }}>
                {c.winRate.toFixed(1)}%
              </span>
            </div>

            {/* 下段: 難易度・サンプル数・信頼度 */}
            <div className="flex items-center gap-2 mt-1 ml-[52px]">
              {c.difficulty && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={difficultyStyle(c.difficulty)}
                >
                  {c.difficulty}
                </span>
              )}
              {c.sampleCount && c.sampleCount > 0 && (
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  n={formatSample(c.sampleCount)}
                </span>
              )}
              <span className="text-xs ml-auto" style={{ color: 'var(--gold)' }}>
                {confidenceStars(c.sourceCount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs" style={{ color: '#6B7280' }}>
        ★の数はデータ取得サイト数（最大2）。多いほど信頼性が高いです。
      </div>
    </div>
  );
}
