export const dynamic = 'force-static';

export function GET() {
  const origin = process.env.SITE_URL || 'https://lbuding.com';
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${origin}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
