import { NextRequest, NextResponse } from 'next/server';
import { getCounterData } from '@/lib/counter';
import type { Role } from '@/types';

const VALID_ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const championId = searchParams.get('champion');
  const role = searchParams.get('role') as Role;

  if (!championId || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'パラメーターが不正です' }, { status: 400 });
  }

  const result = await getCounterData(championId, role);
  if (!result) {
    return NextResponse.json({ error: 'データを取得できませんでした' }, { status: 503 });
  }

  return NextResponse.json(result);
}
