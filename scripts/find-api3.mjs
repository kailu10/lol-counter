const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lolalytics HTMLを詳しく解析
const res = await fetch('https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// チャンピオン名+勝率のペアをDOMの近傍から探す
// img src に champion名が入っているはずなのでそのパターンを探す
const imgChamps = html.match(/\/assets\/[^"']+\/([A-Za-z]+)(?:\.[a-z]+)?["']/g) || [];
console.log('Champion img hints (first 30):');
imgChamps.slice(0, 30).forEach(m => console.log(' ', m));

// ddragonのURLパターン
const ddragon = html.match(/ddragon[^"']*champion\/([A-Za-z]+)/g) || [];
console.log('\nDDragon champion refs:', ddragon.slice(0, 20));

// "champion":"xxx" パターン
const champRefs = html.match(/"champion"\s*:\s*"([A-Za-z]+)"/g) || [];
console.log('\nChampion refs in JSON:', champRefs.slice(0, 20));

// Qwik JSONの中身を詳しく見る
const qwikJson = html.match(/<script type="qwik\/json">([\s\S]+?)<\/script>/);
if (qwikJson) {
  // obfuscatedなのでそのまま出力（長いので最初の5000文字）
  console.log('\nQwik JSON (5000 chars):', qwikJson[1].slice(0, 5000));
}

// lol.ps トップページからAPIパターンを探す
console.log('\n=== lol.ps root page analysis ===');
const lolpsRes = await fetch('https://lol.ps/', { headers: HEADERS });
const lolpsHtml = await lolpsRes.text();

// API呼び出しのURLパターン
const fetchUrls = lolpsHtml.match(/fetch\(['"](https?:\/\/[^'"]+)['"]/g) || [];
console.log('Fetch calls:', fetchUrls.slice(0, 10));

const apiUrls = lolpsHtml.match(/(https?:\/\/[a-zA-Z0-9.\-_/]+(?:\/api\/)[a-zA-Z0-9.\-_/=?&%]{0,150})/g) || [];
console.log('API URLs found:', Array.from(new Set(apiUrls)).slice(0, 20));

// チャンピオンページのURLパターンを探す
const champUrls = lolpsHtml.match(/(?:href|src)=["']([^"']*champion[^"']*)['"]/g) || [];
console.log('\nChampion URL patterns:', champUrls.slice(0, 10));

// scriptのsrc属性からJS bundleを探す
const scripts = lolpsHtml.match(/<script[^>]+src=["']([^"']+)["']/g) || [];
console.log('\nScript sources:', scripts.slice(0, 5));
