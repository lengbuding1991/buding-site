'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

function sanitize(html) {
  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

function readingTime(md) {
  const text = String(md || '').replace(/```[\s\S]*?```/g, '').replace(/[#>*_`\-[\]()]/g, '');
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(cjk / 380 + words / 220));
}

function Toast({ msg }) {
  return <div className={`toast${msg ? ' on' : ''}`} role="status">{msg || ''}</div>;
}

export default function Editor({ initial }) {
  const router = useRouter();
  const isNew = !initial?.id;
  const taRef = useRef(null);

  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [tag, setTag] = useState(initial?.tag || '');
  const [lang, setLang] = useState(initial?.lang || 'zh');
  const [status, setStatus] = useState(initial?.status || 'draft');
  const [body, setBody] = useState(initial?.body || '');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedId, setSavedId] = useState(initial?.id || null);

  const html = useMemo(() => sanitize(marked.parse(body || '_还没有内容_')), [body]);
  const mins = useMemo(() => readingTime(body), [body]);
  const words = useMemo(() => (body || '').replace(/\s+/g, '').length, [body]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  // 有未保存改动时拦截关闭
  useEffect(() => {
    function onBeforeUnload(e) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // ⌘S / Ctrl+S 保存
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save(status);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function mark(fn) { setDirty(true); fn(); }

  function wrap(before, after = before, placeholder = '文字') {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const val = ta.value;
    const sel = val.slice(s, e) || placeholder;
    const next = val.slice(0, s) + before + sel + after + val.slice(e);
    setBody(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd = s + before.length + sel.length;
    });
  }

  function prefix(lineStart) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const val = ta.value;
    const lineBegin = val.lastIndexOf('\n', s - 1) + 1;
    const next = `${val.slice(0, lineBegin)}${lineStart}${val.slice(lineBegin)}`;
    setBody(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + lineStart.length;
    });
  }

  async function save(nextStatus = status) {
    if (busy) return;
    if (!title.trim()) { setToast('先写个标题'); return; }

    setBusy(true);
    try {
      const payload = { id: savedId, title, slug, summary, tag, lang, status: nextStatus, body };
      const res = await fetch('/api/posts', {
        method: isNew && !savedId ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(data.error === 'TITLE_REQUIRED' ? '先写个标题' : '保存失败');
        return;
      }

      setStatus(nextStatus);
      setDirty(false);

      if (!savedId) {
        setSavedId(data.id);
        setSlug(data.slug);
        setToast(nextStatus === 'published' ? '已发布' : '草稿已存');
        router.replace(`/admin/edit/${data.id}`);
      } else {
        setSlug(data.slug);
        setToast(nextStatus === 'published' ? '已发布' : '已保存');
        router.refresh();
      }
    } catch {
      setToast('网络出错');
    } finally {
      setBusy(false);
    }
  }

  const tools = [
    { label: 'B', title: '加粗 ⌘B', fn: () => wrap('**', '**', '加粗') },
    { label: 'I', title: '斜体', fn: () => wrap('_', '_', '斜体') },
    { label: 'H2', title: '大标题', fn: () => prefix('## ') },
    { label: 'H3', title: '小标题', fn: () => prefix('### ') },
    { label: '“”', title: '引用', fn: () => prefix('> ') },
    { label: '•', title: '列表', fn: () => prefix('- ') },
    { label: '1.', title: '编号', fn: () => prefix('1. ') },
    { label: '`', title: '行内代码', fn: () => wrap('`', '`', 'code') },
    { label: '```', title: '代码块', fn: () => wrap('\n```\n', '\n```\n', 'code') },
    { label: '⛓', title: '链接', fn: () => wrap('[', '](https://)', '链接文字') },
    { label: '—', title: '分隔线', fn: () => wrap('\n\n---\n\n', '', '') },
  ];

  return (
    <>
      <div className="editor-meta">
        <label className="field full">
          <span>标题</span>
          <input
            value={title}
            onChange={(e) => mark(() => setTitle(e.target.value))}
            placeholder="这篇文章叫什么"
          />
        </label>
        <label className="field">
          <span>语言</span>
          <select value={lang} onChange={(e) => mark(() => setLang(e.target.value))}>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="field">
          <span>标签</span>
          <input
            value={tag}
            onChange={(e) => mark(() => setTag(e.target.value))}
            placeholder="NOTE"
          />
        </label>
        <label className="field">
          <span>链接名 slug</span>
          <input
            value={slug}
            onChange={(e) => mark(() => setSlug(e.target.value))}
            placeholder="留空自动生成"
          />
        </label>
        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>摘要（列表页显示）</span>
          <input
            value={summary}
            onChange={(e) => mark(() => setSummary(e.target.value))}
            placeholder="一句话说明这篇写了什么"
          />
        </label>
      </div>

      <div className="editor-grid">
        <div className="editor-pane">
          <div className="pane-head">
            <span>Markdown</span>
            <span className="rhs">{words} 字</span>
          </div>
          <div className="md-tools">
            {tools.map((t) => (
              <button key={t.label} type="button" title={t.title} onClick={t.fn}>{t.label}</button>
            ))}
          </div>
          <textarea
            ref={taRef}
            className="editor-md"
            value={body}
            spellCheck={false}
            onChange={(e) => mark(() => setBody(e.target.value))}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                wrap('**', '**', '加粗');
              }
              if (e.key === 'Tab') {
                e.preventDefault();
                const ta = e.currentTarget;
                const s = ta.selectionStart;
                const next = `${ta.value.slice(0, s)}  ${ta.value.slice(ta.selectionEnd)}`;
                setBody(next);
                setDirty(true);
                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
              }
            }}
            placeholder={'在这里写。\n\n支持 Markdown：# 标题、**加粗**、- 列表、> 引用、```代码块```、[链接](url)。'}
          />
        </div>

        <div className="preview-pane">
          <div className="pane-head">
            <span>预览</span>
            <span className="rhs">{mins} 分钟</span>
          </div>
          <div className="preview-body">
            {title ? <h1 style={{ fontSize: 30, marginBottom: 14, letterSpacing: '-0.03em' }}>{title}</h1> : null}
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>

      <div className="editor-foot">
        <span className="hint">
          {dirty ? '● 有未保存改动' : '✓ 已保存'}
          {status === 'published' ? ' · 已发布' : ' · 草稿'}
        </span>
        <span className="spacer" />
        <button className="btn" type="button" disabled={busy} onClick={() => save('draft')}>
          {busy ? '保存中…' : '存草稿'}
        </button>
        <button className="btn btn--solid" type="button" disabled={busy} onClick={() => save('published')}>
          {status === 'published' ? '更新发布' : '发布'} <span className="arrow" aria-hidden="true">→</span>
        </button>
        {savedId && status === 'published' ? (
          <a
            className="btn btn--ghost"
            href={`${lang === 'en' ? '/en' : ''}/posts/${slug}`}
            target="_blank"
            rel="noopener"
          >
            看效果 ↗
          </a>
        ) : null}
      </div>

      <Toast msg={toast} />
    </>
  );
}
