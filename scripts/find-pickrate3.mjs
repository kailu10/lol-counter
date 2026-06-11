const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://lolalytics.com/lol/tierlist/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// Garenの行全体（もっと広く）
const garenPos = html.indexOf('>Garen<');
const section = html.slice(garenPos - 200, garenPos + 2000).replace(/\s+/g, ' ');
console.log(section);

// 数値パターン（%なし）を全て抽出
const nums = [...html.matchAll(/>\s*([\d]+\.[\d]+)\s*</g)];
console.log('\nRaw numbers (first 30):', nums.slice(0, 30).map(m => m[1]));
