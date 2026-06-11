import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
    const result = await model.generateContent(prompt);
    const explanation = result.response.text().trim();
    cache.set(key, explanation);
    return NextResponse.json({ explanation });
  } catch (err: unknown) {
    console.error('explain API error:', err);
    return NextResponse.json({ error: '解説の生成に失敗しました。しばらくしてから再試行してください。' }, { status: 500 });
  }
}
