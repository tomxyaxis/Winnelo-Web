import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error('Missing env vars:', { hasApiKey: !!apiKey, hasAudienceId: !!audienceId });
    return res.status(500).json({ error: 'Server misconfigured', hasApiKey: !!apiKey, hasAudienceId: !!audienceId });
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId,
  });

  console.log('Resend response:', JSON.stringify({ data, error }));

  if (error) {
    console.error('Resend error:', JSON.stringify(error));
    return res.status(500).json({ error: error.message, details: error });
  }

  return res.status(200).json({ success: true });
}
