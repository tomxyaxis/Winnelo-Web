import { Resend } from 'resend';

function buildWaitlistEmailHtml(email) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
<body style="background-color:#f9f9f9;font-family:'Inter',Arial,sans-serif;margin:0;padding:40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:4px;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 0;">
              <p style="font-size:36px;font-weight:700;letter-spacing:-1px;line-height:1;margin:0 0 6px;color:#1a1c1c;display:flex;align-items:center;"><img src="https://winnelo.com/favicon.png" alt="" width="32" height="32" style="display:inline-block;vertical-align:middle;margin-right:10px;border:0;position:relative;top:-1px;" /><span style="vertical-align:middle;">Winnelo</span></p>
              <p style="color:#94a3b8;font-size:12px;letter-spacing:0.2px;margin:0 0 24px;">The competitive learning platform built around friendly competition.</p>
              <hr style="border:none;border-top:1px solid #0047ab;margin:0;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="color:#1a1c1c;font-size:22px;font-weight:700;letter-spacing:-0.3px;line-height:30px;margin:0 0 12px;">
                You're on the waitlist.
              </p>
              <p style="color:#64748b;font-size:15px;line-height:24px;margin:0 0 28px;">
                Thanks for signing up — you're one of the first to hear about Winnelo. We'll be in touch soon with early access details.
              </p>

              <!-- What is Winnelo box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f7ff;border-radius:4px;border:1px solid rgba(0,71,171,0.15);margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#64748b;font-size:11px;font-weight:600;letter-spacing:1.5px;margin:0 0 16px;text-transform:uppercase;">What is Winnelo?</p>
                    <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 4px;">→&nbsp; Set up in minutes</p>
                    <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 4px;">→&nbsp; AI-generated questions from your own content</p>
                    <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 4px;">→&nbsp; Live leaderboards</p>
                    <p style="color:#64748b;font-size:14px;line-height:22px;margin:0;">→&nbsp; In-depth reporting</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="https://winnelo.com" style="background-color:#0047ab;border-radius:4px;color:#ffffff;display:block;font-size:15px;font-weight:600;padding:16px 0;text-align:center;text-decoration:none;width:100%;box-sizing:border-box;">
                Learn more about Winnelo →
              </a>

              <!-- Sign-off -->
              <p style="color:#1a1c1c;font-size:15px;line-height:24px;margin:32px 0 0;">Tom Wood</p>
              <p style="color:#64748b;font-size:14px;line-height:20px;margin:2px 0 0;">Founder, Winnelo</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td><hr style="border:none;border-top:1px solid #f1f5f9;margin:0;" /></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="color:#94a3b8;font-size:12px;line-height:20px;margin:0 0 4px;">Winnelo</p>
              <p style="color:#cbd5e1;font-size:11px;line-height:18px;margin:8px 0 0;">
                You're receiving this because you signed up to the Winnelo waitlist at winnelo.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const resend = new Resend(apiKey);

  const { error: contactError } = await resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId,
  });

  if (contactError) {
    console.error('Resend contact error:', JSON.stringify(contactError));
    return res.status(500).json({ error: contactError.message });
  }

  const { error: emailError } = await resend.emails.send({
    from: 'Winnelo <hello@winnelo.com>',
    to: email,
    subject: "You're on the Winnelo waitlist",
    html: buildWaitlistEmailHtml(email),
  });

  if (emailError) {
    console.error('Resend email error:', JSON.stringify(emailError));
  }

  return res.status(200).json({ success: true });
}
