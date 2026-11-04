# 个人网站 —— 生产镜像
#
# 三阶段：装依赖 → 构建 → 只留运行需要的东西。
# 最终镜像约 250MB，不含源码、不含 devDependencies。
#
# 构建在 GitHub Actions 的原生 arm64 runner 上做（NAS 是 arm64），
# 不要跨架构猜，node:sqlite 是内置模块、和架构强相关。
# 默认用 Node 24 的滚动标签，保证 tag 一定存在。
ARG NODE_VERSION=24-alpine

# 构建时把提交 sha 塞进镜像，/api/health 会原样返回，
# 这样你在 NAS 上跑 curl localhost:3100/api/health 就知道更新到哪一版了。
ARG SITE_SHA=dev

# ---------- 1. 依赖 ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# libc6-compat 是 Next 在 alpine 上跑 SWC 的前提
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate \
 && pnpm install --frozen-lockfile

# ---------- 2. 构建 ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate \
 && NODE_OPTIONS='--max-old-space-size=1024' pnpm build

# ---------- 3. 运行 ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
# 全局 ARG 要在每个 stage 里重新声明一次才能用
ARG SITE_SHA=dev

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3100 \
    HOSTNAME=0.0.0.0 \
    DB_PATH=/data/site.db \
    SITE_SHA=${SITE_SHA}

RUN apk add --no-cache libc6-compat tini su-exec \
 && addgroup -g 1001 -S nodejs \
 && adduser -u 1001 -S nextjs -G nodejs

# standalone 里已经带了一份最小 node_modules，不用再装依赖
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 入口脚本先以 root 修 /data 的属主，再降到 nextjs 跑应用。
# 原因：NAS 图形界面建的宿主机目录是 root 的，不改属主首次建库就 EACCES。
COPY --chown=root:root docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 数据放卷里，容器重建不丢（site.db + wal/shm）
RUN mkdir -p /data && chown -R nextjs:nodejs /data
VOLUME ["/data"]

EXPOSE 3100

# 健康检查直接打应用自己的 /api/health（无鉴权）
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3100)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# tini 做 1 号进程，容器能干净地收到 SIGTERM。
# 入口脚本以 root 起（这样才有权限 chown /data），最后 exec su-exec 降权。
USER root
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
