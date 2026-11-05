'use client';

import { useRouter } from 'next/navigation';

export default function AdminBar({ children }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="admin-bar">
      <span className="who">后台 · <b>冷丶布丁</b></span>
      <a className="icon-btn" href="/" target="_blank" rel="noopener">看前台 ↗</a>
      <span className="spacer" />
      {children}
      <button className="icon-btn" type="button" onClick={logout}>退出</button>
    </div>
  );
}
