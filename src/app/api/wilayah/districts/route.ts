import { NextResponse } from 'next/server';

import { prisma } from '@/shared/db/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const regencyId = url.searchParams.get('regencyId');
  if (!regencyId) return NextResponse.json({ items: [] }, { status: 400 });
  const items = await prisma.district.findMany({
    where: { regencyId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return NextResponse.json({ items });
}
