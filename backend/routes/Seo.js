const express = require("express");
const router = express.Router();
const { analyzeSEO } = require("../services/gemini");

// SEO Analyzer Route
router.post("/analyze", async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const result = await analyzeSEO(title, description, tags);
    res.json({ success: true, feedback: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
