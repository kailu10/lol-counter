const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lolalytics tier list の正しいURL
for (const url of [
  'https://lolalytics.com/lol/tierlist/?lane=top&tier=emerald_plus',
  'https://lolalytics.com/lol/tier/?lane=top&tier=emerald_plus',
]) {
  const res = await fetch(url, { headers: HEADERS });
  const html = await res.text();
  const tiers = [...html.matchAll(/<!--t=\w+-->([SABCD][+]?)<!---->/g)];
  if (tiers.length > 0) {
    console.log(`\n${url}: Found ${tiers.length} tiers`);
    console.log(tiers.slice(0, 10).map(m => m[1]));
  } else {
    console.log(`${url}: No tiers found (HTML: ${html.length} bytes)`);
    // 何かチャンピオン名があるか
    const champs = [...html.matchAll(/<!--t=\w+-->([\w\s'.]+?)<!---->/g)].slice(0, 5);
    console.log('Sample content:', champs.map(m => m[1].trim()));
  }
}

// u.gg tier list を試す
const res2 = await fetch('https://u.gg/lol/tier-list?role=top_lane&rank=emerald_plus', { headers: HEADERS });
const html2 = await res2.text();
console.log('\nu.gg HTML length:', html2.length);
const ugTiers = [...html2.matchAll(/>[SABCD][+]?<\//g)];
console.log('u.gg tiers:', ugTiers.slice(0, 5).map(m => m[0]));
