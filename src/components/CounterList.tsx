'use client';
import { useState, useCallback } from 'react';
import type { CounterResult } from '@/types';

function patchNotesUrl(_patch: string): string {
  return 'https://www.leagueoflegends.com/ja-jp/news/tags/patch-notes/';
}

function formatSample(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function CounterList({ result, patch }: { result: CounterResult; patch: string }) {
  const BASE = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion`;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRowClick = useCallback(async (championId: string) => {
    if (expandedId === championId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(championId);
    if (explanations[championId]) return;

    setLoadingId(championId);
    try {
      const res = await fetch(
        `/api/explain?target=${result.targetChampionId}&counter=${championId}&role=${result.role}`
      );
      const data = await res.json();
      const text = data.explanation ?? data.error ?? '解説を取得できませんでした。';
      setExplanations((prev) => ({ ...prev, [championId]: text }));
    } catch {
      setExplanations((prev) => ({ ...prev, [championId]: '解説を取得できませんでした。時間をおいて再試行してください。' }));
    } finally {
      setLoadingId(null);
    }
  }, [expandedId, explanations, result.targetChampionId, result.role]);

  return (
    <div className="rounded-lg p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid var(--purple)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">
          <span style={{ color: 'var(--gold)' }}>{result.targetNameJa}</span>
          <span className="text-sm font-normal ml-1" style={{ color: '#9CA3AF' }}>（{result.role}）のカウンター</span>
        </h2>
        <span className="text-xs px-2 py-1 rounded" style={{ color: '#9CA3AF', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
          lolalytics
        </span>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--green)' }} />
          <span className="text-xs" style={{ color: '#9CA3AF' }}>エメラルド以下</span>
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
        {result.counters.map((c, i) => {
          const isExpanded = expandedId === c.championId;
          const isLoading = loadingId === c.championId;
          const explanation = explanations[c.championId];

          return (
            <div key={c.championId}>
              <button
                onClick={() => handleRowClick(c.championId)}
                className="counter-row w-full rounded-md px-3 py-2 text-left"
                style={{
                  background: isExpanded ? 'rgba(79,70,229,0.08)' : 'var(--bg-input)',
                  border: `1px solid ${isExpanded ? 'rgba(79,70,229,0.4)' : 'var(--border)'}`,
                }}
              >
                {/* 上段: 順位・アイコン・名前・ティア・勝率・信頼度 */}
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

                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--green)' }}>
                    {c.winRate.toFixed(1)}%
                  </span>

                  <span className="text-xs shrink-0" style={{ color: isExpanded ? 'var(--purple-light)' : '#4B5563' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {/* 下段: サンプル数 */}
                {c.sampleCount && c.sampleCount > 0 && (
                  <div className="ml-[52px] mt-0.5">
                    <span className="text-xs" style={{ color: '#6B7280' }}>
                      {formatSample(c.sampleCount)}試合
                    </span>
                  </div>
                )}
              </button>

              {/* 展開: 解説 */}
              {isExpanded && (
                <div
                  className="px-4 py-3 rounded-b-md"
                  style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.25)', borderTop: 'none', marginTop: -1 }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="spinner" style={{ borderColor: 'rgba(79,70,229,0.3)', borderTopColor: 'var(--purple-light)' }} />
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>解説を生成中...</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
                      {explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs" style={{ color: '#6B7280' }}>
        データ出典: lolalytics（エメラルド以上）。行をクリックすると解説を表示します。
      </div>
    </div>
  );
}
