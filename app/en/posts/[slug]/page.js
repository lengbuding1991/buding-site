import PostPage, { makeMetadata } from '@/components/PostPage';

export const dynamic = 'force-dynamic';
export const generateMetadata = makeMetadata('en');

export default async function Page({ params }) {
  return <PostPage params={params} lang="en" />;
}
