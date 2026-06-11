const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// op.gg tier list をより詳しく見る
const res = await fetch('https://www.op.gg/champions?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// Dariusの周辺を見る
const dariusPos = html.indexOf('Darius');
if (dariusPos > -1) {
  console.log('Around Darius:', html.slice(dariusPos - 300, dariusPos + 400).replace(/\s+/g, ' '));
}

// tier-S, tier-A などのクラス
const tierClass = [...html.matchAll(/tier-([SABCD][+]?)[^"]/g)];
console.log('\nTier class matches:', [...new Set(tierClass.map(m => m[0]))].slice(0, 10));

// "S+" や "A" がspanで囲まれているか
const spanTier = [...html.matchAll(/<span[^>]*>([SABCD][+\-]?)<\/span>/g)];
console.log('\nSpan tier:', spanTier.slice(0, 10).map(m => m[1]));

// op.gg の個別チャンピオンページにtierがあるか
const res2 = await fetch('https://www.op.gg/champions/darius/build?tier=emerald', { headers: HEADERS });
const html2 = await res2.text();
const dTier = html2.match(/"tier":\s*"([^"]+)"/);
const dGrade = html2.match(/grade['":\s]+([SABCD][+\-]?)/i);
console.log('\nDarius build page tier:', dTier?.[1]);
console.log('Darius grade:', dGrade?.[1]);

// lolalytics のtier
const res3 = await fetch('https://lolalytics.com/lol/darius/build/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html3 = await res3.text();
const lTier = [...html3.matchAll(/<!--t=\w+-->([SABCD][+]?)<!---->/g)];
console.log('\nLolalytics tier:', lTier.slice(0, 5).map(m => m[1]));
