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
  } catch (err) {
    console.error('explain API error:', err);
    return NextResponse.json({ error: '生成に失敗しました' }, { status: 500 });
  }
}
