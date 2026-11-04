/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,

  // 给 Docker 用：产出一个自包含的 .next/standalone（连最小 node_modules 一起打包）。
  // 镜像里就不必带整份依赖，也不需要源码。本地 `pnpm dev` 不受影响；
  // 本地若想用 `pnpm start` 会有 standalone 提示，生产统一走 `node server.js`（见 Dockerfile）。
  output: 'standalone',

  webpack: (config) => {
    // node:sqlite 是 Node 22.5+ 的内置模块，别让 webpack 去 bundle 它，
    // 运行时直接用 node 自带的实现（和「个人工作台」的做法一致）。
    config.externals = [...(config.externals || []), 'node:sqlite'];
    return config;
  },
};
export default nextConfig;
