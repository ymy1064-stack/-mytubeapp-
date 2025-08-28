const express = require("express");
const router = express.Router();
const { fetchKeywords } = require("../services/youtube");

router.get("/keywords/:query", async (req, res) => {
  try {
    const result = await fetchKeywords(req.params.query);
    res.json({ success: true, keywords: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
