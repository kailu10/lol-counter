const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const r = await fetch('https://lol.ps/sitemap.xml', { headers: HEADERS });
const xml = await r.text();
console.log('Sitemap preview (2000 chars):', xml.slice(0, 2000));

// lol.ps: CDNのassetsから実際のJSファイルを探す
// ファビコンURL: https://cdn.lol.ps/static/prod/9a5c...41/favicon.png
// _app/immutable/ の下にあるが、実際のファイルはどこか？
// lol.psのHTMLを詳しく読む
const lolpsRes = await fetch('https://lol.ps/', { headers: HEADERS });
const lolpsHtml = await lolpsRes.text();

// link preload を探す
const preloads = lolpsHtml.match(/<link[^>]+as="(script|module)"[^>]+href="([^"]+)"/g) || [];
console.log('\nPreload scripts:', preloads.slice(0, 5));

// type=moduleスクリプト
const moduleScripts = lolpsHtml.match(/<script[^>]+type="module[^>]+>/g) || [];
console.log('\nModule scripts:', moduleScripts.slice(0, 5));

// どんなURLが使われているか全体を見る
const allUrls = lolpsHtml.match(/https?:\/\/[a-zA-Z0-9.\-/_%?&=]+/g) || [];
const uniqueUrls = Array.from(new Set(allUrls));
console.log('\nAll URLs found:', uniqueUrls.slice(0, 30));
