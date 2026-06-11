const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://lolalytics.com/lol/tierlist/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// tier と champ の近接パターンを探す
// tier直後or直前にchamp名
const pattern = /<!--t=\w+-->([SABCD][+]?)<!---->[^<]*<[^>]+>[^<]*<[^>]+>[^<]*<[^>]+>.*?<!--t=\w+-->([\w\s'.]+)<!---->/gs;
const matches = [...html.matchAll(pattern)];
console.log('Tier+Champ pairs:', matches.slice(0, 10).map(m => `${m[2].trim()}: ${m[1]}`));

// 全てのQwikテンプレート値を順番に取得
const all = [...html.matchAll(/<!--t=\w+-->(.*?)<!---->/gs)];
console.log('\nAll Qwik values (first 40):');
all.slice(0, 40).forEach((m, i) => console.log(`${i}: "${m[1].trim()}"`));
