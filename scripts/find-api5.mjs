const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lol.ps: クエリパラメータなしで試す
console.log('=== lol.ps URL pattern test ===');
const lolpsUrls = [
  'https://lol.ps/champion/darius/counter',
  'https://lol.ps/champion/darius',
  'https://lol.ps/champion',
];
for (const url of lolpsUrls) {
  const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
  const t = await r.text();
  console.log(`[${r.status}] ${url} (${t.length} chars)`);
  if (r.status === 200) {
    // APIコールパターンを探す
    const fetches = t.match(/["'](\/[^"']+api[^"']{0,80})["']/g) || [];
    console.log('  API hints:', fetches.slice(0, 5));
  }
}

// op.gg: Referer付きでAPIを試す
console.log('\n=== op.gg API with proper headers ===');
const opggHeaders = {
  ...HEADERS,
  'Referer': 'https://www.op.gg/',
  'Origin': 'https://www.op.gg',
  'Accept': 'application/json',
};
const opggApis = [
  'https://lol-web-api.op.gg/api/v1.0/champions/darius/counters?position=top&tier=emerald',
  'https://op.gg/_next/data/abcdef/en_US/champions/darius/counters.json?position=top&tier=emerald',
];
for (const url of opggApis) {
  try {
    const r = await fetch(url, { headers: opggHeaders, signal: AbortSignal.timeout(5000) });
    const t = await r.text();
    console.log(`[${r.status}] ${url}`);
    if (r.status === 200) console.log('  preview:', t.slice(0, 200));
  } catch(e) {
    console.log(`[ERR] ${e.message}`);
  }
}

// lolalytics: 正しいパースパターンを確認
console.log('\n=== lolalytics parse verification ===');
const res = await fetch('https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// パターン: wins against <!--t=XX-->ChampionName<!----> <span ...>XX.XX%</span>
const matches = [...html.matchAll(/wins against <!--t=\w+-->([\w\s'\.]+?)<!---->.*?<span[^>]*>([\d.]+)%<\/span>/g)];
console.log(`Found ${matches.length} counter entries:`);
matches.slice(0, 15).forEach(m => {
  const championName = m[1].trim();
  const dariusWinRate = parseFloat(m[2]);
  const counterWinRate = (100 - dariusWinRate).toFixed(1);
  console.log(`  ${championName}: counter win rate = ${counterWinRate}%`);
});
