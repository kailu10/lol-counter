const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://www.op.gg/champions?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// Garenを探す（上位tierに多い）
const garenPos = html.indexOf('"Garen"');
if (garenPos > -1) {
  console.log('Around "Garen":', html.slice(garenPos - 100, garenPos + 600).replace(/\s+/g, ' '));
}

// alt="Garen" を探す
const altGaren = html.indexOf('alt="Garen"');
if (altGaren > -1) {
  console.log('\nAround alt="Garen":', html.slice(altGaren - 300, altGaren + 500).replace(/\s+/g, ' '));
}

// lolalytics のティアリスト
const res2 = await fetch('https://lolalytics.com/lol/tierlist/1/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html2 = await res2.text();
const lTier = [...html2.matchAll(/<!--t=\w+-->([SABCD][+]?)<!---->/g)];
console.log('\nLolalytics tierlist tiers:', lTier.slice(0, 10).map(m => m[1]));
const lChamp = [...html2.matchAll(/<!--t=\w+-->([\w\s'.]+?)<!---->/g)];
console.log('Lolalytics tierlist champs:', lChamp.slice(0, 15).map(m => m[1].trim()));

// op.gg のカウンター専用ページにDariusのtierがある?
const res3 = await fetch('https://www.op.gg/champions/garen?tier=emerald', { headers: HEADERS });
const html3 = await res3.text();
const tierText = html3.match(/>[SABCD][+]?<\/(?:span|div|td|p)/g);
console.log('\nop.gg Garen page tiers:', tierText?.slice(0, 10));
