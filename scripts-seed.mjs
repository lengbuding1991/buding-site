import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { seedInto } from './lib/seed-data.js';

// 手动灌种子：适合本地或容器里想强制补种时用。
// 正常情况不需要手动跑——db.js 首次建空库会自动灌（SITE_SEED=0 时跳过）。
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'site.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL, lang TEXT NOT NULL DEFAULT 'zh',
  title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT,
  UNIQUE (slug, lang)
);`);

const added = seedInto(db);
console.log(`种子：新增 ${added} 篇。`);
