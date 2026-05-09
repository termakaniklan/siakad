import { NextResponse } from 'next/server';

import { logout } from '@/modules/auth/logout-service';

export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}
