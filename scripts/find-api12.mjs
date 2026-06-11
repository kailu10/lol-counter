const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// 勝率 57.38% の前後500文字を見てチャンピオン名を探す
const targetRate = '57.38%';
let idx = html.indexOf(targetRate);
while (idx !== -1) {
  const ctx = html.slice(Math.max(0, idx - 500), idx + 200);
  console.log(`=== Context around ${targetRate} ===`);
  console.log(ctx.replace(/\s+/g, ' ').slice(0, 600));
  console.log();
  idx = html.indexOf(targetRate, idx + 1);
  if (idx > html.indexOf(targetRate) + 10000) break;
}

// 最初の数字周辺を詳しく見る
console.log('\n=== First 3 win rates in context ===');
const rates = ['48.44%', '57.38%', '58.55%'];
for (const rate of rates) {
  const pos = html.indexOf(rate);
  if (pos !== -1) {
    const ctx = html.slice(Math.max(0, pos - 200), pos + 100);
    console.log(`\n${rate} @ pos ${pos}:`);
    console.log(ctx.replace(/\s+/g, ' '));
  }
}
