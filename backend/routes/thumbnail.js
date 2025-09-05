import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ensureUser } from '../services/youtube.js';
import { analyzeThumbnail } from '../services/gemini.js';

const router = Router();

// Rate limiting for thumbnail analysis
const thumbnailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: 'Too many thumbnail analysis attempts. Please try again later.' },
  standardHeaders: true
});

router.post('/analyze', ensureUser, thumbnailLimiter, async (req, res) => {
  try {
    const { type = "long", image = "" } = req.body;

    // Validate input
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!['long', 'short'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "long" or "short"' });
    }

    // Validate base64 image data
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Please provide a valid base64 image data URL' });
    }

    // Check image size (approx 5MB limit)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageSize = Buffer.from(base64Data, 'base64').length;
    
    if (imageSize > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image is too large. Maximum size is 5MB' });
    }

    console.log(`Analyzing ${type} thumbnail, size: ${Math.round(imageSize / 1024)}KB`);

    // Analyze the thumbnail
    const analysisResult = await analyzeThumbnail(type, image);

    res.json({ 
      ok: true, 
      data: analysisResult,
      imageSize: `${Math.round(imageSize / 1024)}KB`
    });

  } catch (error) {
    console.error('Thumbnail analysis error:', error.message);

    // Specific error handling
    if (error.message.includes('budget') || error.message.includes('quota')) {
      return res.status(429).json({ error: 'Daily AI analysis limit reached. Please try tomorrow.' });
    }

    if (error.message.includes('image') || error.message.includes('format')) {
      return res.status(400).json({ error: 'Invalid image format. Please try with a different image.' });
    }

    if (error.message.includes('size') || error.message.includes('large')) {
      return res.status(400).json({ error: 'Image is too large. Please use a smaller image.' });
    }

    res.status(500).json({ error: 'Failed to analyze thumbnail. Please try again.' });
  }
});

// Health check endpoint for thumbnail service
router.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'thumbnail-analyzer',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;
