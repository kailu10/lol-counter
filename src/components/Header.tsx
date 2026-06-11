'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header
      className="border-b flex items-center gap-3 px-6 py-4"
      style={{
        borderColor: 'var(--border)',
        background: 'linear-gradient(180deg, #0d1220 0%, var(--bg-primary) 100%)',
      }}
    >
      <span className="text-xl">⚔️</span>
      <Link href="/" className="text-xl font-bold tracking-wide" style={{ color: 'var(--gold)', textShadow: '0 0 20px rgba(200,155,60,0.4)' }}>
        LoL カウンターピック
      </Link>
      <span
        className="text-xs ml-1 pl-3 border-l"
        style={{ color: '#9CA3AF', borderColor: 'var(--border)' }}
      >
        エメラルド以下対応
      </span>
    </header>
  );
}
