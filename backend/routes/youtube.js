import { Router } from 'express';
import { getKeywordsWithCache } from '../services/youtube.js';

const r = Router();

r.get('/keywords', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q required' });
  const data = await getKeywordsWithCache(q);
  res.json({ ok: true, keywords: data });
});

export default r;
