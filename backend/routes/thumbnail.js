const express = require("express");
const router = express.Router();
const { analyzeThumbnail } = require("../services/gemini");

router.post("/analyze", async (req, res) => {
  try {
    const { imageUrl, type } = req.body; // type = long या short
    const result = await analyzeThumbnail(imageUrl, type);
    res.json({ success: true, feedback: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
