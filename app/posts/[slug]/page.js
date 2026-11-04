import PostPage, { makeMetadata } from '@/components/PostPage';

export const dynamic = 'force-dynamic';
export const generateMetadata = makeMetadata('zh');

export default async function Page({ params }) {
  return <PostPage params={params} lang="zh" />;
}
