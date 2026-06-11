const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' };

const res = await fetch('https://www.op.gg/champions?position=top&tier=emerald', { headers: HEADERS });
const html = await res.text();

// __NEXT_DATA__ を探す
const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (nextData) {
  try {
    const json = JSON.parse(nextData[1]);
    // props.pageProps の中にチャンピオンデータがあるはず
    const props = json?.props?.pageProps;
    const champList = props?.championList ?? props?.data?.champions ?? props?.champions;
    if (champList && Array.isArray(champList)) {
      const darius = champList.find(c => c.key === 'Darius' || c.name === 'Darius' || c.id === 'Darius');
      console.log('Darius entry:', JSON.stringify(darius, null, 2));
      console.log('First champion:', JSON.stringify(champList[0], null, 2));
    } else {
      const keys = Object.keys(props ?? {});
      console.log('pageProps keys:', keys);
      // より深く探す
      const str = JSON.stringify(props).slice(0, 2000);
      console.log('pageProps sample:', str);
    }
  } catch (e) {
    console.log('JSON parse error:', e.message);
  }
} else {
  console.log('No __NEXT_DATA__ found');
  // 他のscriptタグを探す
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]{100,5000}?)<\/script>/g)];
  for (const s of scripts.slice(0, 3)) {
    if (s[1].includes('tier') || s[1].includes('Darius')) {
      console.log('Script with tier/Darius:', s[1].slice(0, 500));
    }
  }
}
