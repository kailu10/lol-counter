import { NextResponse } from 'next/server';
import { getAllChampions } from '@/lib/ddragon';

export async function GET() {
  const champions = await getAllChampions();
  return NextResponse.json(champions);
}
