import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: false,
  mangle: false,
});

/* 极简清洗：只允许 markdown 自带的正常标签，
   去掉 <script>、<iframe>、on* 属性等。
   后台只有我一个人能写，这是防御性兜底，不是多租户安全边界。 */
export function renderMarkdown(md) {
  const raw = marked.parse(md || '');
  return String(raw)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

export function readingTime(md) {
  const text = String(md || '').replace(/```[\s\S]*?```/g, '').replace(/[#>*_`\-\[\]()]/g, '');
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  // 中文按 380 字/分钟，英文按 220 词/分钟
  const minutes = cjk / 380 + words / 220;
  return Math.max(1, Math.round(minutes));
}
