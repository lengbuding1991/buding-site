import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { listAll, stats } from '@/lib/db';
import AdminBar from '@/components/AdminBar';
import PostList from './PostList';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  if (!(await isAuthed())) redirect('/admin/login');

  const posts = listAll();
  const s = stats();

  return (
    <div className="admin-shell">
      <AdminBar>
        <a className="icon-btn" href="/admin/write">+ 写新的</a>
      </AdminBar>

      <main className="admin-main">
        <h1 className="admin-h1">文章</h1>
        <p className="admin-sub">这里写的文章会出现在前台「文章」区块。草稿只有你能看到。</p>

        <div className="stat-row">
          <div className="stat accent"><b>{s.published}</b><span>已发布</span></div>
          <div className="stat"><b>{s.drafts}</b><span>草稿</span></div>
          <div className="stat"><b>{s.zh}</b><span>中文</span></div>
          <div className="stat"><b>{s.en}</b><span>English</span></div>
          <div className="stat"><b>{s.total}</b><span>全部</span></div>
        </div>

        <PostList posts={posts} />
      </main>
    </div>
  );
}
