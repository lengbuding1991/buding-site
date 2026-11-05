'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

function fmt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function PostList({ posts }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function remove(id) {
    setBusyId(id);
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setConfirmId(null);
        start(() => router.refresh());
      }
    } finally {
      setBusyId(null);
    }
  }

  if (!posts.length) {
    return (
      <div className="empty-admin">
        还没有任何文章 · <a href="/admin/write">写第一篇 →</a>
      </div>
    );
  }

  return (
    <>
      <div className="list-head">
        <h2>全部文章</h2>
        <span className="count">{posts.length} 篇</span>
      </div>
      <ul>
        {posts.map((p) => (
          <li className="post-item" key={p.id}>
            <div>
              <div className="pt">{p.title}</div>
              <div className="pm">
                <span className={p.status === 'published' ? 'pub' : 'draft'}>
                  {p.status === 'published' ? '● 已发布' : '○ 草稿'}
                </span>
                <span>{p.lang === 'zh' ? '中文' : 'EN'}</span>
                {p.tag ? <span>{p.tag}</span> : null}
                <span>改于 {fmt(p.updated_at)}</span>
                <span>/{p.lang === 'zh' ? '' : 'en/'}posts/{p.slug}</span>
              </div>
            </div>
            <div className="post-actions">
              <a className="icon-btn" href={`/admin/edit/${p.id}`}>编辑</a>
              {p.status === 'published' ? (
                <a
                  className="icon-btn"
                  href={`${p.lang === 'en' ? '/en' : ''}/posts/${p.slug}`}
                  target="_blank"
                  rel="noopener"
                >
                  查看 ↗
                </a>
              ) : null}
              {confirmId === p.id ? (
                <>
                  <button
                    className="icon-btn danger"
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => remove(p.id)}
                  >
                    {busyId === p.id ? '删除中' : '确认删除'}
                  </button>
                  <button className="icon-btn" type="button" onClick={() => setConfirmId(null)}>算了</button>
                </>
              ) : (
                <button className="icon-btn danger" type="button" onClick={() => setConfirmId(p.id)}>删除</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {pending ? <p className="hint" style={{ marginTop: 14 }}>刷新中…</p> : null}
    </>
  );
}
