import crypto from 'node:crypto';
import { cookies } from 'next/headers';

/* ============================================================
   极简会话：HMAC 签名的 cookie，不需要额外的 session 存储。
   密码和密钥都从环境变量读，服务器上用 .env.local 配置。
   ============================================================ */

export const COOKIE = 'bd_session';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 天

function secret() {
  return process.env.SESSION_SECRET || 'dev-secret-change-me';
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'buding2026';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function issueToken() {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const i = token.lastIndexOf('.');
  if (i < 1) return false;
  const payload = token.slice(0, i);
  const mac = token.slice(i + 1);

  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return true;
}

export function checkPassword(input) {
  const expected = adminPassword();
  if (typeof input !== 'string') return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

/** 在 server component / route handler 里判断当前是否已登录 */
export async function isAuthed() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

/**
 * cookie 选项。
 *
 * secure 必须跟着「这次请求是不是 https」走，不能一刀切：
 *   · 线上走 Cloudflare Tunnel / nginx 反代，是 https，必须开，否则 cookie 走明文
 *   · 家里用 http://NAS的IP:3110 直连时是 http，必须关，开了浏览器会直接丢 cookie，
 *     登录看似成功却一直跳回登录页（工作台在阿里云那台踩过这个坑）
 * 反代会带 x-forwarded-proto，据此判断最稳。可用 SITE_SECURE_COOKIE 强写 0/1 覆盖。
 */
export function cookieOptionsFor(req) {
  const forced = process.env.SITE_SECURE_COOKIE;
  let https;
  if (forced === '1') https = true;
  else if (forced === '0') https = false;
  else {
    const proto = req?.headers?.get?.('x-forwarded-proto')?.split(',')[0]?.trim();
    https = proto ? proto === 'https' : (req?.url ? new URL(req.url).protocol === 'https:' : false);
  }
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
    secure: https,
  };
}
