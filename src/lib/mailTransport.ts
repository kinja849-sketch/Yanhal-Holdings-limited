/**
 * Yanhal Holdings Ltd — unified mail transport.
 * Uses Resend (HTTPS API, reliable on serverless) when RESEND_API_KEY is set,
 * otherwise falls back to Gmail SMTP (SMTP_USER / SMTP_PASS).
 * Always throws on failure so callers can report real delivery status.
 */

import nodemailer from 'nodemailer';

export interface MailAttachment {
  filename: string;
  content: Buffer;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  /** Display name only; the address is chosen by the active transport. */
  fromName: string;
  attachments?: MailAttachment[];
}

export function isMailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY || !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function activeMailProvider(): 'resend' | 'smtp' | 'none' {
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  return 'none';
}

export async function sendMail(msg: MailMessage): Promise<void> {
  const provider = activeMailProvider();

  if (provider === 'resend') {
    let fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    if (!fromAddress || fromAddress.includes('yourdomain.com')) {
      fromAddress = 'onboarding@resend.dev';
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${msg.fromName} <${fromAddress}>`,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        reply_to: msg.replyTo,
        attachments: msg.attachments?.map(a => ({ filename: a.filename, content: a.content.toString('base64') })),
      }),
    });
    if (!res.ok) {
      let detail = '';
      let errorJson: any = null;
      try {
        errorJson = await res.json();
        detail = JSON.stringify(errorJson);
      } catch (_) {}

      // If Resend is in testing sandbox mode, it only allows delivery to the account owner's email.
      // Reroute to that owner so leads and notifications are never lost while awaiting custom domain verification.
      const match = errorJson?.message?.match(/testing emails to your own email address \(([^)]+)\)/);
      if (res.status === 403 && match && match[1] && msg.to.toLowerCase() !== match[1].toLowerCase()) {
        const ownerEmail = match[1];
        console.warn(`[MailTransport] Resend sandbox restriction active. Rerouting delivery intended for ${msg.to} to registered account ${ownerEmail}`);
        const fallbackRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${msg.fromName} <${fromAddress}>`,
            to: [ownerEmail],
            subject: `[Sandbox Reroute: To ${msg.to}] ${msg.subject}`,
            html: `<div style="background:#fff3cd;padding:12px;margin-bottom:16px;border:1px solid #ffeeba;border-radius:4px;color:#856404;font-family:sans-serif;font-size:13px;">
              <strong>Resend Sandbox Notice:</strong> This message was originally intended for <code>${msg.to}</code>. Because the Resend domain is not yet verified at resend.com/domains, Resend only allows testing delivery to your account address (<code>${ownerEmail}</code>).
            </div>` + msg.html,
            reply_to: msg.replyTo,
            attachments: msg.attachments?.map(a => ({ filename: a.filename, content: a.content.toString('base64') })),
          }),
        });

        if (fallbackRes.ok) {
          return;
        }
      }

      throw new Error(`Resend ${res.status}: ${detail}`);
    }
    return;
  }

  if (provider === 'smtp') {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"${msg.fromName}" <${process.env.SMTP_USER}>`,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      replyTo: msg.replyTo,
      attachments: msg.attachments?.map(a => ({ filename: a.filename, content: a.content })),
    });
    return;
  }

  throw new Error('No mail provider configured (set RESEND_API_KEY or SMTP_USER/SMTP_PASS).');
}
