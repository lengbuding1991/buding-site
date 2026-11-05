'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace('/admin');
        router.refresh();
      } else {
        setErr('密码不对');
      }
    } catch {
      setErr('网络出问题，再试一次');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <p className="mark">仅限本人使用</p>
        <h1>后台登录</h1>
        <p className="sub">前台是只读的，文章都在这里写。</p>
        <div className="err" role="alert">{err}</div>
        <label className="field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        <button className="btn btn--solid btn-block" type="submit" disabled={busy}>
          {busy ? '验证中…' : '进入'}
        </button>
      </form>
    </div>
  );
}
