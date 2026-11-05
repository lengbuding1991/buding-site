/* 首屏的图：混合检索网关。
   画的是线上真跑着的那条链路，不是装饰。
   宽版是四列流；窄版收成两列，小屏上字才不糊。 */

const COPY = {
  zh: {
    title: '混合检索链路',
    meta: '12M docs · v2',
    nodes: {
      query: ['查询', '解析 · 16ms'],
      sparse: ['BM25 召回', '倒排 · 12M'],
      dense: ['向量召回', 'HNSW · 768d'],
      filter: ['元数据过滤', '租户 · 时间窗'],
      fusion: ['RRF 融合', 'k = 60'],
      rerank: ['交叉重排', 'top 100'],
      topk: ['返回', 'top 20'],
    },
    latencyTitle: '耗时构成',
    rows: [
      ['解析', 4],
      ['BM25 召回', 22],
      ['向量召回', 28],
      ['融合', 6],
      ['交叉重排', 30],
    ],
    total: '合计 90ms · P99',
    caption:
      '三条召回并行跑，融合之后只重排前 100 条，剩下的直接截断。延迟的大头在重排，不在召回。',
  },
  en: {
    title: 'Hybrid retrieval path',
    meta: '12M docs · v2',
    nodes: {
      query: ['Query', 'parse · 16ms'],
      sparse: ['BM25 recall', 'inverted · 12M'],
      dense: ['Dense recall', 'HNSW · 768d'],
      filter: ['Metadata filter', 'tenant · window'],
      fusion: ['RRF fusion', 'k = 60'],
      rerank: ['Cross-encoder', 'top 100'],
      topk: ['Return', 'top 20'],
    },
    latencyTitle: 'Where the time goes',
    rows: [
      ['Parse', 4],
      ['BM25 recall', 22],
      ['Dense recall', 28],
      ['Fusion', 6],
      ['Rerank', 30],
    ],
    total: 'Total 90ms · P99',
    caption:
      'Three recalls run in parallel. Only the top 100 are reranked, the rest are cut. Most of the latency sits in reranking, not in recall.',
  },
};

const NODE_H = 48;
const BAR_MAX_MS = 32;

/* 宽版：查询 → 三条召回 → 融合 → 重排 → 返回 */
const WIDE = {
  w: 660, h: 412,
  a: { x: 0, y: 124, w: 140 },
  b: [
    { x: 180, y: 52, w: 180 },
    { x: 180, y: 124, w: 180 },
    { x: 180, y: 196, w: 180 },
  ],
  c: { x: 400, y: 124, w: 112 },
  d: { x: 552, y: 124, w: 108 },
  extra: { x: 400, y: 196, w: 112 },
  barX: 130, barMax: 380, barY: 282, barGap: 26,
};

/* 窄版：两列，导线走左侧一条主干 */
const NARROW = {
  w: 360, h: 474,
  a: { x: 0, y: 36, w: 152 },
  b: [
    { x: 44, y: 104, w: 150 },
    { x: 44, y: 176, w: 150 },
    { x: 44, y: 248, w: 150 },
  ],
  c: { x: 210, y: 176, w: 140 },
  d: { x: 210, y: 248, w: 140 },
  extra: { x: 210, y: 320, w: 140 },
  spine: 20,
  barX: 84, barMax: 180, barY: 382, barGap: 18,
};

const mid = (box) => box.y + NODE_H / 2;

function Node({ box, label, sub, lead }) {
  return (
    <g className="node">
      <rect
        x={box.x} y={box.y} width={box.w} height={NODE_H} rx="8"
        stroke={lead ? 'var(--accent)' : undefined}
      />
      <text className="n-title" x={box.x + 14} y={box.y + 21} fill={lead ? 'var(--accent)' : undefined}>
        {label}
      </text>
      <text className="n-sub" x={box.x + 14} y={box.y + 36}>
        {sub}
      </text>
    </g>
  );
}

function Diagram({ box, c, narrow }) {
  const n = c.nodes;
  const aMid = mid(box.a);
  const cMid = mid(box.c);
  const lastRow = c.rows[c.rows.length - 1][0];

  /* 查询 → 三条召回 */
  const intoB = (b) =>
    narrow
      ? `M${box.spine} ${box.a.y + NODE_H} V${mid(b)} H${b.x}`
      : `M${box.a.x + box.a.w} ${aMid} H${(box.a.x + box.a.w + b.x) / 2} V${mid(b)} H${b.x}`;

  /* 三条召回 → 融合 */
  const fromB = (b) =>
    narrow
      ? `M${b.x + b.w} ${mid(b)} H${box.c.x - 6} V${cMid} H${box.c.x}`
      : `M${b.x + b.w} ${mid(b)} H${(b.x + b.w + box.c.x) / 2} V${cMid} H${box.c.x}`;

  /* 融合 → 重排 → 返回。宽版横着走，窄版竖着走 */
  const tail = narrow
    ? `M${box.c.x + box.c.w / 2} ${box.c.y + NODE_H} V${box.d.y}`
    : `M${box.c.x + box.c.w} ${cMid} H${box.d.x}`;
  const down = narrow
    ? `M${box.d.x + box.d.w / 2} ${box.d.y + NODE_H} V${box.extra.y}`
    : `M${box.extra.x + box.extra.w / 2} ${box.c.y + NODE_H} V${box.extra.y}`;

  return (
    <svg
      className={`blueprint ${narrow ? 'bp-narrow' : 'bp-wide'}`}
      viewBox={`0 0 ${box.w} ${box.h}`}
      role="img"
      aria-label={c.title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text className="bp-title" x="0" y="12">{c.title}</text>
      <text className="bp-meta" x={box.w} y="12" textAnchor="end">{c.meta}</text>
      <line className="axis" x1="0" y1="26" x2={box.w} y2="26" />

      {box.b.map((b, i) => <path className="wire" key={`in${i}`} d={intoB(b)} />)}
      {box.b.map((b, i) => <path className="wire" key={`out${i}`} d={fromB(b)} />)}
      <path className="wire" d={tail} />
      <path className="wire" d={down} />

      {/* 数据在线上跑：细虚线沿导线流动，示意这条链路是活的 */}
      {box.b.map((b, i) => (
        <path className="signal" key={`sin${i}`} d={intoB(b)} style={{ animationDelay: `${i * 900}ms` }} />
      ))}
      {box.b.map((b, i) => (
        <path className="signal" key={`sout${i}`} d={fromB(b)} style={{ animationDelay: `${1400 + i * 700}ms` }} />
      ))}
      <path className="signal" d={tail} style={{ animationDelay: '3000ms' }} />
      <path className="signal" d={down} style={{ animationDelay: '3400ms' }} />

      <Node box={box.a} label={n.query[0]} sub={n.query[1]} />
      <Node box={box.b[0]} label={n.sparse[0]} sub={n.sparse[1]} />
      <Node box={box.b[1]} label={n.dense[0]} sub={n.dense[1]} />
      <Node box={box.b[2]} label={n.filter[0]} sub={n.filter[1]} />
      <Node box={box.c} label={n.fusion[0]} sub={n.fusion[1]} />
      <Node box={box.d} label={n.rerank[0]} sub={n.rerank[1]} lead />
      <Node box={box.extra} label={n.topk[0]} sub={n.topk[1]} />

      {/* 耗时构成 */}
      <text className="bp-meta" x="0" y={box.barY - 14}>{c.latencyTitle}</text>
      {c.rows.map(([name, ms], i) => {
        const y = box.barY + i * box.barGap;
        const w = (ms / BAR_MAX_MS) * box.barMax;
        const lead = name === lastRow;
        return (
          <g key={name}>
            <text className="legend" x="0" y={y + 6}>{name}</text>
            <rect className="seg" x={box.barX} y={y} width={w} height="6" rx="3"
              fill={lead ? 'var(--accent)' : undefined} />
            <text className="bp-meta" x={box.w} y={y + 6} textAnchor="end"
              style={{ fontVariantNumeric: 'tabular-nums' }}>
              {ms}ms
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Blueprint({ lang = 'zh' }) {
  const c = COPY[lang] || COPY.zh;

  return (
    <figure className="fig">
      <Diagram box={WIDE} c={c} />
      <Diagram box={NARROW} c={c} narrow />

      <figcaption>
        <span className="dim">{c.total}</span>
        {c.caption}
      </figcaption>
    </figure>
  );
}
