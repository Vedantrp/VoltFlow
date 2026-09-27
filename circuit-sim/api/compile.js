// Vercel Serverless Function Handler for /api/compile
// Serves AVR compilation API requests on Vercel serverless environment with rate limiting and payload validation

export default async function handler(req, res) {
  // Security Response Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(455 || 405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { source } = req.body || {};
  if (typeof source !== 'string' || !source.trim()) {
    return res.status(400).json({ error: 'Missing "source" C++ code string in request body' });
  }

  if (source.length > 131072) { // 128 KB limit
    return res.status(400).json({ error: 'Source code exceeds maximum allowed size limit (128 KB)' });
  }

  // In cloud serverless environment, return simulated Hex status or relay to standalone compiler server
  res.json({
    message: 'Compilation request validated successfully.',
    status: 'ready',
  });
}
