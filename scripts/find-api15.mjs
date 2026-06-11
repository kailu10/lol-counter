const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// Malphite〜Sett間（短いリスト形式）を確認
const malphPos = html.indexOf('/champion/Malphite.png');
const settPos = html.indexOf('/champion/Sett.png');
const between = html.slice(malphPos, settPos + 200);
console.log('Malphite→Sett section:');
console.log(between.replace(/\s+/g, ' '));

// 全チャンピオン+勝率を抽出
// alt="[ChampionName]" の後に来る勝率を探す
console.log('\n=== Alt-based champion+win rate extraction ===');
const altPattern = /alt="([A-Za-z']+)"[^>]*>.*?(\d{2}\.\d{1,2})%/gs;
const entries = new Map();
let m;
while ((m = altPattern.exec(html)) !== null) {
  const champ = m[1];
  const rate = parseFloat(m[2]);
  if (champ !== 'Darius' && rate >= 45 && rate <= 70) {
    if (!entries.has(champ)) entries.set(champ, rate);
  }
}
console.log('Extracted counters:');
const sorted = [...entries.entries()].sort((a, b) => b[1] - a[1]);
sorted.slice(0, 15).forEach(([c, r]) => console.log(`  ${c}: ${r}%`));
