export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, profile } = req.body || {};

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  const ML_KEY = process.env.MAILERLITE_API_KEY;
  const GROUP_ID = '184572648639956538';

  if (!ML_KEY) {
    return res.status(500).json({ error: 'MailerLite key not configured' });
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ML_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        fields: {
          name: name,
          phone: phone || '',
          last_name: profile || ''
        },
        groups: [GROUP_ID]
      })
    });

    const data = await response.json();

    if (response.ok || response.status === 200 || response.status === 201) {
      return res.status(200).json({ success: true, id: data?.data?.id });
    } else {
      console.error('MailerLite error:', data);
      return res.status(200).json({ success: false, error: data });
    }
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(200).json({ success: false, error: 'Internal error' });
  }
}
