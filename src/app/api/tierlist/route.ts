import { NextRequest, NextResponse } from 'next/server';
import { scrapePickRates } from '@/lib/scrapers/tierlist';
import type { Role } from '@/types';

const VALID_ROLES: Role[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role') as Role;
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({}, { status: 400 });
  }
  const pickRates = await scrapePickRates(role);
  return NextResponse.json(Object.fromEntries(pickRates.entries()), {
    headers: { 'Cache-Control': 'public, s-maxage=14400' },
  });
}
