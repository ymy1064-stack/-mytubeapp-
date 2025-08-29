import fetch from 'node-fetch';
import { db } from '../server.js';
import { getKeywordsWithCache } from './youtube.js';

const G1 = process.env.GEMINI_API_KEY_1 || '';
const G2 = process.env.GEMINI_API_KEY_2 || '';
const BUDGET = Number(process.env.GEMINI_DAILY_BUDGET || 250);

const qGetGemini = db.prepare('SELECT used FROM gemini_budget WHERE date = ?');
const qUpsertGemini = db.prepare('INSERT INTO gemini_budget (date, used) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET used=excluded.used');

const qGetGuide = db.prepare('SELECT data, updated_at FROM guidelines WHERE key = ?');
const qSetGuide = db.prepare('INSERT INTO guidelines (key, updated_at, data) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET updated_at=excluded.updated_at, data=excluded.data');

const todayStr = () => new Date().toISOString().slice(0,10);
const getUsed = () => (qGetGemini.get(todayStr())?.used || 0);
const incUsed = (by=1) => qUpsertGemini.run(todayStr(), getUsed()+by);

async function callGemini(textPrompt) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const body = { contents: [{ parts: [{ text: textPrompt }]}] };

  const tryKey = async (key) => {
    const r = await fetch(`${endpoint}?key=${key}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if (!r.ok) return null;
    const j = await r.json();
    const out = j?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('\n').trim();
    return out || null;
  };

  if (getUsed() >= BUDGET) return null;
  let out = null;
  if (G1) out = await tryKey(G1);
  if (!out && G2) out = await tryKey(G2);
  if (out) incUsed(1);
  return out;
}

export async function generateSEO(script) {
  const kw = await getKeywordsWithCache(script);
  const prompt = [
    "Write YouTube SEO pack. Return JSON with keys: title, description, tags (<=25).",
    "Keep title <= 100 chars. Keep description 2-5 lines.",
    "Script:", script,
    kw?.length ? "SeedKeywords: " + kw.slice(0,15).join(', ') : ""
  ].filter(Boolean).join('\n');

  const text = await callGemini(prompt);
  if (text) {
    try {
      // If model returns JSON directly
      const j = JSON.parse(text);
      return { title: j.title, description: j.description, tags: j.tags || [] };
    } catch {
      // Fallback: try to parse simple lines
      const title = (text.match(/title\s*:\s*(.*)/i)?.[1] || '').slice(0,100) || `Video about ${script.slice(0,40)}…`;
      const desc = (text.match(/description\s*:\s*([\s\S]+)/i)?.[1] || '').split('\n').slice(0,5).join('\n');
      const tagsLine = text.match(/tags\s*:\s*(.*)/i)?.[1] || '';
      const tags = tagsLine.split(/[,\n]/).map(s=>s.trim()).filter(Boolean).slice(0,25);
      return { title, description: desc, tags };
    }
  }

  // Local fallback
  const base = script.split(/\s+/).filter(Boolean).slice(0,6).join(' ');
  return {
    title: `🚀 ${base} — Learn Faster`,
    description: "In this video we break it down in simple steps.\n• Key points\n• Common mistakes\n• Quick tips",
    tags: Array.from(new Set([...(kw||[]), ...base.toLowerCase().split(/\s+/)])).slice(0,25)
  };
}

export async function analyzeSEO({ title, description, tags=[] }) {
  const rules = getGuidelines();
  const prompt = [
    "Analyze the given YouTube title/description/tags.",
    "Return JSON with: issues:[{ok:boolean,text:string}], suggestions:[string].",
    "Use short, simple language.",
    "Rules to follow: ",
    "- Title <= 70 chars, keyword early, curiosity+clarity",
    "- Description: strong first 2 lines, bullets, optional hashtags",
    "- Tags: relevant mix of exact+long-tail, <= 25",
    JSON.stringify({ title, description, tags })
  ].join('\n');

  const text = await callGemini(prompt);
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      // naive parse
      const suggestions = (text.match(/suggestions?:([\s\S]*)/i)?.[1] || '').split('\n').map(s=>s.replace(/^[-•]\s*/,'').trim()).filter(Boolean).slice(0,8);
      const issues = (text.match(/issues?:([\s\S]*)/i)?.[1] || '').split('\n').map(s=>({ ok: !/^❌|bad|issue/i.test(s), text: s.replace(/^[-•]\s*/,'').trim() })).filter(x=>x.text).slice(0,8);
      return { issues, suggestions };
    }
  }

  // local quick checks
  const issues = [];
  issues.push({ ok: title.length <= 70, text: title.length <= 70 ? "Title length OK" : "Title too long (>70)" });
  issues.push({ ok: (tags||[]).length <= 25, text: (tags||[]).length <= 25 ? "Tags count OK" : "Too many tags (>25)" });
  return { issues, suggestions: [] };
}

export function getGuidelines() {
  const read = (k) => {
    const row = qGetGuide.get(k);
    if (!row) return [];
    try { return JSON.parse(row.data); } catch { return []; }
  };
  return {
    seo: read('seo_rules'),
    thumb_long: read('thumb_long_rules'),
    thumb_short: read('thumb_short_rules')
  };
}

export async function refreshGuidelinesIfNeeded(force=false) {
  const now = Date.now();
  const need = (k) => {
    const row = qGetGuide.get(k);
    return !row || force || (now - row.updated_at) > 24*60*60*1000;
  };

  const make = async (topic) => {
    const prompt = `Give 10 bullet rules for ${topic} in simple language. Return JSON array of strings.`;
    const text = await callGemini(prompt);
    if (text) {
      try { return JSON.parse(text); } catch {}
      return text.split('\n').map(s=>s.replace(/^[-•]\s*/,'').trim()).filter(Boolean).slice(0,10);
    }
    return [];
  };

  if (need('seo_rules')) {
    const data = await make('YouTube SEO (title, description, tags)');
    qSetGuide.run('seo_rules', now, JSON.stringify(data));
  }
  if (need('thumb_long_rules')) {
    const data = await make('Long-form video thumbnail best practices');
    qSetGuide.run('thumb_long_rules', now, JSON.stringify(data));
  }
  if (need('thumb_short_rules')) {
    const data = await make('YouTube Shorts thumbnail best practices');
    qSetGuide.run('thumb_short_rules', now, JSON.stringify(data));
  }
}

export async function analyzeThumbnail(type, imageDataUrl) {
  const rulesObj = getGuidelines();
  const rules = type === 'short' ? rulesObj.thumb_short : rulesObj.thumb_long;

  const prompt = [
    `Analyze a ${type} YouTube thumbnail.`,
    "Return JSON: { checks:[{ok:boolean,text:string}], tips:[string] }.",
    "Check: face visibility/emotion, text contrast & size, focal point, rule of thirds, branding, clutter.",
    "Keep points simple. Give max 8 checks.",
    "Rules reference (for context):", JSON.stringify(rules).slice(0,800)
  ].join('\n');

  const text = await callGemini(prompt);
  if (text) {
    try {
      const j = JSON.parse(text);
      return { checks: j.checks || [], tips: j.tips || [] };
    } catch {
      const lines = text.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,8);
      const checks = lines.map(l => ({ ok: !/^❌|bad|poor|no/i.test(l), text: l.replace(/^[-•]\s*/,'') }));
      return { checks, tips: [] };
    }
  }
  // local fallback (no image vision on server without uploading to external storage)
  const checks = [
    { ok: true, text: "Use strong contrast between text and background" },
    { ok: true, text: "Place face on a third line for better composition" }
  ];
  return { checks, tips: [] };
  }
