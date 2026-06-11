const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/html, */*',
};

async function tryUrl(label, url) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    console.log(`[${res.status}] ${label}: ${url}`);
    if (res.status === 200 && text.length > 100) {
      console.log('  preview:', text.slice(0, 300).replace(/\n/g, ' '));
    }
  } catch (e) {
    console.log(`[ERR] ${label}: ${e.message}`);
  }
}

// op.gg 内部API候補
await tryUrl('opgg api v1.0', 'https://op.gg/api/v1.0/internal/bypass/champions/darius/counters/summary?region=global&tier=emerald&position=top');
await tryUrl('opgg lol-web api', 'https://lol-web-api.op.gg/api/v1.0/champions/darius/counters?position=top&tier=emerald');
await tryUrl('opgg c-lol-web', 'https://c-lol-web.op.gg/api/v1.0/champions/darius/counters?position=top&tier=emerald');

// lolalytics URL候補
await tryUrl('lolalytics build page', 'https://lolalytics.com/lol/darius/build/?lane=top&tier=emerald_plus');
await tryUrl('lolalytics counters page', 'https://lolalytics.com/lol/darius/counters/?lane=top&tier=emerald_plus');
await tryUrl('lolalytics matchups', 'https://lolalytics.com/lol/darius/matchups/?lane=top&tier=emerald_plus');
await tryUrl('lolalytics api mega', 'https://lolalytics.com/api/mega/?ep=champion&p=d&v=1&tier=platinum_plus&queue=420&region=all&lang=ja&lane=top&pick=Darius');
await tryUrl('lolalytics api champion', 'https://lolalytics.com/api/1/lol/champion?champ=Darius&lane=top&tier=emerald_plus&patch=25.10&region=all');

// lol.ps URL候補
await tryUrl('lolps champion counters en', 'https://lol.ps/en/champion/darius/counter?lane=top');
await tryUrl('lolps champion counters kr', 'https://lol.ps/ko/champion/darius/counter?lane=top');
await tryUrl('lolps champion page', 'https://lol.ps/champion/Darius?lane=top');
await tryUrl('lolps api', 'https://api.lol.ps/api/lol/champions/darius/matchups?lane=top&tier=6');
await tryUrl('lolps cdn api', 'https://cdn.lol.ps/api/lol/champions/darius?lane=top&tier=6');
