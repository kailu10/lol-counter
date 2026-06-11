const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lolalytics テスト
async function testLolalytics() {
  const res = await fetch('https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus', { headers: HEADERS });
  const html = await res.text();
  const seen = new Set();
  const results = [];
  const pattern = /wins against <!--t=\w+-->([\w\s'.]+?)<!---->.*?<span class="text-green-\d+">([\d.]+)%<\/span> of the time/gs;
  for (const m of html.matchAll(pattern)) {
    const champName = m[1].trim().replace(/\s+/g, ' ');
    const targetWinRate = parseFloat(m[2]);
    const counterWinRate = Math.round((100 - targetWinRate) * 10) / 10;
    if (isNaN(counterWinRate) || seen.has(champName)) continue;
    seen.add(champName);
    const champId = champName.replace(/['\s.]/g, '');
    results.push({ championId: champId, winRate: counterWinRate });
  }
  console.log('=== lolalytics (top 10) ===');
  results.slice(0, 10).forEach((r, i) => console.log(`${i+1}. ${r.championId}: ${r.winRate}%`));
  return results;
}

// op.gg テスト
async function testOpgg() {
  const res = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
  const html = await res.text();
  const seen = new Set();
  const results = [];
  const pattern = /alt="([A-Za-z']+)"[^>]*\/?><span[^>]*>[^<]+<\/span><\/div>.*?text-main-\d+[^>]*>([\d.]+)<!-- -->%/gs;
  for (const m of html.matchAll(pattern)) {
    const champId = m[1].trim();
    const winRate = parseFloat(m[2]);
    if (champId === 'Darius' || isNaN(winRate) || seen.has(champId)) continue;
    if (winRate < 45 || winRate > 75) continue;
    seen.add(champId);
    results.push({ championId: champId, winRate });
  }
  console.log('\n=== op.gg (top 10) ===');
  results.slice(0, 10).forEach((r, i) => console.log(`${i+1}. ${r.championId}: ${r.winRate}%`));
  return results;
}

await testLolalytics();
await testOpgg();
