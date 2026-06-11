'use client';
import type { CounterResult } from '@/types';

function confidenceStars(count: number) {
  return '★'.repeat(count) + '☆'.repeat(3 - count);
}

function difficultyStyle(d: string | null) {
  if (d === '易しい') return { background: 'rgba(16,185,129,0.15)', color: 'var(--green)' };
  if (d === '難しい') return { background: 'rgba(239,68,68,0.15)', color: 'var(--red)' };
  return { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' };
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
          3サイト集計
        </span>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--green)' }} />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>
          エメラルド以下 ・ パッチ {result.patch}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {result.counters.map((c, i) => (
          <div
            key={c.championId}
            className="grid items-center gap-3 rounded-md px-4 py-2.5 transition-colors"
            style={{
              gridTemplateColumns: '28px 40px 1fr auto auto auto',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
            }}
          >
            {/* 順位 */}
            <span className="text-sm font-bold text-center" style={{ color: i < 3 ? 'var(--gold)' : '#9CA3AF' }}>
              {i + 1}
            </span>

            {/* アイコン */}
            <div
              className="rounded-full border-2 overflow-hidden"
              style={{ width: 40, height: 40, borderColor: 'var(--border)', background: 'linear-gradient(135deg,#1f2d45,#2d3a50)', flexShrink: 0 }}
            >
              <img
                src={`${BASE}/${c.championId}.png`}
                alt={c.nameJa}
                width={48}
                height={48}
                style={{ margin: -4, width: 48, height: 48, objectFit: 'cover' }}
              />
            </div>

            {/* 名前 */}
            <span className="text-sm font-semibold truncate">{c.nameJa}</span>

            {/* 勝率 */}
            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--green)', minWidth: 56, textAlign: 'right' }}>
              {c.winRate.toFixed(1)}%
            </span>

            {/* 難易度 */}
            <span
              className="text-xs font-bold px-2 py-0.5 rounded hidden sm:block"
              style={{ ...difficultyStyle(c.difficulty), minWidth: 52, textAlign: 'center' }}
            >
              {c.difficulty ?? '-'}
            </span>

            {/* 信頼度 */}
            <span className="text-sm hidden sm:block" style={{ color: 'var(--gold)', minWidth: 44, textAlign: 'right' }}>
              {confidenceStars(c.sourceCount)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs" style={{ color: '#6B7280' }}>
        ★の数はデータ取得サイト数（最大3）。多いほど信頼性が高いです。
      </div>
    </div>
  );
}
