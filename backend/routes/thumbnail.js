import fetch from 'node-fetch';
import { db } from '../server.js';

const DAILY_LIMIT = Number(process.env.DAILY_LIMIT || 3);
const YT_API_KEY = process.env.YOUTUBE_API_KEY || '';

const qInsertUser = db.prepare('INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)');
const qGetQuota = db.prepare('SELECT count FROM quotas WHERE user_id = ? AND date = ?');
const qUpsertQuota = db.prepare('INSERT INTO quotas (user_id, date, count) VALUES (?, ?, ?) ON CONFLICT(user_id, date) DO UPDATE SET count = excluded.count');

const todayStr = () => new Date().toISOString().slice(0, 10);

export function ensureUser(req, res, next) {
  const uid = String(req.headers['x-user'] || '').trim();
  if (!uid) return res.status(400).json({ error: 'User ID required' });
  
  qInsertUser.run(uid, Date.now());
  req.userId = uid;
  next();
}

export function enforceDailyLimit(req, res, next) {
  const row = qGetQuota.get(req.userId, todayStr());
  const used = row ? row.count : 0;
  
  if (used >= DAILY_LIMIT) {
    return res.status(429).json({ error: `Daily limit reached (${DAILY_LIMIT}/day)` });
  }
  
  next();
}

export function incUserCountToday(uid) {
  const d = todayStr();
  const used = (qGetQuota.get(uid, d)?.count || 0) + 1;
  qUpsertQuota.run(uid, d, used);
}

const qGetCache = db.prepare('SELECT data, updated_at FROM cache_keywords WHERE q = ?');
const qUpsertCache = db.prepare('INSERT INTO cache_keywords (q, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(q) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at');

export async function fetchYouTubeKeywords(q) {
  if (!YT_API_KEY) {
    console.log('YouTube API key not configured');
    return [];
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '10');
    url.searchParams.set('q', encodeURIComponent(q));
    url.searchParams.set('key', YT_API_KEY);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.log('YouTube API error:', response.status);
      return [];
    }

    const data = await response.json();
    const words = new Set();

    for (const item of data.items || []) {
      const text = `${item.snippet?.title || ''} ${item.snippet?.description || ''}`;
      const tokens = text.toLowerCase()
        .split(/[^a-z0-9\u0900-\u097F]+/)
        .filter(token => token.length > 2);
      
      tokens.forEach(token => words.add(token));
    }

    return Array.from(words).slice(0, 30);
  } catch (error) {
    console.log('YouTube keywords fetch error:', error.message);
    return [];
  }
}

export async function getKeywordsWithCache(q) {
  const key = q.trim().toLowerCase().slice(0, 100);
  
  if (!key) return [];

  try {
    const hit = qGetCache.get(key);
    
    if (hit && (Date.now() - hit.updated_at) < 3 * 24 * 60 * 60 * 1000) {
      return JSON.parse(hit.data);
    }

    const freshData = await fetchYouTubeKeywords(key);
    qUpsertCache.run(key, JSON.stringify(freshData), Date.now());
    
    return freshData;
  } catch (error) {
    console.log('Keywords cache error:', error.message);
    return [];
  }
                     }
