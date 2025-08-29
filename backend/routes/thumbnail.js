import { Router } from 'express';
import { ensureUser } from '../services/youtube.js';
import { analyzeThumbnail } from '../services/gemini.js';

const r = Router();

r.post('/analyze', ensureUser, async (req, res) => {
  try {
    const { type = "long", image = "" } = req.body || {};
    if (!image) return res.status(400).json({ error: 'image required (base64 data URL)' });
    const data = await analyzeThumbnail(type, image);
    res.json({ ok: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

export default r;
