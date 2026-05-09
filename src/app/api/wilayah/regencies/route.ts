import { NextResponse } from 'next/server';

import { prisma } from '@/shared/db/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const provinceId = url.searchParams.get('provinceId');
  if (!provinceId) return NextResponse.json({ items: [] }, { status: 400 });
  const items = await prisma.regency.findMany({
    where: { provinceId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return NextResponse.json({ items });
}
