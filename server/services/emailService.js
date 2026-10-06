import nodemailer from 'nodemailer';

export const sendPasswordResetOTPEmail = async ({ email, otp, name }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const isDevFallback = process.env.MOCK_EMAIL === 'true';

  if (!smtpHost || !smtpUser || !smtpPass) {
    if (isDevFallback || process.env.NODE_ENV !== 'production') {
      console.info(`[password-reset] Development fallback OTP delivery queued for ${email}${name ? ` (${name})` : ''}.`);
      return { delivered: false, reason: 'smtp_not_configured', devOtp: otp };
    }

    console.info(`[password-reset] OTP email queued for ${email}${name ? ` (${name})` : ''}. Code intentionally not logged in production.`);
    return { delivered: false, reason: 'smtp_not_configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@localhost',
      to: email,
      subject: 'Your password reset verification code',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
          <h2>Password reset request</h2>
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Your one-time password reset code is:</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:0.3rem;padding:16px 20px;background:#f3f4f6;border-radius:8px;display:inline-block;">${otp}</div>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return { delivered: true };
  } catch (error) {
    if (isDevFallback || process.env.NODE_ENV !== 'production') {
      console.error('[password-reset] SMTP delivery failed:', error.message);
      return { delivered: false, reason: 'smtp_send_failed', devOtp: otp };
    }
    throw error;
  }
};
