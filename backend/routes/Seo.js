import { Router } from 'express';
import { ensureUser, enforceDailyLimit, incUserCountToday } from '../services/youtube.js';
import { generateSEO, analyzeSEO } from '../services/gemini.js';

const r = Router();

r.post('/generate', ensureUser, enforceDailyLimit, async (req, res) => {
  try {
    const { script = "" } = req.body || {};
    if (!script.trim()) return res.status(400).json({ error: 'script required' });
    const data = await generateSEO(script);
    incUserCountToday(req.userId);
    res.json({ ok: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

r.post('/analyze', ensureUser, async (req, res) => {
  try {
    const { title = "", description = "", tags = [] } = req.body || {};
    const data = await analyzeSEO({ title, description, tags });
    res.json({ ok: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

export default r;
