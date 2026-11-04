import { listPublished } from '@/lib/db';
import { t } from '@/lib/content';

export const dynamic = 'force-dynamic';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const origin = process.env.SITE_URL || 'https://lbuding.com';
  let zh = [];
  let en = [];
  try { zh = listPublished('zh', 50); } catch {}
  try { en = listPublished('en', 50); } catch {}

  const items = [...zh, ...en]
    .sort((a, b) =>
      String(b.published_at || b.updated_at).localeCompare(String(a.published_at || a.updated_at))
    )
    .map((p) => {
      const url = `${origin}${p.lang === 'en' ? '/en' : ''}/posts/${p.slug}`;
      const date = new Date(p.published_at || p.updated_at).toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(p.summary)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(t('zh').brandFull)}</title>
    <link>${origin}</link>
    <description>${esc(t('zh').description)}</description>
    <language>zh-cn</language>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
