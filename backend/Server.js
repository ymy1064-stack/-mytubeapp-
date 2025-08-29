import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import seoRoutes from './routes/seo.js';
import thumbRoutes from './routes/thumbnail.js';
import ytRoutes from './routes/youtube.js';
import { refreshGuidelinesIfNeeded, getGuidelines } from './services/gemini.js';

const PORT = Number(process.env.PORT || 8080);
const ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: ORIGIN }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false }));

// DB init
export const db = new Database('db.sqlite');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS quotas (user_id TEXT NOT NULL, date TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, date));
CREATE TABLE IF NOT EXISTS gemini_budget (date TEXT PRIMARY KEY, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS cache_keywords (q TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS guidelines (key TEXT PRIMARY KEY, updated_at INTEGER NOT NULL, data TEXT NOT NULL);
`);

app.get('/api/health', async (_req, res) => {
  try {
    await refreshGuidelinesIfNeeded();
    const rules = getGuidelines();
    res.json({ ok: true, rules, date: new Date().toISOString() });
  } catch (e) {
    res.json({ ok: true, date: new Date().toISOString() });
  }
});

app.get('/api/rules', async (_req, res) => {
  await refreshGuidelinesIfNeeded();
  res.json({ ok: true, data: getGuidelines() });
});

// Routes
app.use('/api/seo', seoRoutes);
app.use('/api/thumbnail', thumbRoutes);
app.use('/api/youtube', ytRoutes);

// 24h heartbeat (best-effort)
setInterval(async () => {
  try { await refreshGuidelinesIfNeeded(true); } catch {}
}, 6 * 60 * 60 * 1000); // check every 6h

app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
