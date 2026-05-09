import { NextResponse } from 'next/server';

import { prisma } from '@/shared/db/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const districtId = url.searchParams.get('districtId');
  if (!districtId) return NextResponse.json({ items: [] }, { status: 400 });
  const items = await prisma.village.findMany({
    where: { districtId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return NextResponse.json({ items });
}
