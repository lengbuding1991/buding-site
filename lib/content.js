/* ============================================================
   站点文案（中 / 英）
   全部占位内容，用户改这一个文件就能改全站文字。
   ============================================================ */

export const LANGS = ['zh', 'en'];

export const site = {
  zh: {
    htmlLang: 'zh-CN',
    brand: 'BD // v3.0',
    brandFull: '冷丶布丁',
    title: '冷丶布丁 · 全栈 & AI 基础设施',
    description:
      '冷丶布丁（Buding）— 全栈工程师，专注 AI 基础设施。在模型和产品之间搭桥：推理链路、检索系统、设计系统。',
    nav: [
      { href: '#work', label: '作品' },
      { href: '#about', label: '关于' },
      { href: '#writing', label: '文章' },
      { href: '#contact', label: '联系' },
    ],
    langLabel: 'EN',
    langHref: '/en',
    themeToLight: '浅色',
    themeToDark: '深色',

    hero: {
      kicker: '// 全栈工程师 · AI 基础设施',
      name: '冷丶布丁',
      latin: 'BUDING',
      lede: [
        { t: '在 ' },
        { t: '模型', strong: true },
        { t: ' 和 ' },
        { t: '产品', strong: true },
        { t: ' 之间搭桥。写 TypeScript，跑推理服务，把一句模糊的需求翻译成能在线上跑三个月的东西。' },
      ],
      ctaPrimary: '查看作品',
      ctaGhost: '聊聊合作',
    },

    panel: {
      head: 'System.Status',
      live: '● LIVE',
      rows: [
        { k: 'Local', v: 'clock' },
        { k: 'Base', v: '31.2304°N 121.4737°E' },
        { k: 'Role', v: 'Full-stack / AI' },
        { k: 'Stack', v: 'TS · Go · Python' },
      ],
      statusKey: 'Status',
      statusValue: 'OPEN TO WORK',
    },

    marquee: ['Build', 'Ship', 'Measure', 'Iterate', 'Repeat'],

    work: {
      num: '01',
      title: 'Selected Work',
      note: '04 Projects',
      items: [
        {
          name: '向量检索网关',
          desc: '给 12M 文档做混合检索的网关层，P99 延迟压在 90ms 以内',
          stack: 'Go / pgvector / Redis',
          year: '2025',
          cap: 'Vector search · 12M docs',
        },
        {
          name: '实时语音助手',
          desc: '端到端 400ms 延迟的对话链路，打断与重连都能扛',
          stack: 'TypeScript / WebRTC / Whisper',
          year: '2024',
          cap: 'Realtime voice · 400ms',
        },
        {
          name: '组件库 Aperture',
          desc: '被 6 条产品线共用的设计系统，84 个组件，一套令牌',
          stack: 'React / Tailwind / Storybook',
          year: '2024',
          cap: 'Design system · 84 components',
        },
        {
          name: '数据管道 Atlas',
          desc: '日均 3TB 的清洗与标注流水线，失败任务自动重放',
          stack: 'Python / Airflow / ClickHouse',
          year: '2023',
          cap: 'Data pipeline · 3TB/day',
        },
      ],
    },

    about: {
      num: '02',
      title: 'About',
      note: '轨迹 / 现在',
      bio: [
        [
          { t: '做过三年 ' },
          { t: '后端', strong: true },
          { t: '，两年 ' },
          { t: '前端', strong: true },
          { t: '，最近两年在跟模型打交道。我比较在意一件事：一个系统能不能被下一个接手的人在三十分钟内看懂。' },
        ],
        [
          {
            t: '写代码之外，会做一点摄影、跑半马、拆旧机械键盘。喜欢能长期维护的东西，不喜欢为了演示好看的半成品。',
          },
        ],
      ],
      nowTitle: 'Now / 2026',
      now: [
        { k: 'BUILD', v: '在做一个面向研究者的文献工作台' },
        { k: 'LEARN', v: 'Rust 异步运行时与 WASM 边界' },
        { k: 'READ', v: '《Designing Data-Intensive Applications》二刷' },
        { k: 'OPEN', v: '接受技术顾问与远程合作' },
      ],
      timeline: [
        {
          year: '2024 — NOW',
          title: 'AI 基础设施 · 独立开发',
          desc: '为两家早期团队搭建检索与推理链路，从原型到日均百万请求。',
        },
        {
          year: '2021 — 2024',
          title: '高级全栈工程师 · 某 SaaS 公司',
          desc: '负责设计系统与多租户架构，把首屏从 3.4s 压到 0.9s。',
        },
        {
          year: '2019 — 2021',
          title: '后端工程师 · 某电商平台',
          desc: '订单与库存服务，扛过两次大促，最忙的时候一天修 17 个线上问题。',
        },
      ],
    },

    writing: {
      num: '03',
      title: 'Writing',
      note: '随手写点',
      empty: '还没有发布文章',
      emptyHint: '去后台写第一篇',
      readMore: '阅读全文',
      back: '全部文章',
      minRead: '分钟',
    },

    contact: {
      num: '04',
      title: 'Get in touch',
      note: '通常在 24h 内回复',
      lede: '有想做的产品、卡住的技术问题，或者只是想聊聊，都欢迎直接写信。',
      email: 'hi@lbuding.com',
      socials: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'X / Twitter', href: 'https://x.com' },
        { label: '即刻', href: 'https://okjike.com' },
        { label: 'RSS', href: '/rss.xml' },
      ],
    },

    footer: {
      copy: '© 2026 冷丶布丁 — 手写的',
      meta: 'Shanghai · GMT+8',
      login: '后台',
    },

    notFound: {
      code: '404 / NOT FOUND',
      title: '这里什么都没有',
      desc: '可能是链接写错了，也可能是我把它删了。',
      back: '回到首页',
    },
  },

  en: {
    htmlLang: 'en',
    brand: 'BD // v3.0',
    brandFull: 'Buding',
    title: 'Buding · Full-stack & AI Infrastructure',
    description:
      'Buding — full-stack engineer focused on AI infrastructure. Bridging models and products: inference pipelines, retrieval systems, design systems.',
    nav: [
      { href: '#work', label: 'Work' },
      { href: '#about', label: 'About' },
      { href: '#writing', label: 'Writing' },
      { href: '#contact', label: 'Contact' },
    ],
    langLabel: '中文',
    langHref: '/',
    themeToLight: 'Light',
    themeToDark: 'Dark',

    hero: {
      kicker: '// Full-stack engineer · AI infrastructure',
      name: 'Buding',
      latin: '冷丶布丁',
      lede: [
        { t: 'Bridging ' },
        { t: 'models', strong: true },
        { t: ' and ' },
        { t: 'products', strong: true },
        { t: '. I write TypeScript, run inference services, and turn a vague requirement into something that survives three months in production.' },
      ],
      ctaPrimary: 'View work',
      ctaGhost: "Let's talk",
    },

    panel: {
      head: 'System.Status',
      live: '● LIVE',
      rows: [
        { k: 'Local', v: 'clock' },
        { k: 'Base', v: '31.2304°N 121.4737°E' },
        { k: 'Role', v: 'Full-stack / AI' },
        { k: 'Stack', v: 'TS · Go · Python' },
      ],
      statusKey: 'Status',
      statusValue: 'OPEN TO WORK',
    },

    marquee: ['Build', 'Ship', 'Measure', 'Iterate', 'Repeat'],

    work: {
      num: '01',
      title: 'Selected Work',
      note: '04 Projects',
      items: [
        {
          name: 'Vector Search Gateway',
          desc: 'Hybrid retrieval gateway over 12M documents, P99 under 90ms',
          stack: 'Go / pgvector / Redis',
          year: '2025',
          cap: 'Vector search · 12M docs',
        },
        {
          name: 'Realtime Voice Agent',
          desc: 'End-to-end 400ms conversational loop that survives barge-in and reconnects',
          stack: 'TypeScript / WebRTC / Whisper',
          year: '2024',
          cap: 'Realtime voice · 400ms',
        },
        {
          name: 'Aperture Design System',
          desc: '84 components on one token set, shared by 6 product lines',
          stack: 'React / Tailwind / Storybook',
          year: '2024',
          cap: 'Design system · 84 components',
        },
        {
          name: 'Atlas Data Pipeline',
          desc: '3TB/day of cleaning and labeling, with automatic replay for failed jobs',
          stack: 'Python / Airflow / ClickHouse',
          year: '2023',
          cap: 'Data pipeline · 3TB/day',
        },
      ],
    },

    about: {
      num: '02',
      title: 'About',
      note: 'Track / Now',
      bio: [
        [
          { t: 'Three years on the ' },
          { t: 'backend', strong: true },
          { t: ', two on the ' },
          { t: 'frontend', strong: true },
          { t: ', the last two working alongside models. One thing I keep coming back to: can the next person understand this system in thirty minutes?' },
        ],
        [
          {
            t: 'Outside of code I do some photography, run half marathons, and take apart old mechanical keyboards. I like things that hold up; I do not like half-built demos that only look good on stage.',
          },
        ],
      ],
      nowTitle: 'Now / 2026',
      now: [
        { k: 'BUILD', v: 'A literature workbench for researchers' },
        { k: 'LEARN', v: 'Rust async runtime and the WASM boundary' },
        { k: 'READ', v: 'Designing Data-Intensive Applications, second pass' },
        { k: 'OPEN', v: 'Taking on technical advising and remote work' },
      ],
      timeline: [
        {
          year: '2024 — NOW',
          title: 'AI Infrastructure · Independent',
          desc: 'Built retrieval and inference pipelines for two early-stage teams, from prototype to a million requests a day.',
        },
        {
          year: '2021 — 2024',
          title: 'Senior Full-stack Engineer · SaaS',
          desc: 'Owned the design system and multi-tenant architecture; cut first paint from 3.4s to 0.9s.',
        },
        {
          year: '2019 — 2021',
          title: 'Backend Engineer · E-commerce',
          desc: 'Orders and inventory. Survived two peak sales events, fixed 17 production issues in one day at the worst of it.',
        },
      ],
    },

    writing: {
      num: '03',
      title: 'Writing',
      note: 'Notes',
      empty: 'Nothing published yet',
      emptyHint: 'Write the first one in the admin',
      readMore: 'Read',
      back: 'All posts',
      minRead: 'min read',
    },

    contact: {
      num: '04',
      title: 'Get in touch',
      note: 'Usually replies within 24h',
      lede: 'A product you want to build, a technical problem you are stuck on, or just want to talk — write to me.',
      email: 'hi@lbuding.com',
      socials: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'X / Twitter', href: 'https://x.com' },
        { label: 'Jike', href: 'https://okjike.com' },
        { label: 'RSS', href: '/rss.xml' },
      ],
    },

    footer: {
      copy: '© 2026 Buding — built by hand',
      meta: 'Shanghai · GMT+8',
      login: 'Admin',
    },

    notFound: {
      code: '404 / NOT FOUND',
      title: 'Nothing here',
      desc: 'Either the link is wrong, or I deleted it.',
      back: 'Back home',
    },
  },
};

export function t(lang) {
  return site[lang] || site.zh;
}

export function otherLang(lang) {
  return lang === 'zh' ? 'en' : 'zh';
}
