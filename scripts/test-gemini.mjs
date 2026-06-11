import { readFileSync } from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

console.log('Testing Gemini API...');
const result = await model.generateContent(
  'TOPレーンのダリウスに対してガレンがカウンターである理由を3文以内で日本語で説明してください。'
);
console.log('Success:\n', result.response.text());
