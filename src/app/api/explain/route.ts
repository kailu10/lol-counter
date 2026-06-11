import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// メモリキャッシュ（サーバー再起動まで保持）
const cache = new Map<string, string>();

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

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const explanation = (message.content[0] as { type: string; text: string }).text.trim();
    cache.set(key, explanation);

    return NextResponse.json({ explanation });
  } catch (err: unknown) {
    const apiErr = err as { status?: number; error?: { type?: string } };
    if (apiErr.status === 400 && apiErr.error?.type === 'invalid_request_error') {
      return NextResponse.json({ error: 'APIクレジット不足です。Anthropic コンソールで残高を確認してください。' }, { status: 503 });
    }
    console.error('explain API error:', err);
    return NextResponse.json({ error: '解説の生成に失敗しました。しばらくしてから再試行してください。' }, { status: 500 });
  }
}
