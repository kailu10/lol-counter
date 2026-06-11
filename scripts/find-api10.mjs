const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// SvelteKitのroute group /(lolps)/stats/(non-summoner)/counter → /stats/counter
const urlsToTry = [
  'https://lol.ps/stats/counter?champion=darius&lane=top&tier=6',
  'https://lol.ps/stats/counter?champion=Darius&lane=top&tier=6',
  'https://lol.ps/stats/counter?champ=darius&lane=top',
  'https://lol.ps/stats/counter',
  'https://lol.ps/stats/counter/__data.json?champion=darius&lane=top&tier=6',
  'https://lol.ps/stats/counter?__data.json&champion=darius&lane=top',
];

for (const url of urlsToTry) {
  try {
    const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    const t = await r.text();
    console.log(`[${r.status}] ${url} (${t.length} chars)`);
    if (r.status === 200) {
      console.log('  Content-Type:', r.headers.get('content-type'));
      console.log('  Preview:', t.slice(0, 400));
    }
  } catch(e) {
    console.log(`[ERR] ${url.slice(0, 70)}: ${e.message.slice(0, 50)}`);
  }
}

// start.js も確認
const hash = '9a5c66224ecb93b16ee1664bca3c3fa90d3e0241';
const startJs = await fetch(`https://cdn.lol.ps/static/prod/${hash}/_app/immutable/entry/start.Dfv8UVKn.js`, { headers: HEADERS });
const startJsText = await startJs.text();
console.log('\nstart.js length:', startJsText.length);
const apiPaths = startJsText.match(/["'`](\/[^"'`\s]{3,80})["'`]/g) || [];
const champRelated = apiPaths.filter(p => p.match(/champion|counter|stat|matchup|tier/i));
console.log('Champion-related paths in start.js:', Array.from(new Set(champRelated)).slice(0, 20));
