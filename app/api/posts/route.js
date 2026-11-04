import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { createPost, updatePost, deletePost, getById, getBySlugLang } from '@/lib/db';

export const dynamic = 'force-dynamic';

const LANGS = ['zh', 'en'];
const STATUSES = ['draft', 'published'];

function slugify(input) {
  const s = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s.slice(0, 80) || `post-${Date.now().toString(36)}`;
}

function clean(body = {}) {
  return {
    lang: LANGS.includes(body.lang) ? body.lang : 'zh',
    status: STATUSES.includes(body.status) ? body.status : 'draft',
    title: String(body.title || '').trim().slice(0, 200),
    slug: slugify(body.slug || body.title),
    summary: String(body.summary || '').trim().slice(0, 400),
    tag: String(body.tag || '').trim().slice(0, 40),
    body: String(body.body || '').slice(0, 200000),
  };
}

function uniqueSlug(base, lang, ignoreId = null) {
  let slug = base;
  let n = 1;
  let clash = getBySlugLang(slug, lang);
  while (clash && clash.id !== ignoreId) {
    slug = `${base}-${++n}`;
    clash = getBySlugLang(slug, lang);
  }
  return slug;
}

export async function POST(req) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const input = clean(await req.json());
  if (!input.title) return NextResponse.json({ error: 'TITLE_REQUIRED' }, { status: 400 });

  const slug = uniqueSlug(input.slug, input.lang);
  const id = createPost({ ...input, slug });
  return NextResponse.json({ ok: true, id, slug });
}

export async function PUT(req) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const raw = await req.json();
  const id = Number(raw.id);
  if (!id || !getById(id)) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const input = clean(raw);
  if (!input.title) return NextResponse.json({ error: 'TITLE_REQUIRED' }, { status: 400 });

  const slug = uniqueSlug(input.slug, input.lang, id);
  updatePost(id, { ...input, slug });
  return NextResponse.json({ ok: true, id, slug });
}

export async function DELETE(req) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { id } = await req.json();
  if (!getById(id)) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  deletePost(id);
  return NextResponse.json({ ok: true });
}
