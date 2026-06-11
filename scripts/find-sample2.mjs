const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lolalytics でサンプル数とカウンター名を一緒に取る
const res = await fetch('https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// "wins against ...X% of the time" の前後のGames数
const drMundoPos = html.indexOf('Dr. Mundo');
if (drMundoPos > -1) {
  console.log('Around Dr.Mundo (-200 to +500):');
  console.log(html.slice(drMundoPos - 200, drMundoPos + 500).replace(/\s+/g, ' '));
}

// Games数はカウンター名の近くにある
// "NNN Games" パターン
const gamesPattern = /wins against <!--t=\w+-->([\w\s'.]+?)<!---->.*?(\d+)\s*Games.*?<span class="text-green-\d+">([\d.]+)%<\/span> of the time/gs;
const matches = [...html.matchAll(gamesPattern)];
console.log('\nWith games count:', matches.slice(0, 5).map(m => `${m[1].trim()}: ${m[3]}% (${m[2]} games)`));

// gamesが前後どちらにあるかで順序を変えて試す
const gamesPattern2 = /(\d+)\s*Games.*?wins against <!--t=\w+-->([\w\s'.]+?)<!---->.*?<span class="text-green-\d+">([\d.]+)%<\/span> of the time/gs;
const matches2 = [...html.matchAll(gamesPattern2)];
console.log('\nGames before (alt):', matches2.slice(0, 5).map(m => `${m[2].trim()}: ${m[3]}% (${m[1]} games)`));

// 全体のゲーム数 (2,375,514 は合計?)
console.log('\nTotal Qwik big number:', html.match(/<!--t=\w+-->([\d,]+)<!---->/)?.[1]);
