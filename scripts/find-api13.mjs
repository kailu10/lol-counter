const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// opgg-static.akamaized.net の champion 画像URLを探す（チャンピオン名を含む）
const champImgs = html.match(/\/champion\/([A-Za-z]+)\.png/g) || [];
const uniqueChamps = Array.from(new Set(champImgs.map(m => m.match(/\/champion\/([A-Za-z]+)\.png/)[1])));
console.log('Champions found in op.gg HTML:', uniqueChamps.slice(0, 30));

// 各チャンピオン名の前後150文字で勝率を探す
console.log('\n=== Champion + win rate proximity analysis ===');
for (const champ of uniqueChamps.slice(1, 15)) { // Darius自身を除く
  const pattern = new RegExp(`/champion/${champ}\\.png`);
  const pos = html.search(pattern);
  if (pos !== -1) {
    const ctx = html.slice(pos, pos + 600);
    const wr = ctx.match(/(\d{2}\.\d{1,2})%/g);
    if (wr && wr.length > 0) {
      console.log(`${champ}: win rates nearby = ${wr.slice(0, 4).join(', ')}`);
      // 短いコンテキストも表示
      console.log('  ctx:', ctx.replace(/\s+/g, ' ').slice(0, 200));
    }
  }
}
