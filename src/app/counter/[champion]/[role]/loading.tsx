import Header from '@/components/Header';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2.5" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
      <div className="skeleton rounded" style={{ width: 20, height: 16 }} />
      <div className="skeleton rounded-full" style={{ width: 36, height: 36 }} />
      <div className="skeleton rounded flex-1" style={{ height: 14, maxWidth: 120 }} />
      <div className="skeleton rounded" style={{ width: 40, height: 14 }} />
      <div className="skeleton rounded" style={{ width: 28, height: 18 }} />
      <div className="skeleton rounded" style={{ width: 42, height: 12 }} />
    </div>
  );
}

export default function CounterLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {/* Search box skeleton */}
        <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid var(--gold)' }}>
          <div className="skeleton rounded mb-4" style={{ width: 96, height: 12 }} />
          <div className="flex gap-2 mb-4">
            <div className="skeleton rounded-md flex-1" style={{ height: 42 }} />
            <div className="skeleton rounded-md" style={{ width: 72, height: 42 }} />
          </div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton rounded-md" style={{ width: 52, height: 32 }} />
            ))}
          </div>
        </div>

        {/* Counter list skeleton */}
        <div className="rounded-lg p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid var(--purple)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton rounded" style={{ width: 180, height: 18 }} />
            <div className="skeleton rounded" style={{ width: 72, height: 22 }} />
          </div>
          <div className="flex items-center justify-between mb-5">
            <div className="skeleton rounded" style={{ width: 100, height: 12 }} />
            <div className="skeleton rounded" style={{ width: 110, height: 12 }} />
          </div>
          <div className="flex flex-col gap-2">
            {[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </main>
    </div>
  );
}
