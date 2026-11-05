import { after, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 手动触发本站更新。
 *
 * 平时 watchtower 每 24 小时轮询一次镜像，这个接口让后台能点一下「检查并更新」，
 * 由 buding-site 容器去叫 watchtower 的 HTTP API（POST /v1/update），
 * watchtower 会拉最新镜像并重建容器 —— 包括 buding-site 自己。
 *
 * 两个坑（「个人工作台」那边 2026-11-05 踩过，这里直接沿用结论）：
 *
 * 1) **不能直接 fire-and-forget**。`fetch(...).catch(()=>{})` 之后立刻 return，
 *    路由处理函数一返回 Next 就把这次请求的上下文拆了，还没建立连接的那次
 *    fetch 直接被取消。实测点 4 下只有 2 条「Updates triggered」进了日志。
 *    改用 Next 15 的 `after()`：保证在响应写完之后继续执行，不被请求生命周期中断。
 *
 * 2) **不能给这个 fetch 设短超时**。watchtower 的 /v1/update 是同步阻塞的，
 *    要一直拉到镜像、停掉旧容器、起新容器才返回；而「停掉旧容器」就是把自己
 *    杀掉，所以这个请求注定以连接中断结束。这是预期行为，不能靠 AbortSignal
 *    提前掐，否则可能在 watchtower 刚拉到一半时断开。
 */

/** 冷却期：连点多次只会触发一次。watchtower 内部是串行的，
 *  重复请求会排队、每次多拉一遍镜像，没必要。 */
const COOLDOWN_MS = 20_000;
let lastTriggerAt = 0;

export async function POST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const url = process.env.WATCHTOWER_URL || 'http://watchtower:8080';
  const token = process.env.WATCHTOWER_TOKEN || '';

  if (!token) {
    // 本地开发没有 watchtower，直接把原因说清楚，不要假装成功
    return NextResponse.json(
      { ok: false, error: 'NO_TOKEN', message: '这台机器没接 watchtower（缺少 WATCHTOWER_TOKEN），更新按钮只在 NAS 上有效' },
      { status: 400 }
    );
  }

  const now = Date.now();
  if (now - lastTriggerAt < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - lastTriggerAt)) / 1000);
    return NextResponse.json({
      ok: true,
      cooling: true,
      message: `刚刚已经触发过了，watchtower 正在处理（${wait} 秒后可再点）`,
    });
  }
  lastTriggerAt = now;

  // 响应写完之后再发，不会被请求生命周期取消。
  after(async () => {
    try {
      await fetch(`${url}/v1/update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // 走到这里通常就是「容器被 watchtower 停掉了」，属于成功路径的一部分。
      // 真正的失败会体现在版本号没变上。
    }
  });

  return NextResponse.json({
    ok: true,
    message: '已通知 watchtower，正在拉镜像；重建容器时页面会短暂断开，属正常',
  });
}
