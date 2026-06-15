import nodemailer from 'nodemailer';

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  const from = process.env.EMAIL_FROM || user;

  if (!host || !port || !from) return null;

  const auth = user && pass ? { user, pass } : undefined;
  return { host, port, secure, auth, from };
}

export function isEmailConfigured() {
  return Boolean(getSmtpConfig());
}

async function sendMail({ to, subject, text }) {
  const cfg = getSmtpConfig();
  if (!cfg) {
    console.warn('[email] SMTP not configured; skipping email send');
    return { skipped: true };
  }

  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
  });

  await transport.sendMail({
    from: cfg.from,
    to,
    subject,
    text,
  });

  return { ok: true };
}

export async function sendDeliveredEmail(orderRow) {
  const to = String(orderRow?.customer_email || '').trim();
  if (!to) return { skipped: true };

  const orderId = orderRow?.id ?? '';
  const subject = 'Delivery confirmation — your order is arriving';
  const text =
    `Hello,\n\n` +
    `We’re pleased to let you know that your order (ORD-${orderId}) has been delivered. ` +
    `It should reach you any moment now.\n\n` +
    `Thank you for choosing FloraBelle.\n` +
    `FloraBelle Team\n`;

  return sendMail({ to, subject, text });
}

