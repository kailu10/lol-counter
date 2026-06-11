const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// op.gg tier list
const res = await fetch('https://www.op.gg/champions?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// ティアとチャンピオン名のパターンを探す
// 候補1: tier badge class + alt
const badges = [...html.matchAll(/text-tier-([a-z0-9]+)[^"]*"[^>]*>([A-Z][+\-]?)<\/[^>]+>.*?alt="([A-Za-z']+)"/gs)];
console.log('Badge pattern matches:', badges.slice(0, 5).map(m => `tier=${m[2]} champ=${m[3]}`));

// 候補2: alt + tier
const alts = [...html.matchAll(/alt="([A-Za-z']+)"[^>]*>.*?>\s*([SABCD][+]?)\s*</gs)];
console.log('Alt+tier matches:', alts.slice(0, 5).map(m => `${m[1]}=${m[2]}`));

// 候補3: tier-rank とチャンピオン名
const tierSection = html.indexOf('S+');
console.log('\nAround first S+:', html.slice(tierSection - 100, tierSection + 200).replace(/\s+/g, ' '));

// 候補4: データ構造を探す
const scriptMatch = html.match(/"tier":\s*"([A-Z][+]?)"/);
console.log('\nJSON tier value:', scriptMatch?.[1]);

// HTMLサイズ確認
console.log('\nHTML length:', html.length);

// op.gg counter page でのティア表示確認
const res2 = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
const html2 = await res2.text();
const tierInCounter = html2.match(/"tier":\s*"([A-Z][+]?)"/g);
console.log('\nTier in counter page:', tierInCounter?.slice(0, 5));
