export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, body } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject et body requis' });

  const MJ_KEY = process.env.MJ_KEY;
  const MJ_SECRET = process.env.MJ_SECRET;
  const MJ_FROM = process.env.MJ_FROM;

  const credentials = Buffer.from(`${MJ_KEY}:${MJ_SECRET}`).toString('base64');

  try {
    const r = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${credentials}` },
      body: JSON.stringify({
        Messages: [{ From: { Email: MJ_FROM, Name: 'Nicolas Delattre' }, To: [{ Email: to }], Subject: subject, TextPart: body }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
