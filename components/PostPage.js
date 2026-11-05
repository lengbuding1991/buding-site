import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedBySlug, listPublished } from '@/lib/db';
import { t } from '@/lib/content';
import { renderMarkdown, readingTime } from '@/lib/markdown';
import Topbar from '@/components/Topbar';
import Behaviors from '@/components/Behaviors';
import Backdrop from '@/components/Backdrop';

export const dynamic = 'force-dynamic';

function fmt(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return lang === 'zh' ? `${y}.${m}.${day}` : `${y}-${m}-${day}`;
}

export default async function PostPage({ params, lang = 'zh' }) {
  const { slug } = await params;
  const c = t(lang);
  const post = getPublishedBySlug(decodeURIComponent(slug), lang);
  if (!post) notFound();

  const base = lang === 'en' ? '/en' : '';
  const home = lang === 'en' ? '/en' : '/';
  const html = renderMarkdown(post.body);
  const mins = readingTime(post.body);

  return (
    <>
      <Topbar
        nav={c.nav}
        langLabel={c.langLabel}
        langHref={c.langHref}
        toLight={c.themeToLight}
        toDark={c.themeToDark}
        brand={c.brand}
      />
      <Backdrop />
      <Behaviors />

      <article className="article">
        <a className="back" href={home}>
          <span aria-hidden="true">←</span> {c.writing.back}
        </a>
        <h1>{post.title}</h1>
        <div className="meta">
          <span>{fmt(post.published_at || post.updated_at, lang)}</span>
          <span>{mins} {c.writing.minRead}</span>
          {post.tag ? <span className="accent">{post.tag}</span> : null}
        </div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <footer className="site-foot">
        <span>{c.footer.copy}</span>
        <span>{c.footer.meta}</span>
      </footer>
    </>
  );
}

export function makeMetadata(lang) {
  return async ({ params }) => {
    const { slug } = await params;
    const post = getPublishedBySlug(decodeURIComponent(slug), lang);
    if (!post) return { title: '404' };
    return {
      title: `${post.title} · ${t(lang).brandFull}`,
      description: post.summary || t(lang).description,
    };
  };
}
