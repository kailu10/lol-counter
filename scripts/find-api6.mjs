const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lol.ps SvelteKit manifest を見つける
const hash = '9a5c66224ecb93b16ee1664bca3c3fa90d3e0241';
const base = `https://cdn.lol.ps/static/prod/${hash}/_app/immutable`;
const manifestUrls = [
  `${base}/entry/start.js`,
  `${base}/nodes/0.js`,
  `${base}/nodes/2.js`,
  `https://cdn.lol.ps/static/prod/${hash}/_app/immutable/chunks/0.js`,
  `https://lol.ps/_app/immutable/manifest.json`,
  `https://lol.ps/sitemap.xml`,
];
for (const url of manifestUrls) {
  try {
    const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    const t = await r.text();
    console.log(`[${r.status}] ${url} (${t.length} chars)`);
    if (r.status === 200 && t.length < 5000) {
      const apiHints = t.match(/\/(?:api|champion)[^"' ]{0,80}/g) || [];
      console.log('  hints:', Array.from(new Set(apiHints)).slice(0, 10));
    } else if (r.status === 200) {
      // champion URLパターンを探す
      const patterns = t.match(/champion[^"' \\]{0,50}/g) || [];
      console.log('  champion patterns:', Array.from(new Set(patterns)).slice(0, 10));
    }
  } catch(e) {
    console.log(`[ERR] ${url}: ${e.message}`);
  }
}

// op.gg: c-lol-web.op.gg に直接アクセス
console.log('\n=== op.gg c-lol-web API ===');
const opggEndpoints = [
  'https://c-lol-web.op.gg/api/v1.0/champions/darius/counters?position=top&tier=emerald',
  'https://c-lol-web.op.gg/api/v1.0/champions/darius/counters?position=top&tier=emerald&lang=ja_JP',
];
for (const url of opggEndpoints) {
  try {
    const r = await fetch(url, {
      headers: { ...HEADERS, 'Referer': 'https://www.op.gg/', 'Origin': 'https://www.op.gg' },
      signal: AbortSignal.timeout(5000)
    });
    const t = await r.text();
    console.log(`[${r.status}] ${url}`);
    if (r.status === 200) console.log('  preview:', t.slice(0, 300));
  } catch(e) {
    console.log(`[ERR] ${e.message}`);
  }
}
