const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

// lolalytics: 勝率の前後50文字を表示してHTML構造を把握
const res = await fetch('https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

const pattern = /\d{2}\.\d{2}%/g;
let m;
const contexts = [];
while ((m = pattern.exec(html)) !== null) {
  const start = Math.max(0, m.index - 300);
  const end = Math.min(html.length, m.index + 100);
  contexts.push(html.slice(start, end));
}
console.log(`Found ${contexts.length} win rate occurrences\n`);
// 最初の3件を表示
contexts.slice(0, 3).forEach((ctx, i) => {
  console.log(`=== Win rate context [${i}] ===`);
  console.log(ctx.replace(/\s+/g, ' '));
  console.log();
});

// lol.ps: JSバンドルURLを探してAPIエンドポイントを見つける
console.log('\n=== lol.ps JS bundle analysis ===');
const lolpsRes = await fetch('https://lol.ps/', { headers: HEADERS });
const lolpsHtml = await lolpsRes.text();

// crossorigin moduleスクリプトを探す（Viteのエントリーポイント）
const moduleScripts = lolpsHtml.match(/<script[^>]+type="module"[^>]*src="([^"]+)"/g) || [];
console.log('Module scripts:', moduleScripts.slice(0, 5));

// cdnのスタティックファイルURL
const cdnUrls = lolpsHtml.match(/https:\/\/cdn\.lol\.ps\/static[^"']+/g) || [];
console.log('CDN URLs:', Array.from(new Set(cdnUrls)).slice(0, 10));

// メタタグやリンクからチャンピオンページURLを探す
const hrefPatterns = lolpsHtml.match(/href="(\/[^"]+champion[^"]+)"/g) || [];
console.log('Champion hrefs:', hrefPatterns.slice(0, 10));
