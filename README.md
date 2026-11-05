# 个人网站 · buding-site

> 中英双语 · 明暗双主题 · SQLite 后台写作 · Next.js 15

冷丶布丁的个人网站。视觉上是**技术图纸**：纸底、墨水字、蓝图细线、尺寸刻度；单页长滚动 + 后台 Notion 式写作。

全站单一强调色（冰蓝 `#0a68b8` / 深色 `#7fd3ff`），字体 IBM Plex Sans / Plex Mono + Noto Sans SC，字重只用 400/500/600。首屏那张链路图是 `components/Blueprint.js` 里手写的 SVG，不是背景装饰；背景那层网格与天光是 `components/Backdrop.js`。

## 本地跑

```bash
cd site
pnpm install
pnpm dev      # http://localhost:3100
pnpm build && pnpm start
```

后台：`/admin`（默认密码 `buding2026`，登录后像 Notion 一样写 markdown）。

## 部署到 NAS

走「GitHub Actions 打 arm64 镜像 → GHCR → NAS 绿联 Docker 拉取 → Cloudflare Tunnel 接线」，
和「个人工作台」同一条链路。完整步骤见 [`部署指南-NAS.md`](./部署指南-NAS.md)。

## 目录

- `app/` — 页面与路由（首页 / 文章页 / 后台 / API / RSS / sitemap）
- `components/` — 首页、顶栏、编辑器、后台；`Blueprint.js` 是首屏链路图
- `lib/` — 数据库（node:sqlite）、认证、文案、markdown、种子数据
- `scripts/` — 种子脚本、推 GitHub 脚本
- `Dockerfile` / `docker-compose.nas.yml` / `docker-entrypoint.sh` — 部署三件套
