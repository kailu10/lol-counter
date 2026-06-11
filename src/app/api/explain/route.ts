import { NextRequest, NextResponse } from 'next/server';

const MODELS = [
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-20b:free',
];

const cache = new Map<string, string>();

// 環境変数にBOMや余分な空白が混入してもHTTPヘッダーで壊れないようサニタイズ
function apiKey(): string {
  // JSの \s はU+FEFF(BOM)を含むため、混入してもここで除去される
  return (process.env.OPENROUTER_API_KEY ?? '').replace(/\s/g, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const target = searchParams.get('target');
  const counter = searchParams.get('counter');
  const role = searchParams.get('role');

  if (!target || !counter || !role) {
    return NextResponse.json({ error: 'パラメーター不足' }, { status: 400 });
  }

  const key = `${target}|${counter}|${role}`;
  if (cache.has(key)) {
    return NextResponse.json({ explanation: cache.get(key) });
  }

  const prompt = `League of Legendsで${role}レーンの${target}に対して${counter}がカウンターである理由を、3文以内で簡潔に日本語で説明してください。キットの相性や強みを中心に書き、難しい専門用語は避けてください。`;

  for (const model of MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
        }),
      });

      const data = await res.json();
      const explanation = data.choices?.[0]?.message?.content?.trim();
      if (explanation) {
        cache.set(key, explanation);
        return NextResponse.json({ explanation });
      }
      console.warn(`explain: model ${model} failed, trying next`);
    } catch (err) {
      console.warn(`explain: model ${model} threw, trying next`, err);
    }
  }

  return NextResponse.json({ error: '解説の生成に失敗しました。しばらくしてから再試行してください。' }, { status: 500 });
}
