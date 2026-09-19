import { PROGRAM_REVIEW_CONSENT_TEXT, PROGRAM_REVIEW_CONSENT_VERSION } from '../src/lib/programReviewConsent.js';

const requests = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function text(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function list(value, maxItems = 12) {
  return Array.isArray(value) ? value.slice(0, maxItems).map((item) => text(item, 100)).filter(Boolean) : [];
}

function requestIp(req) {
  return text(req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown', 100);
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const configured = (process.env.ALLOWED_ORIGINS || 'https://linkmarketingservices.com,https://www.linkmarketingservices.com')
    .split(',').map((item) => item.trim()).filter(Boolean);
  if (configured.includes(origin)) return true;
  return process.env.VERCEL_ENV !== 'production' && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  requests.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origin not allowed' });
  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    return res.status(415).json({ error: 'JSON required' });
  }
  if (Number(req.headers['content-length'] || 0) > 25000) return res.status(413).json({ error: 'Request too large' });
  if (rateLimited(requestIp(req))) return res.status(429).json({ error: 'Please wait before trying again' });

  const body = req.body || {};
  if (text(body._company_url_check, 200)) return res.status(202).json({ accepted: true });

  const name = text(body.name, 120);
  const email = text(body.email, 254).toLowerCase();
  const industry = text(body.industry, 100);
  const volume = text(body.volume, 100);
  const started = Date.parse(body.formStartedAt);
  const elapsed = Date.now() - started;

  if (!name || !email || !industry || !volume) return res.status(400).json({ error: 'Required fields are missing' });
  if (body.consentVersion !== PROGRAM_REVIEW_CONSENT_VERSION || body.consentAccepted !== true) {
    return res.status(400).json({ error: 'Consent is required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (!Number.isFinite(elapsed) || elapsed < 1500 || elapsed > 86400000) return res.status(400).json({ error: 'Invalid form session' });

  const lead = {
    name,
    email,
    industry,
    volume,
    company: text(body.company, 160),
    website: text(body.website, 500),
    phone: text(body.phone, 40),
    market: text(body.market, 160),
    sources: list(body.sources),
    services: list(body.services),
    notes: text(body.notes, 2000),
    pageUrl: text(body.pageUrl, 500),
    submittedAt: new Date().toISOString(),
    consent: {
      accepted: true,
      version: PROGRAM_REVIEW_CONSENT_VERSION,
      text: PROGRAM_REVIEW_CONSENT_TEXT,
      capturedAt: new Date().toISOString(),
    },
    attribution: body.attribution && typeof body.attribution === 'object' ? body.attribution : {},
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) return res.status(503).json({ error: 'Lead delivery is not configured' });

  try {
    const upstream = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.LEAD_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`Webhook returned ${upstream.status}`);
    return res.status(200).json({ accepted: true });
  } catch (error) {
    console.error('Lead delivery failed', { message: error.message });
    return res.status(502).json({ error: 'Lead delivery failed' });
  }
}
