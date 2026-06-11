const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://lolalytics.com/lol/tierlist/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// Garenの周辺HTML（テンプレート外のデータを見る）
const garenPos = html.indexOf('>Garen<');
if (garenPos > -1) {
  const section = html.slice(garenPos - 500, garenPos + 1000).replace(/\s+/g, ' ');
  console.log('Around >Garen<:\n', section);
}

// % を含むspan要素を探す
const percSpans = [...html.matchAll(/<span[^>]*>([\d.]+)%<\/span>/g)];
console.log('\nPercent spans (first 20):', percSpans.slice(0, 20).map(m => m[0]));

// クラスにtext-blue, text-red, text-yellowを含む要素
const coloredPct = [...html.matchAll(/<span class="[^"]*text-(?:blue|red|yellow|green)-\d+[^"]*">([\d.]+)%<\/span>/g)];
console.log('\nColored % spans:', coloredPct.slice(0, 20).map(m => `${m[0]}`));
