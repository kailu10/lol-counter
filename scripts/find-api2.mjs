const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
};

// lolalytics counters HTMLの中身を詳しく見る
const res = await fetch('https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// チャンピオン名・勝率っぽいデータを探す
const winRates = html.match(/\d{2}\.\d{1,2}%/g) || [];
console.log('Win rate patterns found:', winRates.slice(0, 20));

// JSONっぽいデータブロックを探す
const jsonBlocks = html.match(/\{[^{}]{100,}\}/g) || [];
console.log('\nJSON-like blocks (first 3):');
jsonBlocks.slice(0, 3).forEach((b, i) => console.log(`[${i}]`, b.slice(0, 200)));

// qwik state dataを探す
const qState = html.match(/q:s[^"]*"[^"]+"/g) || [];
console.log('\nQwik state hints:', qState.slice(0, 10));

// script タグの中身を探す
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
console.log('\nScript tags count:', scripts.length);
scripts.forEach((s, i) => {
  if (s.includes('winRate') || s.includes('counter') || s.includes('champion')) {
    console.log(`Script[${i}] preview:`, s.slice(0, 300));
  }
});

// lol.psの正しいURLを探す - 別のパターンを試す
console.log('\n=== lol.ps URL探索 ===');
const lolpsUrls = [
  'https://lol.ps/champions/darius/counter?lane=top',
  'https://lol.ps/champion/darius?lane=top&position=top',
  'https://lol.ps/',
];
for (const url of lolpsUrls) {
  try {
    const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    const t = await r.text();
    console.log(`[${r.status}] ${url} (${t.length} chars)`);
    if (r.status === 200) console.log('  preview:', t.slice(0, 200));
  } catch(e) {
    console.log(`[ERR] ${url}: ${e.message}`);
  }
}
