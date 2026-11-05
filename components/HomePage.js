import { t } from '@/lib/content';
import Topbar from './Topbar';
import Behaviors from './Behaviors';
import Blueprint from './Blueprint';
import Backdrop from './Backdrop';

function Lede({ parts }) {
  return parts.map((p, i) => (p.strong ? <strong key={i}>{p.t}</strong> : <span key={i}>{p.t}</span>));
}

function fmtDate(iso, lang) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return lang === 'zh' ? `${y}.${m}.${day}` : `${y}-${m}-${day}`;
}

export default function HomePage({ lang, posts = [] }) {
  const c = t(lang);
  const base = lang === 'en' ? '/en' : '';

  return (
    <>
      <Backdrop />
      <a className="skip" href="#main">跳到主内容</a>
      <Topbar
        nav={c.nav}
        langLabel={c.langLabel}
        langHref={c.langHref}
        toLight={c.themeToLight}
        toDark={c.themeToDark}
        brand={c.brand}
      />
      <Behaviors />

      <main className="shell" id="main">
        {/* ================= 首屏 ================= */}
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">{c.hero.kicker}</p>
            <h1>{c.hero.title}</h1>
            <p className="lede">
              <Lede parts={c.hero.lede} />
            </p>
            <div className="cta-row">
              <a className="btn btn--solid" href="#work">
                {c.hero.ctaPrimary} <span className="arrow" aria-hidden="true">→</span>
              </a>
              <a className="btn btn--ghost" href="#contact">{c.hero.ctaGhost}</a>
            </div>
          </div>

          <Blueprint lang={lang} />
        </section>

        {/* ================= 作品 ================= */}
        <section className="section" id="work">
          <div className="sec-head">
            <span className="sec-num">{c.work.num}</span>
            <h2 className="sec-title">{c.work.title}</h2>
            <span className="sec-note">{c.work.note}</span>
          </div>

          <div className="work">
            {c.work.items.map((w, i) => (
              <a
                className="work-item"
                href="#contact"
                key={w.name}
                aria-label={`${w.name} — ${w.desc}`}
              >
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="name">
                  {w.name}
                  <small>{w.desc}</small>
                </span>
                <span className="stack">{w.stack}</span>
                <span className={`year${i === 0 ? ' hot' : ''}`}>{w.year}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ================= 关于 ================= */}
        <section className="section" id="about">
          <div className="sec-head">
            <span className="sec-num">{c.about.num}</span>
            <h2 className="sec-title">{c.about.title}</h2>
            <span className="sec-note">{c.about.note}</span>
          </div>

          <div className="about-grid">
            <div className="bio">
              {c.about.bio.map((parts, i) => (
                <p key={i}><Lede parts={parts} /></p>
              ))}
            </div>
            <div className="now-box">
              <h3>{c.about.nowTitle}</h3>
              <ul>
                {c.about.now.map((n) => (
                  <li key={n.k}>
                    <b>{n.k}</b>
                    <span>{n.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="timeline">
            {c.about.timeline.map((row) => (
              <div className="tl-row" key={row.year}>
                <div className="tl-year">{row.year}</div>
                <div className="tl-body">
                  <h3>{row.title}</h3>
                  <p>{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 文章 ================= */}
        <section className="section" id="writing">
          <div className="sec-head">
            <span className="sec-num">{c.writing.num}</span>
            <h2 className="sec-title">{c.writing.title}</h2>
            <span className="sec-note">{c.writing.note}</span>
          </div>

          {posts.length === 0 ? (
            <div className="empty">{c.writing.empty}</div>
          ) : (
            <div className="post-list">
              {posts.map((p) => (
                <a className="post-row" href={`${base}/posts/${p.slug}`} key={p.id}>
                  <span className="date">{fmtDate(p.published_at || p.updated_at, lang)}</span>
                  <span>
                    <h3>{p.title}</h3>
                    {p.summary ? <p>{p.summary}</p> : null}
                  </span>
                  <span className="tag">{p.tag || ''}</span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ================= 联系 ================= */}
        <section className="section contact" id="contact">
          <div className="sec-head">
            <span className="sec-num">{c.contact.num}</span>
            <h2 className="sec-title">{c.contact.title}</h2>
            <span className="sec-note">{c.contact.note}</span>
          </div>
          <p className="lede">{c.contact.lede}</p>
          <a className="mail" href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
          <div className="socials">
            {c.contact.socials.map((s) => (
              <a key={s.label} href={s.href} rel="noopener noreferrer" target="_blank">{s.label}</a>
            ))}
          </div>
        </section>

        <footer className="site-foot">
          <span>{c.footer.copy}</span>
          <span>
            {c.footer.meta} · <a href="/admin">{c.footer.login}</a>
          </span>
        </footer>
      </main>
    </>
  );
}
