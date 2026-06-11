const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// Garen が op.gg HTML の中でどんな文脈に出てくるか確認
const garenPos = html.indexOf('/champion/Garen.png');
console.log('Garen img pos:', garenPos);
if (garenPos !== -1) {
  console.log('Context [-300, +400]:');
  console.log(html.slice(garenPos - 300, garenPos + 400).replace(/\s+/g, ' '));
}

// テーブル行の構造を探す（勝率と共に出てくるchampionリスト）
console.log('\n=== Table/list structure search ===');
// 2つ以上のチャンピオン名が連続して出てくる箇所
const pos1 = html.indexOf('/champion/Garen.png');
const pos2 = html.indexOf('/champion/Malphite.png');
const pos3 = html.indexOf('/champion/Sett.png');
console.log('Garen:', pos1, 'Malphite:', pos2, 'Sett:', pos3);
console.log('Distance Garen→Malphite:', pos2 - pos1);
console.log('Distance Malphite→Sett:', pos3 - pos2);

// 連続したチャンピオン間のHTML構造を確認
if (pos1 !== -1 && pos2 !== -1) {
  const between = html.slice(pos1, pos2 + 100);
  console.log('\nBetween Garen and Malphite:');
  console.log(between.replace(/\s+/g, ' ').slice(0, 500));

  // この区間に勝率が含まれるか
  const rates = between.match(/\d{2}\.\d{1,2}%/g);
  console.log('Win rates in this range:', rates);
}
