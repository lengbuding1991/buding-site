import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkPassword, issueToken, COOKIE, cookieOptionsFor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { body = {}; }

  if (!checkPassword(body?.password)) {
    // 简单的恒定延迟，减少在线爆破的收益
    await new Promise((r) => setTimeout(r, 550));
    return NextResponse.json({ ok: false, error: 'WRONG_PASSWORD' }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(COOKIE, issueToken(), cookieOptionsFor(req));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const jar = await cookies();
  jar.set(COOKIE, '', { ...cookieOptionsFor(req), maxAge: 0 });
  return NextResponse.json({ ok: true });
}
