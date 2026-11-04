import { listPublished } from '@/lib/db';
import { t } from '@/lib/content';
import HomePage from '@/components/HomePage';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  const c = t('en');
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: '/en', languages: { 'zh-CN': '/', en: '/en' } },
    openGraph: { title: c.title, description: c.description, locale: 'en_US', type: 'website' },
  };
}

export default function Page() {
  let posts = [];
  try { posts = listPublished('en', 20); } catch (e) { console.error('[db]', e.message); }
  return <HomePage lang="en" posts={posts} />;
}
