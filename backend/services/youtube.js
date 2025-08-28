const axios = require("axios");

const YT_KEY = process.env.YT_KEY;

async function fetchKeywords(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${YT_KEY}&maxResults=5`;
  const response = await axios.get(url);
  return response.data.items.map((item) => item.snippet.title);
}

module.exports = { fetchKeywords };
