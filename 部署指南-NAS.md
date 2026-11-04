# 部署到绿联 NAS（个人网站 · buding-site）

> 适用：绿联 DH4300 Plus（RK3588 / arm64 / 8G），UGOS Pro，NAS 在老家、通过 Cloudflare Tunnel 访问。
> 全程只需要「绿联云客户端」+「Cloudflare 网页后台」，不需要 SSH、不需要命令行。
> 这条链路和「个人工作台」完全一样，已经跑通，照抄即可。

---

## 零、一句话原理

```
本地改代码 → pnpm push（走 GitHub API，避开被掐的 git push）
  → GitHub Actions 打 arm64 镜像 → 推到 GHCR（ghcr.io/lengbuding1991/buding-site:latest）
  → NAS 的 Docker 拉镜像跑起来（监听 3110，容器内 3100）
  → Cloudflare Tunnel 把 lbuding.com 指到 localhost:3110
```

数据全程在 NAS 上（`/volume1/docker/buding-site/data` 里的 `site.db`），不经过 GitHub。

---

## 一、先搞清楚三件事

顺序不能反：

1. **拉镜像** —— 镜像已由 GitHub Actions 打好，存在 GHCR 里，NAS 直接拉。
2. **建 Docker 项目** —— 粘贴一段 compose，把 `buding-site` 容器跑起来（更新靠工作台已有的 watchtower，见第三节）。
3. **把域名接过来** —— 让 `lbuding.com` 经 Cloudflare 隧道打到 NAS 的 3110 端口。

### ⚠️ 两个和「个人工作台」不一样的地方

| 项 | 个人工作台 | 个人网站（本指南） |
|---|---|---|
| 端口 | 宿主机 3100 | 宿主机 **3110**（3100 被工作台占了） |
| 数据目录 | `/volume1/docker/workbench/data` | `/volume1/docker/buding-site/data` |
| 更新方式 | 设置页有「立即更新」按钮 | **没有按钮**，复用工作台的 watchtower 每 24h 自动查，或手动在 Docker 客户端点「更新」 |

---

## 二、拉镜像

1. 绿联云客户端 → 桌面打开 **Docker**
2. 左侧 **镜像** → **本地镜像** → 右上角 **添加**（有的版本叫「拉取」）
3. 镜像地址填：

```
ghcr.io/lengbuding1991/buding-site:latest
```

4. 等它拉完（约 250MB），列表里出现 `buding-site` 即可。

> UGOS 的「镜像仓库 → 搜索」功能是坏的（官方已知问题），**别在搜索框里找**，直接用「添加 / 拉取」填完整地址。

---

## 三、建项目（粘贴 compose）

1. Docker → 左侧 **项目** → 右上角 **创建**
2. 项目名填 **`buding-site`**（必须小写）
3. 配置来源选 **「粘贴 / 编辑 compose」**，把下面整段贴进去：

```yaml
services:
  buding-site:
    image: ghcr.io/lengbuding1991/buding-site:latest
    container_name: buding-site
    restart: unless-stopped
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    ports:
      - "3110:3100"
    volumes:
      - /volume1/docker/buding-site/data:/data
      - /etc/localtime:/etc/localtime:ro
    environment:
      TZ: Asia/Shanghai
      ADMIN_PASSWORD: "buding2026"
      SESSION_SECRET: "change-me-to-openssl-rand-hex-32"
      SITE_URL: "https://lbuding.com"
      SITE_SECURE_COOKIE: "0"
    mem_limit: 512m
    healthcheck:
      test:
        - CMD
        - node
        - -e
        - "fetch('http://127.0.0.1:3100/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
      interval: 30s
      timeout: 5s
      start_period: 30s
      retries: 3
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

4. 点 **部署**（或「应用」），等 `buding-site` 容器变 running。

### ⚠️ 为什么这里【没有】watchtower 段

个人工作台那个项目已经起了一个 watchtower（`container_name: watchtower`），它挂了 `/var/run/docker.sock`、开着 `WATCHTOWER_LABEL_ENABLE=true`，看到的是**整个 NAS 的所有容器**（跨项目），会更新**所有**带 `com.centurylinklabs.watchtower.enable=true` 标签的容器。

所以个人网站**不要**再起第二个 watchtower：
- 起了会报 `Conflict: container name "watchtower" already in use`（容器名全局唯一）；
- 就算换个名字，两个 watchtower 也会抢着更新同一批容器，更糟。

本文件只给 `buding-site` 打上同一个标签（上面 `labels` 那行），就会被工作台已有的 watchtower 自动更新，什么都不用额外做。

### 这段配置里几个要点

**`3110:3100`** —— 左边是 NAS 宿主机的端口，右边是容器内端口。工作台已经占了宿主机 3100，所以网站用 3110。CF 隧道那边的 Service 要填 `http://localhost:3110`。

**`/volume1/docker/buding-site/data`** —— 存数据库的目录。
- UGOS Pro 的存储池一般挂成 `/volume1`；如果这个路径建不了，改成你实际有的，比如 `/volume2/docker/buding-site/data`。
- 在客户端「文件管理」里先建好 `docker/buding-site/data` 这个空文件夹也行。
- **不用手动改属主**：镜像入口脚本会先 `chown -R nextjs:nodejs /data` 再降权运行。

**`SITE_SECURE_COOKIE: "0"`** —— 别改成 1。程序会自己看 `X-Forwarded-Proto` 决定要不要给登录 cookie 加 Secure。走 CF 隧道是 https 会自动加；你在家里用 `http://NAS的IP:3110` 直连时是 http 不加。**强写 1 会导致 http 下浏览器丢 cookie、登录后一直跳回登录页**（工作台在阿里云那台踩过这个坑）。

**`ADMIN_PASSWORD` / `SESSION_SECRET`** —— 部署后一定要改：
- `ADMIN_PASSWORD`：后台登录密码，默认 `buding2026`，改成你自己的。
- `SESSION_SECRET`：在**任意一台电脑**上跑 `openssl rand -hex 32`，把输出填进来（别用「随便敲一串」）。这个不改成默认值的话，会有人能伪造你的登录会话。

**`/var/run/docker.sock`** —— 那是工作台项目里 watchtower 挂载的，用来操作容器。本项目的 compose 里【没有】这一段（见上面「为什么没有 watchtower 段」），你不用管它。工作台那个 watchtower 已经覆盖了本站的自动更新。

---

## 四、先在内网验证一次

部署完，等 20 秒，在**同一个局域网**（或你在老家时）浏览器打开：

```
http://NAS的IP:3110
```

应该看到个人网站首页（中英双语、明暗可切换）。说明容器活了、数据库也建起来了（首次空库会自动灌 6 篇示例文章）。

打不开的话，按顺序查：

| 现象 | 原因 | 怎么办 |
|---|---|---|
| 容器一直 restarting | `/data` 写不进去 | 看容器日志有没有 `EACCES`；把 volumes 那行宿主路径换成确实存在的目录 |
| 502 / 页面空白 | 容器没过健康检查 | 日志里找 `Error:` 开头行；多半还是 `/data` 权限 |
| 端口占用 | 3110 被别的容器占了 | 把 `ports` 改成 `"3111:3100"`，重新部署（CF 隧道也跟着改） |
| `buding-site:latest` 找不到 | 镜像没拉成功 | 回第二步，确认本地镜像列表里真的有这个 tag |

---

## 五、接域名（在 Cloudflare 后台操作，需要你动手）

这一步要你在 Cloudflare 网页后台点几下，我没法替你点。

### 现状（先看清楚）

`lbuding.com` 现在被 Cloudflare 代理到了「大灯库存台」（`ytzs.lbuding.com` 也是它）。要把它换给个人网站，得在 Cloudflare 后台改两处。

### 目标接线

```
lbuding.com  →  Cloudflare Tunnel（隧道 nas）→  HTTP →  localhost:3110
```

### 具体步骤

1. 打开 Cloudflare → 选 `lbuding.com` 这个域名。
2. **Zero Trust → Networks → Tunnels**，找到名字叫 `nas` 的隧道（就是工作台在用的那个），点进 **Public Hostname**。
3. 加一条（或改一条）：
   - **Subdomain**：留空（代表裸域 `lbuding.com`），或填 `@`
   - **Domain**：`lbuding.com`
   - **Type**：`HTTP`
   - **URL**：`localhost:3110`（或 `192.168.1.197:3110`，localhost 更稳）
4. 保存。回到 **DNS → 记录**，确认 `lbuding.com` 有一条指向 `…cfargotunnel.com` 的 **CNAME**，且是**橙云**（已代理）。
   - 如果它现在还是 A 记录指向 `104.21.34.41`（大灯库存台的 CF IP），要把这条改掉——改成上面隧道给的 CNAME 目标。

### 三条链路缺一不可

| 环节 | 在哪配 | 配好长什么样 |
|---|---|---|
| 隧道 Public Hostname | Zero Trust → Tunnels → `nas` | `lbuding.com` → `HTTP` → `localhost:3110` |
| DNS 记录 | 域名 → DNS | 类型 `CNAME`，名称 `@`/留空，目标 `…cfargotunnel.com`，橙云 |
| 容器监听 | compose | `ports: "3110:3100"` |

### 怎么快速自查

```bash
# 1. DNS 有没有走 CF
dig +short lbuding.com
# 应该返回 104.21.x.x / 172.67.x.x，不是大灯库存台的源站 IP

# 2. 应用本身活着没
curl -s https://lbuding.com/api/health
# 返回 {"ok":true,"sha":"…"} 就是整条链路通了
```

---

## 六、登录后台，开始写

浏览器打开：

```
https://lbuding.com/admin
```

用 `ADMIN_PASSWORD` 里设的密码登录（默认 `buding2026`，改过了就用改过的）。

进去后像 Notion 一样：左边写 markdown，右边实时预览，⌘S 保存，草稿/发布切换，删除要二次确认。中英双语各自独立，写英文文章时在语言切到 English 后发。

---

## 七、以后怎么更新

改完代码，本地：

```bash
cd 个人网站/site
git add -A && git commit -m "改了啥" && pnpm push
```

然后分两种：

```
pnpm push（约 10 秒，走 GitHub API）
  → GitHub Actions 构建 arm64 镜像（约 4 分钟，有缓存 2 分钟）
  → 推到 ghcr.io/lengbuding1991/buding-site:latest
  → watchtower 每 24h 兜底自动拉取重建（想立刻更新见下）
```

### 想立刻更新（不等 24h）

在绿联客户端：Docker → 项目 → `buding-site` → **更新**（它会 `docker pull` 新镜像并重建）。数据在 `./data`，重建不影响。

### 怎么确认更新成功

在绿联的「容器 → buding-site → 终端」里跑：

```bash
curl -s localhost:3100/api/health
```

返回的 `sha` 就是当前跑的提交。和 GitHub 上 `main` 最新 sha 一比就知道有没有更新到。

---

## 附：容器里到底跑了什么

| 项 | 值 |
|---|---|
| 基础镜像 | `node:24-alpine`（arm64） |
| 应用端口 | 3100（容器内固定，映射到宿主机 3110） |
| 数据目录 | `/data`（数据库 `site.db` + wal/shm） |
| 运行用户 | 入口脚本 root → `su-exec` 降权到 uid 1001 `nextjs` |
| 时区 | `TZ=Asia/Shanghai` + 挂 `/etc/localtime` |
| 内存上限 | 512MB |
| 健康检查 | 每 30s 打 `/api/health`（无鉴权，返回 `{ok,sha,at}`） |
| 种子数据 | 首次空库自动灌 6 篇示例文章（`SITE_SEED=0` 可关） |
| 更新 | 复用工作台的 watchtower：每 24h 查 GHCR `latest`，digest 变了自动重建（本站只打标签、不起新 watchtower） |
| 停止信号 | tini 做 1 号进程，能干净收 SIGTERM |
