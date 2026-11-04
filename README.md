# 冷丶布丁 · 个人网站

方案 A（TERMINAL GRID）落地版。Next.js 15 + SQLite，中英双语、明暗双主题、带后台写作。

现在**只在本机跑**，没有部署到任何线上环境。

---

## 一、怎么跑起来

```bash
cd site
pnpm install          # 首次
pnpm build && pnpm start
```

打开 http://localhost:3100

开发模式（改代码自动刷新）：

```bash
cd site
pnpm dev
```

> 端口固定 3100，写在 `site/package.json` 的 scripts 里。想换就改那里的 `-p 3100`。

---

## 二、后台怎么用

地址 http://localhost:3100/admin

默认密码 `buding2026`，在 `site/.env.local` 的 `ADMIN_PASSWORD` 改。

进去之后：

- **写新的** → 左边写 Markdown，右边实时预览
- 标题、语言（中文/英文）、标签、摘要、slug 都能填
- `⌘S` 保存，底部可以「存草稿」或「发布」
- 发布后前台立刻能看到，在首页「文章」区块
- 列表里能编辑、看前台、删除（删除要点两次确认）

文章存在 `site/data/site.db`（SQLite），备份直接拷这个文件。

---

## 三、改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 全站文案（首屏、关于、联系、页脚…） | `site/lib/content.js` 一个文件，中英文各一段 |
| 作品列表 / 时间线 | 同上，`work` 和 `about` 两块 |
| 邮箱、社交链接 | 同上，`contact` 那块（现在是 `hi@lbuding.com` 占位） |
| 颜色 / 字号 / 间距 | `site/app/globals.css` 顶部的 `:root` 令牌（深色）与 `[data-theme="light"]`（浅色，默认） |
| 站点标题、SEO、OG 图 | `site/app/layout.js` + `site/app/opengraph-image.png` |
| 图标 | `site/app/icon.svg` |

文案里 `{t, strong}` 这种结构是「一段话里挑几个词加粗」，渲染成 `<strong>`。

---

## 四、已经验过的东西

- `pnpm build` 15 条路由全过，首屏 JS 102–120 kB
- 20 个 QA 用例全绿：5 个页面 × 桌面 1440 / 手机 485 × 明暗两主题
  - 无横向溢出、无对比度不达标（WCAG AA）、无小于 24px 的点击目标、无 JS 报错
- 后台全链路实测：登录 → 写草稿 → 发布 → 前台出现 → 编辑 → 删除
- 手机上顶栏放不下导航，改成底部悬浮胶囊（作品/关于/文章/联系）
- RSS / sitemap / robots / 404 / OG 图 / favicon 都通

要自己复跑 QA：

```bash
node tools/qa.mjs http://localhost:3100
```

截图（逐屏滚动，不会把 `100svh` 撑爆）：

```bash
node tools/scrollshot.mjs http://localhost:3100/ /tmp/shot --w 1440 --h 900 --theme light
```

---

## 五、目录说明

```
个人网站/
├── site/              主项目
│   ├── app/           路由与页面
│   ├── components/    组件
│   ├── lib/           db / 文案 / 鉴权 / markdown
│   └── data/site.db   文章数据库
├── design/            早期八套风格方案（存档，可删）
├── previews/          八套方案的首屏截图（存档，可删）
├── tools/             自建的 CDP 截图与 QA 脚本
└── deploy/            部署包（nginx / systemd / 脚本，暂时用不上）
```

`deploy/` 里是给将来部署准备的：`nginx-lbuding.conf`、`buding-site.service`、`setup.sh`、`deploy.sh`。
**现在不用碰**，等你说要上 NAS 或服务器再一起看。

---

## 六、将来部署时要注意的

- Node 必须 ≥ 22，因为用的是 Node 内置的 `node:sqlite`，不编译原生模块
- `SITE_URL` 环境变量要改成正式域名，否则 RSS / sitemap / OG 图里的绝对链接会指向 localhost
- `SESSION_SECRET` 要换成 `openssl rand -hex 32` 的输出
- 数据库在 `site/data/`，迁移时记得连这个目录一起带过去
