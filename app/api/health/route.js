import { NextResponse } from 'next/server';
import { readVersion } from '@/lib/version';

export const dynamic = 'force-dynamic';

/**
 * 健康检查。Docker 的 HEALTHCHECK 和部署后「确认更新到哪一版」都靠它。
 *
 * 故意不查数据库：服务能响应 HTTP 就算活着，数据库坏了该在页面上暴露，
 * 不该让整个站点被判定成宕机。
 *
 * 版本号的读法见 lib/version.js —— 优先镜像里的 VERSION 文件，
 * 因为环境变量会被 NAS 图形界面手工填的值盖掉。
 */
export async function GET() {
  const { sha, built } = readVersion();
  return NextResponse.json(
    { ok: true, sha, built, at: new Date().toISOString() },
    { headers: { 'cache-control': 'no-store' } }
  );
}
