export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, body } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject et body requis' });

  const credentials = Buffer.from(`${process.env.mj_key}:${process.env.mj_secret}`).toString('base64');

  try {
    const r = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${credentials}` },
      body: JSON.stringify({
        Messages: [{ From: { Email: process.env.mj_from, Name: 'Nicolas Delattre' }, To: [{ Email: to }], Subject: subject, TextPart: body }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
