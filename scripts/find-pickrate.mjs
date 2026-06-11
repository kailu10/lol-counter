const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://lolalytics.com/lol/tierlist/?lane=top&tier=emerald_plus', { headers: HEADERS });
const html = await res.text();

// 全Qwikテンプレート値を取得
const all = [...html.matchAll(/<!--t=\w+-->(.*?)<!---->/gs)].map(m => m[1].trim());

// グループ境界を調べる（champ名 + tier の7要素パターン以外に何がある？）
console.log('All Qwik values [0-80]:');
all.slice(0, 80).forEach((v, i) => console.log(`${i}: "${v}"`));

// %が含まれる値
const percents = all.filter(v => /^\d+\.\d+$/.test(v) || /^\d+\.\d+%$/.test(v));
console.log('\nNumeric/percent values:', percents.slice(0, 20));
