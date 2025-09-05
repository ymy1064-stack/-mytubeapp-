import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import seoRoutes from './routes/seo.js';
import thumbRoutes from './routes/thumbnail.js';
import ytRoutes from './routes/youtube.js';
import { refreshGuidelinesIfNeeded, getGuidelines } from './services/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT || 10000);
const ORIGIN = process.env.CORS_ORIGIN || '*';
const NODE_ENV = process.env.NODE_ENV || 'production';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(express.json({ limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || ORIGIN === '*' || origin.includes('render.com') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Database setup
const dbDir = join(__dirname, 'data');
const dbPath = join(dbDir, 'db.sqlite');

// Create data directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('encoding = "UTF-8"');

// Initialize tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, 
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quotas (
  user_id TEXT NOT NULL, 
  date TEXT NOT NULL, 
  count INTEGER NOT NULL DEFAULT 0, 
  PRIMARY KEY (user_id, date)
);

CREATE TABLE IF NOT EXISTS gemini_budget (
  date TEXT PRIMARY KEY, 
  used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cache_keywords (
  q TEXT PRIMARY KEY, 
  data TEXT NOT NULL, 
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS guidelines (
  key TEXT PRIMARY KEY, 
  updated_at INTEGER NOT NULL, 
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quotas_user_date ON quotas(user_id, date);
CREATE INDEX IF NOT EXISTS idx_cache_updated ON cache_keywords(updated_at);
CREATE INDEX IF NOT EXISTS idx_guidelines_updated ON guidelines(updated_at);
`);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await refreshGuidelinesIfNeeded();
    res.json({ 
      ok: true, 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV
    });
  } catch (error) {
    res.json({ 
      ok: true, 
      message: 'Server running with limited functionality',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rules endpoint
app.get('/api/rules', async (req, res) => {
  try {
    await refreshGuidelinesIfNeeded();
    const guidelines = getGuidelines();
    res.json({ ok: true, data: guidelines });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load rules' });
  }
});

// API routes
app.use('/api/seo', seoRoutes);
app.use('/api/thumbnail', thumbRoutes);
app.use('/api/youtube', ytRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS origin: ${ORIGIN}`);
  console.log(`💾 Database: ${dbPath}`);
});

// Guidelines refresh interval
setInterval(async () => {
  try {
    await refreshGuidelinesIfNeeded(true);
    console.log('📋 Guidelines refreshed:', new Date().toISOString());
  } catch (error) {
    console.error('❌ Failed to refresh guidelines:', error.message);
  }
}, 6 * 60 * 60 * 1000);
