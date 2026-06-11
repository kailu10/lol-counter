// op.gg の内部APIエンドポイントを探す
async function checkOpgg() {
  const res = await fetch('https://www.op.gg/champions/darius/counters?position=top&tier=emerald', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
  });
  const html = await res.text();

  // __NEXT_DATA__ を確認
  const m = html.match(/__NEXT_DATA__[^>]+>([\s\S]+?)<\/script>/);
  if (m) {
    const d = JSON.parse(m[1]);
    console.log('=== __NEXT_DATA__ (first 3000 chars) ===');
    console.log(JSON.stringify(d).slice(0, 3000));
  } else {
    console.log('__NEXT_DATA__ not found');
  }

  // API URLを探す
  const apis = html.match(/https:\/\/[a-zA-Z0-9._\-/]+\/api[a-zA-Z0-9._\-/=?&%]{0,100}/g) || [];
  const unique = Array.from(new Set(apis)).slice(0, 20);
  console.log('\n=== API hints ===');
  unique.forEach(u => console.log(u));
}

// lolalytics の構造確認
async function checkLolalytics() {
  const res = await fetch('https://lolalytics.com/lol/darius/vs/top/?tier=emerald_plus', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
  });
  console.log('\n=== lolalytics status:', res.status, '===');
  const html = await res.text();
  console.log('length:', html.length);

  const m = html.match(/__NEXT_DATA__[^>]+>([\s\S]+?)<\/script>/);
  if (m) {
    const d = JSON.parse(m[1]);
    console.log('__NEXT_DATA__ (first 2000):', JSON.stringify(d).slice(0, 2000));
  }

  const apis = html.match(/https:\/\/[a-zA-Z0-9._\-/]+\/api[a-zA-Z0-9._\-/=?&%]{0,100}/g) || [];
  const unique = Array.from(new Set(apis)).slice(0, 20);
  console.log('API hints:');
  unique.forEach(u => console.log(u));
}

// lol.ps の構造確認
async function checkLolps() {
  const res = await fetch('https://lol.ps/champion/darius/counter?lane=top&tier=6', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
  });
  console.log('\n=== lol.ps status:', res.status, '===');
  const html = await res.text();
  console.log('length:', html.length);
  console.log('first 1000:', html.slice(0, 1000));
}

await checkOpgg();
await checkLolalytics();
await checkLolps();
