import fetch from "node-fetch";

const API_KEYS = [process.env.G1, process.env.G2];
let current = 0;

async function callGemini(prompt) {
  try {
    const response = await fetch("https://gemini.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEYS[current]}`
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error("Gemini failed");
    return await response.json();
  } catch (err) {
    current = (current + 1) % API_KEYS.length; // 🔄 Key fallback
    return { error: "Switched API key, try again" };
  }
}

export async function analyzeSEO(title, description, tags) {
  const prompt = `Check SEO for Title: ${title}, Description: ${description}, Tags: ${tags}`;
  return await callGemini(prompt);
}
