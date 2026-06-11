import { readFileSync } from 'fs';

// .env.local を手動パース
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map((p, i) => i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim()))
);

const { default: Anthropic } = await import('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

console.log('API key prefix:', env.ANTHROPIC_API_KEY?.slice(0, 20) + '...');

try {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: 'TOPレーンのダリウスに対してガレンがカウンターである理由を3文で説明して' }],
  });
  console.log('Success:', msg.content[0].text);
} catch (e) {
  console.log('Error:', e.message, e.status, e.error);
}
