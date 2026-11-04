import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 健康检查。Docker 的 HEALTHCHECK 和部署后「确认更新到哪一版」都靠它。
 *
 * 故意不查数据库：服务能响应 HTTP 就算活着。
 * sha 由构建时把提交号塞进环境变量 SITE_SHA（见 Dockerfile / GitHub Actions）。
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      sha: process.env.SITE_SHA || 'dev',
      at: new Date().toISOString(),
    },
    { headers: { 'cache-control': 'no-store' } }
  );
}
