import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ensureUser, enforceDailyLimit, incUserCountToday } from '../services/youtube.js';
import { generateSEO, analyzeSEO } from '../services/gemini.js';

const router = Router();

// Rate limiting for SEO generation
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many generation attempts. Please try again later.' },
  standardHeaders: true
});

router.post('/generate', ensureUser, generateLimiter, enforceDailyLimit, async (req, res) => {
  try {
    const { script = "" } = req.body;
    
    if (!script.trim()) {
      return res.status(400).json({ error: 'Script is required' });
    }

    if (script.length > 5000) {
      return res.status(400).json({ error: 'Script is too long (max 5000 characters)' });
    }

    const data = await generateSEO(script);
    incUserCountToday(req.userId);
    
    res.json({ ok: true, data });
  } catch (error) {
    console.error('SEO generation error:', error.message);
    
    if (error.message.includes('budget') || error.message.includes('quota')) {
      return res.status(429).json({ error: 'Daily AI limit reached. Please try tomorrow.' });
    }
    
    res.status(500).json({ error: 'Failed to generate SEO content' });
  }
});

router.post('/analyze', ensureUser, async (req, res) => {
  try {
    const { title = "", description = "", tags = [] } = req.body;
    
    if (!title && !description && (!tags || tags.length === 0)) {
      return res.status(400).json({ error: 'Please provide title, description or tags to analyze' });
    }

    const data = await analyzeSEO({ title, description, tags });
    res.json({ ok: true, data });
  } catch (error) {
    console.error('SEO analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze SEO' });
  }
});

export default router;
