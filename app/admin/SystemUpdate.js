'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 后台「系统」面板：看当前版本 + 点一下更新。
 *
 * 为什么要点完还轮询 /api/health：watchtower 拉完镜像会重建容器，
 * 这个页面会先断连。光说「已触发」用户根本不知道到底成没成，
 * 所以拿构建时间去比 —— 变了就是真的换成新镜像了。
 */
export default function SystemUpdate({ initialSha, initialBuilt }) {
  const [sha, setSha] = useState(initialSha);
  const [built, setBuilt] = useState(initialBuilt);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [bad, setBad] = useState(false);
  const poll = useRef(null);

  useEffect(() => () => { if (poll.current) clearInterval(poll.current); }, []);

  async function trigger() {
    setBusy(true);
    setMsg('');
    setBad(false);

    let message = '';
    try {
      const res = await fetch('/api/update', { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.ok === false) {
        setMsg(d.message || '没能叫动 watchtower');
        setBad(true);
        setBusy(false);
        return;
      }
      message = d.message || '已通知 watchtower';
    } catch {
      setMsg('网络异常，没叫动更新');
      setBad(true);
      setBusy(false);
      return;
    }

    setBusy(false);
    setMsg(message);

    // 开始盯版本：断连说明容器正在重建，别当失败。
    // 判据用「构建时间变了」最稳（本地没 VERSION 文件时它一直是 unknown，
    // 那种情况本来也没有 watchtower，走不到这里）。
    const beforeBuilt = built;
    const beforeSha = sha;
    let tries = 0;
    let dropped = false;
    if (poll.current) clearInterval(poll.current);
    poll.current = setInterval(async () => {
      tries += 1;
      if (tries > 60) {
        clearInterval(poll.current);
        setMsg('等了 3 分钟版本还没变，可能是构建失败或没有新提交');
        setBad(true);
        return;
      }
      try {
        const r = await fetch('/api/health', { cache: 'no-store' });
        if (!r.ok) throw new Error('bad');
        const h = await r.json();
        const changed = (h.sha && h.sha !== beforeSha) || (h.built && h.built !== beforeBuilt);
        if (changed) {
          clearInterval(poll.current);
          setSha(h.sha || '');
          setBuilt(h.built || 'unknown');
          setMsg('已经更新到新版本，刷新页面就是新版');
          setBad(false);
          return;
        }
        if (dropped) setMsg('容器重建好了，但版本没变（说明没有新提交）');
      } catch {
        dropped = true;
        setMsg('容器正在重建，页面会短暂断开…');
      }
    }, 3000);
  }

  const short = sha && sha !== 'dev' ? sha.slice(0, 7) : 'dev';

  return (
    <section className="sys">
      <div className="list-head">
        <h2>系统</h2>
        <span className="count">{short}</span>
      </div>

      <div className="sys-row">
        <div className="sys-info">
          <span className="sys-k">当前版本</span>
          <span className="sys-v">{short}</span>
          <span className="sys-k">构建于</span>
          <span className="sys-v">{built === 'unknown' ? '本地' : built}</span>
        </div>
        <button className="icon-btn" type="button" onClick={trigger} disabled={busy}>
          {busy ? '触发中…' : '检查并更新'}
        </button>
      </div>

      {msg ? <p className={bad ? 'sys-msg bad' : 'sys-msg'}>{msg}</p> : null}

      <p className="sys-note">
        平时每 24 小时自动检查一次镜像。点上面那个按钮会立刻让 watchtower
        去拉最新镜像并重建容器，约半分钟生效，期间页面会短暂断开，属正常。
        没有新提交时版本号保持不变。
      </p>
    </section>
  );
}
