import { listPublished } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const origin = process.env.SITE_URL || 'https://lbuding.com';
  let posts = [];
  try {
    posts = [...listPublished('zh', 200), ...listPublished('en', 200)];
  } catch {}

  const urls = [
    `  <url><loc>${origin}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${origin}/en</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    ...posts.map((p) => {
      const d = new Date(p.updated_at || p.published_at).toISOString().slice(0, 10);
      return `  <url><loc>${origin}${p.lang === 'en' ? '/en' : ''}/posts/${p.slug}</loc><lastmod>${d}</lastmod><priority>0.7</priority></url>`;
    }),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
