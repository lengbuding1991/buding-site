import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 读当前版本号。
 *
 * 优先读镜像里的 VERSION 文件（构建时写死），读不到才退回环境变量。
 * 为什么要这样：环境变量会被绿联 NAS 图形界面里手工加的同名变量盖掉，
 * 导致页面显示的版本和实际跑的镜像不一致 —— 2026-11-04 真踩过：
 * 镜像里是新 sha，/api/health 却一直报旧 sha（界面里那条手工 SITE_SHA 赢了）。
 * 写进文件就读不出别的值。
 */
export function readVersion() {
  try {
    const [sha, built] = readFileSync(join(process.cwd(), 'VERSION'), 'utf8').trim().split('\n');
    if (sha) return { sha, built: built || 'unknown' };
  } catch {
    /* 本地开发没有这个文件，走下面的兜底 */
  }
  return { sha: process.env.SITE_SHA || 'dev', built: process.env.BUILD_DATE || 'unknown' };
}
