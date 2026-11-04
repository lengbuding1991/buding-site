import { redirect, notFound } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { getById } from '@/lib/db';
import AdminBar from '@/components/AdminBar';
import Editor from '@/components/Editor';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params }) {
  if (!(await isAuthed())) redirect('/admin/login');

  const { id } = await params;
  const post = getById(id);
  if (!post) notFound();

  return (
    <div className="admin-shell">
      <AdminBar>
        <a className="icon-btn" href="/admin">← 全部</a>
      </AdminBar>
      <main className="admin-main wide">
        <h1 className="admin-h1">{post.title || '未命名'}</h1>
        <p className="admin-sub">改完记得存。发布中的文章会立刻更新到前台。</p>
        <Editor initial={post} />
      </main>
    </div>
  );
}
