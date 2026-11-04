/* ============================================================
   种子数据：首次建库（posts 表为空）时自动灌入的示例文章。
   用 SITE_SEED=0 可禁用（首次部署想要空库时）。
   这些是占位内容，用户上线后可在后台编辑/删除。
   ============================================================ */

const now = new Date();
const iso = (d) => d.toISOString();
const dayAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return iso(d); };

export const seedPosts = [
  {
    slug: 'why-i-rewrote-the-gateway',
    lang: 'zh',
    title: '我为什么把检索网关重写了两遍',
    summary: '第一版跑了八个月，第二版只用了三个周末。中间差的不是技术，是对边界的判断。',
    tag: 'ENGINEERING',
    status: 'published',
    published_at: dayAgo(3),
    body: `第一版网关是赶出来的。需求很急，我用了最熟的写法：一个 HTTP 服务，三个中间件，检索、重排、熔断各占一层。

它跑了八个月，没出过大事。但它一直在变慢。

## 慢在哪

问题不在单次查询。单次查询 P50 是 34ms，看起来很正常。问题在**尾延迟**：P99 从 90ms 涨到了 640ms，而 P99.9 直接冲到 3 秒。

尾延迟是检索系统里最难缠的东西，因为：

- 它不在平均值里，监控大盘看不出来；
- 它只在负载高的时候出现，压测复现不了；
- 一旦有一个请求卡住，它占着的连接就不会释放。

我花了两个礼拜才确认根因：**重排模型是同步调用的**。也就是说，一个请求要等检索做完，再等模型打分做完，才能返回。模型那边偶发的冷启动，直接把整个请求拖死。

## 第二版做了什么

第二版的核心改动只有一条：**把同步等待改成有预算的并发**。

\`\`\`ts
// 旧：串行
const docs = await retrieve(q);
const ranked = await rerank(docs);
return ranked;

// 新：给每一步一个预算，超了就降级
const docs = await withTimeout(retrieve(q), 40);
const ranked = await withTimeout(rerank(docs), 45).catch(() => docs);
return ranked;
\`\`\`

听起来简单，但它带来了一串连锁改动：

1. **降级必须是产品决策，不是工程决策。** 重排超时的时候，返回未重排的结果，还是返回上一批缓存？我选了前者，因为检索结果本身是对的，只是排序差一点。
2. **超时阈值要从数据里来。** 我用了一周的线上采样定了 40ms 和 45ms 这两个数，不是拍的。
3. **监控要按阶段拆分。** 只看总延迟没有意义，必须能回答"是检索慢了还是重排慢了"。

## 结果

P99 从 640ms 回到 92ms，P99.9 从 3 秒回到 210ms。

但我觉得更有价值的收获是第二条：**超时阈值要从数据里来**。这件事我在第一版里完全没做，因为当时觉得"先跑起来再说"。八个月之后，为一个本该在第一天就量出来的数字，我付了两个礼拜的排查成本。

> 先跑起来是对的。但要记得回来量那个数字。
`,
  },
  {
    slug: 'design-system-as-a-product',
    lang: 'zh',
    title: '设计系统不是组件库，它是个产品',
    summary: '84 个组件、6 条产品线、一套令牌。我们做对的只有一件事：把使用者当用户。',
    tag: 'DESIGN',
    status: 'published',
    published_at: dayAgo(11),
    body: `组件库的失败方式很统一：第一个版本大家很兴奋，第二个版本开始有人 fork，第三个版本没人升级。

我们那套叫 Aperture，撑了三年，还在被 6 条产品线用。回头看，做对的事情不多，但有一件特别关键。

## 关键的那件事

我们把设计系统当成**有用户的产品**，而不是**供人查阅的规范**。

具体来说，有三个动作：

### 一、每个组件都有"为什么"

不是"这个按钮有 primary 和 secondary 两种"，而是"primary 只能一个页面出现一次，因为它代表这个页面唯一的主要动作"。前者是 API 文档，后者是决策依据。

当设计评审出现分歧时，我们能翻出这条写下来的理由，而不是靠谁嗓门大。

### 二、升级路径比功能重要

我们有一条硬规矩：**任何 breaking change 必须同时提供 codemod**。

这条规矩让我们推掉了很多"更优雅"的重构。但它换来的是：三年里，没有任何一条产品线因为升级组件库而延期。

### 三、把"不做什么"写下来

我们的文档里有一节叫 **Out of scope**，列了 14 条：

- 不做布局组件（每个产品线的布局差异太大）
- 不做业务组件（订单卡片、用户头像组，那些属于产品线）
- 不做主题引擎（令牌就够，别造 DSL）

这一节被引用得最多。因为它省掉了无数次"你们能不能加个 XX"的讨论。

## 一句总结

组件库解决的是"重复写 UI"。设计系统解决的是"重复做同一个决定"。

后者才是成本的大头。
`,
  },
  {
    slug: 'notes-on-running-inference',
    lang: 'zh',
    title: '跑推理服务的几个反直觉结论',
    summary: 'GPU 利用率不是越高越好，批大小不是越大越好，缓存不是越热越好。',
    tag: 'INFRA',
    status: 'published',
    published_at: dayAgo(24),
    body: `这两年帮两个团队搭过推理链路，踩了一些坑。有几条结论和我一开始的直觉是反的，记下来。

## 一、GPU 利用率不是越高越好

直觉上，GPU 闲着就是浪费钱。但真实情况是：**利用率 85% 的系统，尾延迟会比 60% 的系统差三倍以上。**

原因是排队。利用率越高，队列越容易堆积，而尾延迟对队列长度是超线性增长的。

我们最后把目标定在 65%，看起来"浪费"了三分之一算力，但 P99 稳定在预算内，而且不需要为突发流量准备太多冗余。

## 二、批大小不是越大越好

批处理能摊薄单次开销，但会引入等待。等待时间和批大小是正相关的。

我们的做法是**按时间和大小双阈值触发**：凑够 8 个请求，或者等满 12ms，谁先到用谁。

这个 12ms 是从延迟预算倒推的：端到端 400ms，留给推理的预算是 150ms，批等待最多吃掉 8%。

## 三、缓存不是越热越好

KV cache 命中率高，听起来是好事。但如果缓存的是**很少被复用的长上下文**，它会挤占显存，让新请求排队。

我们加了一条淘汰策略：按"复用次数 / 占用显存"排序，低效的先走。命中率从 91% 掉到 78%，但吞吐涨了 40%。

## 四、最容易被忽略的：冷启动

模型冷启动要 40 秒。这 40 秒里，所有打到这个实例的请求都会超时。

我们的解法是**预热探针**：新实例起来之后，先灌 20 条真实请求（不进用户链路），确认 P95 达标才摘掉"未就绪"标记。

听起来是常识，但我们在第三周才发现没做。

---

这几条没有一条是"高级技巧"。它们都是**把监控做细之后才看得见的东西**。
`,
  },
  {
    slug: 'en-why-i-rewrote-the-gateway',
    lang: 'en',
    title: 'Why I rewrote the retrieval gateway twice',
    summary: 'The first version ran for eight months. The second took three weekends. The difference was not skill.',
    tag: 'ENGINEERING',
    status: 'published',
    published_at: dayAgo(3),
    body: `The first gateway was rushed. The requirement was urgent, so I used what I knew best: one HTTP service, three middleware layers, retrieval and reranking and circuit breaking each in its own box.

It ran for eight months without a major incident. But it kept getting slower.

## Where the slowness was

Not in a single query. P50 was 34ms, which looks fine. The problem was **tail latency**: P99 drifted from 90ms to 640ms, and P99.9 hit three seconds.

Tail latency is the hardest thing in retrieval systems, because:

- it does not show up in averages, so dashboards look healthy;
- it only appears under load, so load tests miss it;
- once a request stalls, it holds its connection and does not let go.

It took me two weeks to confirm the cause: **the reranker was called synchronously.** Every request waited for retrieval, then waited again for scoring. An occasional cold start on the model side dragged the whole request down.

## What the second version did

One core change: **replace synchronous waiting with budgeted concurrency.**

\`\`\`ts
// Before: serial
const docs = await retrieve(q);
const ranked = await rerank(docs);
return ranked;

// After: a budget per step, degrade on overrun
const docs = await withTimeout(retrieve(q), 40);
const ranked = await withTimeout(rerank(docs), 45).catch(() => docs);
return ranked;
\`\`\`

Sounds simple. It forced a chain of other changes:

1. **Degradation is a product decision, not an engineering one.** When reranking times out, do we return unranked results or the previous cache? I chose the former: the documents are correct, only the order is worse.
2. **Thresholds must come from data.** I spent a week sampling production traffic to land on 40ms and 45ms. They are not guesses.
3. **Monitoring must be split by phase.** Total latency tells you nothing. You must be able to answer "was it retrieval or reranking".

## Outcome

P99 went from 640ms back to 92ms. P99.9 from three seconds to 210ms.

But the more valuable lesson is the second one: **thresholds must come from data**. I skipped that entirely in v1, because I wanted to ship. Eight months later I paid two weeks of investigation for a number I should have measured on day one.

> Shipping first is right. Just remember to come back and measure the number.
`,
  },
  {
    slug: 'en-design-system-as-a-product',
    lang: 'en',
    title: 'A design system is a product, not a component library',
    summary: '84 components, 6 product lines, one token set. We got exactly one thing right.',
    tag: 'DESIGN',
    status: 'published',
    published_at: dayAgo(11),
    body: `Component libraries fail in a predictable way: everyone is excited about v1, someone forks it during v2, and nobody upgrades past v3.

Ours was called Aperture. It lasted three years and six product lines still run on it. Looking back, we did not get much right, but one thing mattered more than the rest.

## The one thing

We treated the design system as **a product with users**, not **a spec people consult**.

Three concrete habits came out of that.

### 1. Every component has a "why"

Not "the button has primary and secondary variants", but "primary appears at most once per page, because it marks the single main action".

The first is API documentation. The second is a decision you can point at when design review turns into an argument about taste.

### 2. Upgrade paths matter more than features

One hard rule: **every breaking change ships with a codemod.**

That rule made us reject a lot of "more elegant" rewrites. In exchange, in three years no product line ever slipped a deadline because of a design system upgrade.

### 3. Write down what you do not do

Our docs had an **Out of scope** section with 14 entries:

- no layout components (every product line lays out differently);
- no business components (order cards, avatar groups — those belong to the product);
- no theme engine (tokens are enough, do not build a DSL).

That section was the most-linked page in the entire system. It killed hundreds of "could you just add X" conversations before they started.

## In one line

A component library removes repeated UI work. A design system removes repeated *decisions*.

The second one is where the cost actually lives.
`,
  },
  {
    slug: 'en-notes-on-running-inference',
    lang: 'en',
    title: 'Counterintuitive lessons from running inference services',
    summary: 'Higher GPU utilization is not better. Bigger batches are not better. A hotter cache is not better.',
    tag: 'INFRA',
    status: 'published',
    published_at: dayAgo(24),
    body: `I have helped two teams build inference pipelines over the last two years. A few conclusions came out opposite to my intuition, so I wrote them down.

## 1. Higher GPU utilization is not better

The intuition: an idle GPU is wasted money. The reality: **a system at 85% utilization has tail latency three times worse than one at 60%.**

The cause is queueing. The higher the utilization, the more the queue grows, and tail latency grows superlinearly with queue length.

We settled on 65% as a target. It looks like we are wasting a third of the compute, but P99 stays inside budget and we do not need much headroom for spikes.

## 2. Bigger batches are not better

Batching amortizes per-call overhead, but it introduces waiting, and waiting grows with batch size.

We trigger on **two thresholds, time and size**: eight requests, or 12ms, whichever comes first.

The 12ms is derived backwards from the latency budget: 400ms end to end, 150ms reserved for inference, so batch waiting may consume at most 8% of that.

## 3. A hotter cache is not better

A high KV-cache hit rate sounds good. But if what you cache is **long context that is rarely reused**, it occupies VRAM and makes new requests queue.

We added an eviction policy sorted by "reuse count per byte of VRAM", evicting the least efficient first. Hit rate fell from 91% to 78%, throughput rose 40%.

## 4. The most overlooked one: cold start

A model cold start takes 40 seconds. During those 40 seconds, every request routed to that instance times out.

Our fix was a **warmup probe**: when a new instance comes up, feed it 20 real requests (outside the user path) and only clear the "not ready" flag once P95 is inside budget.

Sounds obvious. We discovered in week three that we had never done it.

---

None of these are advanced tricks. They are all things you only see once your monitoring is fine-grained enough.
`,
  },
];

export function seedInto(db) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO posts (slug, lang, title, summary, body, tag, status, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  let added = 0;
  for (const p of seedPosts) {
    const info = insert.run(p.slug, p.lang, p.title, p.summary, p.body, p.tag, p.status, p.published_at, p.published_at, p.published_at);
    if (info.changes > 0) added++;
  }
  return added;
}
