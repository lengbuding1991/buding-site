import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { seedInto } from './seed-data.js';

/* ============================================================
   数据层：node:sqlite（Node 22.5+ 内置，无需编译原生模块）
   服务器上因此不会有 better-sqlite3 的预编译/编译失败问题。
   ============================================================ */

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'site.db');

let _db = null;

export function db() {
  if (_db) return _db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const conn = new DatabaseSync(DB_PATH);
  conn.exec('PRAGMA journal_mode = WAL;');
  conn.exec('PRAGMA foreign_keys = ON;');
  conn.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT    NOT NULL,
      lang         TEXT    NOT NULL DEFAULT 'zh',
      title        TEXT    NOT NULL,
      summary      TEXT    NOT NULL DEFAULT '',
      body         TEXT    NOT NULL DEFAULT '',
      tag          TEXT    NOT NULL DEFAULT '',
      status       TEXT    NOT NULL DEFAULT 'draft',
      created_at   TEXT    NOT NULL,
      updated_at   TEXT    NOT NULL,
      published_at TEXT,
      UNIQUE (slug, lang)
    );
  `);
  conn.exec(`CREATE INDEX IF NOT EXISTS idx_posts_lang_status ON posts (lang, status, published_at DESC);`);

  // 首次建库（posts 表为空）时自动灌入示例文章；SITE_SEED=0 跳过（想从空库开始）。
  // 幂等：INSERT OR IGNORE，已存在的不覆盖，用户后来改的内容不受影响。
  const { n } = conn.prepare(`SELECT COUNT(*) AS n FROM posts`).get();
  if (n === 0 && process.env.SITE_SEED !== '0') {
    seedInto(conn);
  }

  _db = conn;
  return _db;
}

function now() {
  return new Date().toISOString();
}

/* node:sqlite 返回的行是 null 原型对象，React Server Components 无法把它
   序列化后传给 Client Component（会 500）。所有读取一律转成 plain object。 */
const plain = (row) => (row ? { ...row } : undefined);
const plainAll = (rows) => rows.map((r) => ({ ...r }));

export function listPublished(lang = 'zh', limit = 50) {
  const rows = db()
    .prepare(
      `SELECT id, slug, lang, title, summary, tag, published_at, updated_at
         FROM posts
        WHERE lang = ? AND status = 'published'
        ORDER BY COALESCE(published_at, updated_at) DESC
        LIMIT ?`
    )
    .all(lang, limit);
  return plainAll(rows);
}

export function getPublishedBySlug(slug, lang = 'zh') {
  return plain(
    db()
      .prepare(`SELECT * FROM posts WHERE slug = ? AND lang = ? AND status = 'published'`)
      .get(slug, lang)
  );
}

export function listAll(lang = null) {
  const rows = lang
    ? db().prepare(`SELECT * FROM posts WHERE lang = ? ORDER BY updated_at DESC`).all(lang)
    : db().prepare(`SELECT * FROM posts ORDER BY updated_at DESC`).all();
  return plainAll(rows);
}

export function getById(id) {
  return plain(db().prepare(`SELECT * FROM posts WHERE id = ?`).get(Number(id)));
}

export function getBySlugLang(slug, lang) {
  return plain(db().prepare(`SELECT * FROM posts WHERE slug = ? AND lang = ?`).get(slug, lang));
}

export function createPost({ slug, lang, title, summary = '', body = '', tag = '', status = 'draft' }) {
  const t = now();
  const publishedAt = status === 'published' ? t : null;
  const info = db()
    .prepare(
      `INSERT INTO posts (slug, lang, title, summary, body, tag, status, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(slug, lang, title, summary, body, tag, status, t, t, publishedAt);
  return Number(info.lastInsertRowid);
}

export function updatePost(id, { slug, lang, title, summary = '', body = '', tag = '', status = 'draft' }) {
  const existing = getById(id);
  if (!existing) return false;

  // 从 draft 变 published 时补上发布时间；从 published 退回 draft 时清空
  let publishedAt = existing.published_at;
  if (status === 'published' && !publishedAt) publishedAt = now();
  if (status !== 'published') publishedAt = null;

  db()
    .prepare(
      `UPDATE posts
          SET slug = ?, lang = ?, title = ?, summary = ?, body = ?, tag = ?,
              status = ?, updated_at = ?, published_at = ?
        WHERE id = ?`
    )
    .run(slug, lang, title, summary, body, tag, status, now(), publishedAt, Number(id));
  return true;
}

export function deletePost(id) {
  db().prepare(`DELETE FROM posts WHERE id = ?`).run(Number(id));
}

/* ---------- 统计，给后台首页用 ---------- */
export function stats() {
  const one = (sql) => db().prepare(sql).get().n;
  return {
    total: one(`SELECT COUNT(*) AS n FROM posts`),
    published: one(`SELECT COUNT(*) AS n FROM posts WHERE status = 'published'`),
    drafts: one(`SELECT COUNT(*) AS n FROM posts WHERE status = 'draft'`),
    zh: one(`SELECT COUNT(*) AS n FROM posts WHERE lang = 'zh'`),
    en: one(`SELECT COUNT(*) AS n FROM posts WHERE lang = 'en'`),
  };
}
