const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const hash = '9a5c66224ecb93b16ee1664bca3c3fa90d3e0241';

// lol.ps app.js バンドルを読んでAPIを探す
const appJsUrl = `https://cdn.lol.ps/static/prod/${hash}/_app/immutable/entry/app.BQ7rle7M.js`;
const r = await fetch(appJsUrl, { headers: HEADERS });
const js = await r.text();
console.log('app.js status:', r.status, 'length:', js.length);

// APIパターンを探す
const apiPaths = js.match(/["'`](\/api\/[^"'`\s]{0,100})["'`]/g) || [];
console.log('API paths found:', Array.from(new Set(apiPaths)).slice(0, 20));

// champion関連
const champPaths = js.match(/["'`][^"'`]*champion[^"'`]{0,80}["'`]/g) || [];
console.log('\nChampion paths:', Array.from(new Set(champPaths)).slice(0, 20));

// ps-analytics.org への参照
const psAnalytics = js.match(/ps-analytics[^"'`\s]{0,100}/g) || [];
console.log('\nps-analytics refs:', Array.from(new Set(psAnalytics)).slice(0, 10));

// fetch/axios への参照
const fetchCalls = js.match(/fetch\(["'`]([^"'`]+)["'`]/g) || [];
console.log('\nFetch calls:', fetchCalls.slice(0, 10));

// counterに関連するURL
const counterRefs = js.match(/['"` ][^"'`]*counter[^"'`\s]{0,60}/g) || [];
console.log('\nCounter refs:', Array.from(new Set(counterRefs)).slice(0, 15));

// lol.ps APIエンドポイント候補を直接試す
console.log('\n=== Direct API probes ===');
const apiCandidates = [
  'https://api.lol.ps/api/lol/champion/darius/counter?lane=top&tier=6',
  'https://api.lol.ps/lol/champion/darius/counter?lane=top',
  'https://cf-cdn.ps-analytics.org/api/champion/darius/counter?lane=top',
  'https://lol.ps/api/champion/darius/counter?lane=top',
  'https://lol.ps/api/lol/matchup?champion=darius&lane=top&tier=6',
];
for (const url of apiCandidates) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    const t = await res.text();
    console.log(`[${res.status}] ${url} (${t.length})`);
    if (res.status === 200 && t.length < 500) console.log(' ', t.slice(0, 200));
  } catch(e) {
    console.log(`[ERR] ${url.slice(0,60)}: ${e.message.slice(0,50)}`);
  }
}
