// Firebase Cloud Function: proxy Jina AI Reader (server-side, tránh CORS browser)
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

exports.scrapeJina = onRequest({ cors: true }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return res.status(204).send('');
  }
  try {
    const url = (req.query.url || (req.body && req.body.url) || '').toString().trim();
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: 'URL không hợp lệ' });
    }
    const jinaUrl = `https://r.jina.ai/${url}`;
    const jinaKey = process.env.JINA_API_KEY || '';
    const headers = { 'Accept': 'text/markdown' };
    if (jinaKey) headers['Authorization'] = `Bearer ${jinaKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const r = await fetch(jinaUrl, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (!r.ok) return res.status(r.status).json({ error: `Jina lỗi ${r.status}` });
      const text = await r.text();
      if (!text || text.length < 200) return res.status(502).json({ error: 'Jina trả nội dung rỗng hoặc bị chặn' });
      return res.json({ success: true, content: text });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Lỗi proxy Jina' });
  }
});
