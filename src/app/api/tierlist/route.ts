import { NextRequest, NextResponse } from 'next/server';
import { scrapeTierList } from '@/lib/scrapers/tierlist';
import type { Role } from '@/types';

const VALID_ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role') as Role;
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({}, { status: 400 });
  }
  const tierMap = await scrapeTierList(role);
  return NextResponse.json(Object.fromEntries(tierMap.entries()), {
    headers: { 'Cache-Control': 'public, s-maxage=14400' },
  });
}
