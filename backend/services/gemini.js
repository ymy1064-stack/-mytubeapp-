const axios = require("axios");

const GEMINI_KEYS = [process.env.G1_KEY, process.env.G2_KEY];

async function callGeminiApi(prompt) {
  for (let key of GEMINI_KEYS) {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        { contents: [{ parts: [{ text: prompt }] }] },
        { params: { key } }
      );
      return response.data;
    } catch (error) {
      console.warn("Key failed, trying next...");
    }
  }
  throw new Error("All Gemini API keys failed.");
}

async function analyzeSEO(title, description, tags) {
  const prompt = `SEO Analysis:\nTitle: ${title}\nDescription: ${description}\nTags: ${tags}`;
  return await callGeminiApi(prompt);
}

async function analyzeThumbnail(imageUrl, type) {
  const prompt = `Analyze this ${type} thumbnail: ${imageUrl}`;
  return await callGeminiApi(prompt);
}

module.exports = { analyzeSEO, analyzeThumbnail };
