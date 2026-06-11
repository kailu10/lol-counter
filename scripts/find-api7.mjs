const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lol.ps sitemap からchampionのURL構造を確認
const r = await fetch('https://lol.ps/sitemap.xml', { headers: HEADERS });
const xml = await r.text();

const urls = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
const champUrls = urls.filter(u => u.includes('champion')).map(u => u.replace(/<\/?loc>/g, ''));
console.log(`Champion URLs in sitemap (${champUrls.length} total):`);
champUrls.slice(0, 20).forEach(u => console.log(' ', u));

// Dariusのページを探す
const dariusUrls = champUrls.filter(u => u.toLowerCase().includes('darius'));
console.log('\nDarius URLs:', dariusUrls);

// counter関連URL
const counterUrls = champUrls.filter(u => u.toLowerCase().includes('counter'));
console.log('\nCounter URLs (first 10):', counterUrls.slice(0, 10));
