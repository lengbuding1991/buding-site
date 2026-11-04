import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import AdminBar from '@/components/AdminBar';
import Editor from '@/components/Editor';

export const dynamic = 'force-dynamic';

export default async function WritePage() {
  if (!(await isAuthed())) redirect('/admin/login');

  return (
    <div className="admin-shell">
      <AdminBar>
        <a className="icon-btn" href="/admin">← 全部</a>
      </AdminBar>
      <main className="admin-main wide">
        <h1 className="admin-h1">写新的</h1>
        <p className="admin-sub">左边写，右边实时看。⌘S 保存。</p>
        <Editor />
      </main>
    </div>
  );
}
