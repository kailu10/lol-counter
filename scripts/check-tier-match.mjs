const role = 'TOP';
const champ = 'Darius';
const base = 'https://lolcounter.vercel.app';

const counter = await (await fetch(`${base}/api/counter?champion=${champ}&role=${role}`)).json();
const tier = await (await fetch(`${base}/api/tierlist?role=${role}`)).json();
const tierKeys = Object.keys(tier);

console.log('tierlist champ count:', tierKeys.length);
console.log('\ncounter -> tier lookup:');
for (const c of counter.counters) {
  const norm = c.championId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = tier[norm];
  console.log(
    `${c.championId.padEnd(14)} norm=${norm.padEnd(14)} tier=${(c.tier ?? '(none)').padEnd(6)} inTierMap=${t ? JSON.stringify(t) : 'MISS'}`
  );
}

// ティアありキーのサンプル
console.log('\nsample tierMap entries with tier:');
let n = 0;
for (const k of tierKeys) {
  if (tier[k].tier) { console.log(`  ${k} -> ${JSON.stringify(tier[k])}`); if (++n >= 8) break; }
}
console.log('\nentries WITHOUT tier (pickRate only), first 15:');
console.log(tierKeys.filter((k) => !tier[k].tier).slice(0, 15).join(', '));
