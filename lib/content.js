/* ============================================================
   站点文案（中 / 英）
   全部占位内容，用户改这一个文件就能改全站文字。
   ============================================================ */

export const LANGS = ['zh', 'en'];

export const site = {
  zh: {
    htmlLang: 'zh-CN',
    brand: '冷丶布丁',
    brandFull: '冷丶布丁',
    title: '冷丶布丁 · 全栈工程师，做 AI 基础设施',
    description:
      '冷丶布丁（Buding），全栈工程师，做 AI 基础设施。检索链路、推理服务、设计系统：把模型接进能长期跑的产品。',
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
      kicker: '全栈工程师 · AI 基础设施',
      title: '把模型接进产品',
      lede: [
        { t: '写 TypeScript，也跑推理服务。我的活是把一句模糊的需求，做成能在线上跑三个月、' },
        { t: '下一个接手的人半小时能看懂', strong: true },
        { t: '的东西。' },
      ],
      ctaPrimary: '看看做过什么',
      ctaGhost: '聊聊',
    },

    work: {
      num: '01',
      title: '作品',
      note: '4 个项目，最近三年',
      items: [
        {
          name: '向量检索网关',
          desc: '12M 文档的混合检索，三条召回并行，P99 压在 90ms',
          stack: 'Go · pgvector · Redis',
          year: '2025',
        },
        {
          name: '实时语音助手',
          desc: '端到端 400ms 的对话链路，打断和重连都能扛住',
          stack: 'TypeScript · WebRTC · Whisper',
          year: '2024',
        },
        {
          name: '组件库 Aperture',
          desc: '6 条产品线共用的一套设计令牌，84 个组件',
          stack: 'React · Tailwind · Storybook',
          year: '2024',
        },
        {
          name: '数据管道 Atlas',
          desc: '每天 3TB 的清洗与标注，失败任务自动重放',
          stack: 'Python · Airflow · ClickHouse',
          year: '2023',
        },
      ],
    },

    about: {
      num: '02',
      title: '关于',
      note: '',
      bio: [
        [
          { t: '三年后端，两年前端，最近两年在跟模型打交道。这些年我反复在意的其实是同一件事：' },
          { t: '这套东西，换个人接手，多久能看懂。', strong: true },
        ],
        [
          {
            t: '写代码之外会拍点照、跑半马、拆旧机械键盘。喜欢能长期维护的东西，不喜欢为了演示而好看的半成品。',
          },
        ],
      ],
      nowTitle: '现在（2026）',
      now: [
        { k: '在做', v: '面向研究者的文献工作台' },
        { k: '在学', v: 'Rust 异步运行时与 WASM 边界' },
        { k: '在读', v: '《Designing Data-Intensive Applications》第二遍' },
        { k: '状态', v: '接技术顾问与远程合作' },
      ],
      timeline: [
        {
          year: '2024 — 现在',
          title: 'AI 基础设施 · 独立开发',
          desc: '为两家早期团队搭检索与推理链路，从原型做到日均百万请求。',
        },
        {
          year: '2021 — 2024',
          title: '高级全栈工程师 · SaaS 公司',
          desc: '负责设计系统与多租户架构，把首屏从 3.4s 压到 0.9s。',
        },
        {
          year: '2019 — 2021',
          title: '后端工程师 · 电商平台',
          desc: '订单与库存服务。扛过两次大促，最忙的一天修了 17 个线上问题。',
        },
      ],
    },

    writing: {
      num: '03',
      title: '文章',
      note: '',
      empty: '还没有发布文章',
      emptyHint: '去后台写第一篇',
      readMore: '阅读全文',
      back: '全部文章',
      minRead: '分钟',
    },

    contact: {
      num: '04',
      title: '联系',
      note: '通常 24 小时内回',
      lede: '有想做的产品、卡住的技术问题，或者只是想说说话，都可以直接写信。',
      email: 'hi@lbuding.com',
      socials: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'X', href: 'https://x.com' },
        { label: '即刻', href: 'https://okjike.com' },
        { label: 'RSS', href: '/rss.xml' },
      ],
    },

    footer: {
      copy: '© 2026 冷丶布丁',
      meta: '上海 · GMT+8',
      login: '后台',
    },

    notFound: {
      code: '404',
      title: '这一页不在',
      desc: '可能是链接写错了，也可能是我把它删了。',
      back: '回首页',
    },
  },

  en: {
    htmlLang: 'en',
    brand: 'Buding',
    brandFull: 'Buding',
    title: 'Buding · Full-stack engineer, AI infrastructure',
    description:
      'Buding, a full-stack engineer working on AI infrastructure. Retrieval paths, inference services, design systems — getting models into products that keep running.',
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
      kicker: 'Full-stack engineer · AI infrastructure',
      title: 'Getting models into products',
      lede: [
        { t: 'I write TypeScript and I run inference services. My job is taking a vague requirement and making something that ' },
        { t: 'survives three months in production', strong: true },
        { t: ', and that the next person can understand in half an hour.' },
      ],
      ctaPrimary: 'See the work',
      ctaGhost: 'Say hello',
    },

    work: {
      num: '01',
      title: 'Work',
      note: '4 projects, last three years',
      items: [
        {
          name: 'Vector search gateway',
          desc: 'Hybrid retrieval over 12M documents, three recalls in parallel, P99 under 90ms',
          stack: 'Go · pgvector · Redis',
          year: '2025',
        },
        {
          name: 'Realtime voice agent',
          desc: 'A 400ms end-to-end conversation loop that survives barge-in and reconnects',
          stack: 'TypeScript · WebRTC · Whisper',
          year: '2024',
        },
        {
          name: 'Aperture design system',
          desc: 'One token set shared by 6 product lines, 84 components',
          stack: 'React · Tailwind · Storybook',
          year: '2024',
        },
        {
          name: 'Atlas data pipeline',
          desc: '3TB a day of cleaning and labeling, with failed jobs replayed automatically',
          stack: 'Python · Airflow · ClickHouse',
          year: '2023',
        },
      ],
    },

    about: {
      num: '02',
      title: 'About',
      note: '',
      bio: [
        [
          { t: 'Three years on the backend, two on the frontend, the last two working alongside models. The thing I keep coming back to is the same: ' },
          { t: 'how long does it take the next person to understand this?', strong: true },
        ],
        [
          {
            t: 'Outside of code I do some photography, run half marathons, and take apart old mechanical keyboards. I like things that hold up, and I do not like half-built demos that only look good on stage.',
          },
        ],
      ],
      nowTitle: 'Now (2026)',
      now: [
        { k: 'Building', v: 'A literature workbench for researchers' },
        { k: 'Learning', v: 'Rust async runtime and the WASM boundary' },
        { k: 'Reading', v: 'Designing Data-Intensive Applications, second pass' },
        { k: 'Open to', v: 'Technical advising and remote work' },
      ],
      timeline: [
        {
          year: '2024 — now',
          title: 'AI infrastructure · Independent',
          desc: 'Built retrieval and inference paths for two early-stage teams, from prototype to a million requests a day.',
        },
        {
          year: '2021 — 2024',
          title: 'Senior full-stack engineer · SaaS',
          desc: 'Owned the design system and multi-tenant architecture; cut first paint from 3.4s to 0.9s.',
        },
        {
          year: '2019 — 2021',
          title: 'Backend engineer · E-commerce',
          desc: 'Orders and inventory. Survived two peak sales events, fixed 17 production issues in one day at the worst of it.',
        },
      ],
    },

    writing: {
      num: '03',
      title: 'Writing',
      note: '',
      empty: 'Nothing published yet',
      emptyHint: 'Write the first one in the admin',
      readMore: 'Read',
      back: 'All posts',
      minRead: 'min read',
    },

    contact: {
      num: '04',
      title: 'Contact',
      note: 'Usually replies within 24h',
      lede: 'A product you want to build, a technical problem you are stuck on, or just want to talk — write to me.',
      email: 'hi@lbuding.com',
      socials: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'X', href: 'https://x.com' },
        { label: 'Jike', href: 'https://okjike.com' },
        { label: 'RSS', href: '/rss.xml' },
      ],
    },

    footer: {
      copy: '© 2026 Buding',
      meta: 'Shanghai · GMT+8',
      login: 'Admin',
    },

    notFound: {
      code: '404',
      title: 'Not here',
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
