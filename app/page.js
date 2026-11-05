import { listPublished } from '@/lib/db';
import { t } from '@/lib/content';
import { readVersion } from '@/lib/version';
import HomePage from '@/components/HomePage';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  const c = t('zh');
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: '/', languages: { 'zh-CN': '/', en: '/en' } },
    openGraph: { title: c.title, description: c.description, locale: 'zh_CN', type: 'website' },
  };
}

export default function Page() {
  let posts = [];
  try { posts = listPublished('zh', 20); } catch (e) { console.error('[db]', e.message); }
  const { built } = readVersion();
  return <HomePage lang="zh" posts={posts} builtAt={built} />;
}
