const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();
console.log('op.gg HTML length:', html.length);

// 勝率パターンを探す
const winRates = html.match(/\d{2}\.\d{1,2}%/g) || [];
console.log('Win rate patterns:', winRates.slice(0, 20));

// script[type=application/json] などのデータ埋め込みを探す
const dataScripts = html.match(/<script[^>]+type="application\/json"[^>]*>([\s\S]{1,500})/g) || [];
console.log('\nData scripts:', dataScripts.slice(0, 3));

// Next.jsのserver data
const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/);
if (nextData) {
  console.log('\n__NEXT_DATA__:', nextData[1].slice(0, 1000));
} else {
  console.log('\nNo __NEXT_DATA__');
}

// RSC payload (Next.js App Router)
const rscData = html.match(/\["[^"]+","[A-Za-z]"[^\n]+/g) || [];
console.log('\nRSC-like data:', rscData.slice(0, 5));

// inline JSON with champion data
const champMentions = [];
let idx = 0;
while ((idx = html.indexOf('champion', idx)) !== -1) {
  const ctx = html.slice(Math.max(0, idx - 20), idx + 100);
  if (ctx.match(/[%\d]/)) champMentions.push(ctx.replace(/\s+/g, ' ').slice(0, 120));
  idx += 8;
}
console.log('\nChampion mentions with numbers (first 10):');
champMentions.slice(0, 10).forEach(m => console.log(' ', m));
