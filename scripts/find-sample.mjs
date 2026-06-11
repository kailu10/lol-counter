const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lolalytics でサンプル数を探す
const res = await fetch('https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// 数字パターン: "12,345 games" "n=12345" "(12345)" など
const games = [...html.matchAll(/(\d{3,7})\s*(?:games|matches|対戦|試合)/gi)];
console.log('Games count matches:', games.slice(0, 10).map(m => m[0]));

// JSON内の数値
const sampleJson = html.match(/"(?:total|n|games|count|sample)":\s*(\d+)/g);
console.log('\nJSON sample fields:', sampleJson?.slice(0, 10));

// "over X games" or "X games analyzed"
const overGames = html.match(/over\s+([\d,]+)\s+games/i);
const analyzed = html.match(/([\d,]+)\s+games?\s+analy/i);
console.log('\nOver games:', overGames?.[1]);
console.log('Games analyzed:', analyzed?.[1]);

// Qwik SSRテンプレート内の大きな数値
const bigNums = [...html.matchAll(/<!--t=\w+-->([\d,]+)<!---->/g)];
console.log('\nBig numbers in Qwik templates:', bigNums.slice(0, 20).map(m => m[1]));

// op.gg counter page でのサンプル数
const res2 = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', { headers: HEADERS });
const html2 = await res2.text();

// "X Games" patterns
const opggGames = [...html2.matchAll(/([\d,]+)\s*(?:Games|게임)/gi)];
console.log('\n=== op.gg games ===');
console.log('Games matches:', opggGames.slice(0, 10).map(m => m[0]));

// <!-- --> number pattern
const opggNums = [...html2.matchAll(/([\d,]+)<!-- -->/g)];
console.log('Inline numbers:', opggNums.slice(0, 20).map(m => m[1]));
