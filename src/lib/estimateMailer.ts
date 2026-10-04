/**
 * Yanhal Holdings Ltd — Start Project estimate mailer.
 * Used by both the Express dev server and the Netlify function so behaviour is identical.
 * Sends (1) the company briefing and (2) a summary copy to the client, and reports
 * the REAL delivery result for each — never a fake "sent".
 */

import { sendMail, isMailConfigured } from './mailTransport.js';
import { sendOwnerBriefingEmail } from './emailService.js';
import { ESTIMATE_TEMPLATE } from '../emailTemplates.js';

export interface EstimateFields {
  name: string;
  phone: string;
  email?: string;
  location?: string;
  service: string;
  scope?: string;
  size?: string;
  budget?: string;
  message?: string;
  profileImageUrl?: string;
}

export interface EstimateFile {
  filename: string;
  content: Buffer;
}

export interface EstimateMailResult {
  configured: boolean;
  /** The enquiry was durably written to the internal log (always attempted before any email). */
  recorded: boolean;
  companyEmailSent: boolean;
  clientEmailSent: boolean;
  ownerBriefingSent: boolean;
  clientEmailSkipped?: string;
  errors: string[];
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isSmtpConfigured(): boolean {
  return isMailConfigured();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Maps a mail result to the HTTP response used by BOTH the Express dev server and the Netlify function.
 *  - 200 delivered: the company briefing email was sent.
 *  - 202 recorded_only: email transport unavailable/failed, but the enquiry was durably logged
 *    ([ENQUIRY_RECORD]) so the visitor can be told it was received.
 */
export function estimateHttpResponse(result: EstimateMailResult): { status: number; body: Record<string, unknown> } {
  if (result.companyEmailSent) return { status: 200, body: { success: true, deliveryStatus: 'delivered', ...result } };
  if (result.recorded) {
    return {
      status: 202,
      body: { success: true, deliveryStatus: 'recorded_only', message: 'Enquiry received and recorded; email delivery is delayed.', ...result },
    };
  }
  return { status: 500, body: { success: false, error: 'Failed to record enquiry', ...result } };
}

export async function sendEstimateEmails(fields: EstimateFields, files: EstimateFile[] = []): Promise<EstimateMailResult> {
  const result: EstimateMailResult = {
    configured: isSmtpConfigured(), recorded: false, companyEmailSent: false, clientEmailSent: false, ownerBriefingSent: false, errors: [],
  };

  // 1. Durable internal record FIRST — independent of the mail transport.
  const enquiryId = `est_${Date.now().toString(36)}`;
  try {
    console.log('[ENQUIRY_RECORD]', JSON.stringify({ enquiryId, at: new Date().toISOString(), fields, imageCount: files.length, imageNames: files.map(f => f.filename) }));
    result.recorded = true;
  } catch (err: any) {
    result.errors.push(`Record failed: ${err?.message || err}`);
  }

  if (!result.configured) {
    result.errors.push('No mail provider configured (set RESEND_API_KEY or SMTP_USER/SMTP_PASS).');
    console.error('[Estimate Mailer] Mail transport NOT configured — enquiry only recorded in logs/Netlify Forms.', enquiryId);
    return result;
  }

  const companyEmail = process.env.COMPANY_EMAIL || 'Yanhalholdingslimited@gmail.com';
  const clientEmail = (fields.email || '').trim();

  const e = (v: unknown, fallback = 'Not Specified') => escapeHtml(v || fallback);
  const imageNote = files.length > 0
    ? `<p><strong>Attached Images:</strong> ${files.length} image(s) attached to this email.</p>`
    : '<p>No images provided</p>';
  const messageWithEmail = `${fields.message || 'No additional message'}\nClient Email: ${clientEmail || 'Not provided'}`;

  const companyHtml = ESTIMATE_TEMPLATE
    .replace('{{name}}', () => e(fields.name))
    .replace('{{phone}}', () => e(fields.phone))
    .replace('{{location}}', () => e(fields.location))
    .replace('{{service}}', () => e(fields.service))
    .replace('{{scope}}', () => e(fields.scope))
    .replace('{{size}}', () => e(fields.size))
    .replace('{{budget}}', () => e(fields.budget))
    .replace('{{message}}', () => e(messageWithEmail))
    .replace('{{image_link}}', () => imageNote)
    .replace('{{profile_url}}', () => escapeHtml(fields.profileImageUrl || 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg'));

  try {
    await sendMail({
      fromName: 'Yanhal Estimator',
      to: companyEmail,
      replyTo: EMAIL_RE.test(clientEmail) ? clientEmail : undefined,
      subject: `New Project Estimate: ${fields.service} - ${fields.name}`,
      html: companyHtml,
      attachments: files,
    });
    result.companyEmailSent = true;
  } catch (err: any) {
    console.error('[Estimate Mailer] Company email failed:', err);
    result.errors.push(`Company email failed: ${err?.message || err}`);
  }

  // 2. Structured owner briefing (dual-summary flow) — triggered automatically after the enquiry is recorded,
  //    independent of whether the visitor-facing email below succeeds.
  try {
    const sizeSqm = Number(fields.size) || 0;
    const s = (v: unknown, fb = 'Not specified') => escapeHtml(v || fb);
    const ob = await sendOwnerBriefingEmail({
      visitorName: s(fields.name),
      visitorEmail: s(clientEmail, 'Not provided'),
      visitorPhone: s(fields.phone),
      enquiryId,
      projectType: s(fields.service),
      serviceDepth: 'See message',
      objective: s(fields.message, 'New Start Project enquiry'),
      scope: s(fields.scope),
      sizeSqm,
      location: s(fields.location),
      statedFacts: [
        { key: 'name', value: s(fields.name) }, { key: 'phone', value: s(fields.phone) },
        { key: 'email', value: s(clientEmail, 'Not provided') }, { key: 'location', value: s(fields.location) },
        { key: 'budget', value: s(fields.budget) },
      ],
      inferredFacts: [],
      indicativeEstimate: { minKes: 0, maxKes: 0, minUsd: 0, maxUsd: 0, ratePerSqm: 0 },
      uploadedFiles: files.map(f => ({ fileName: s(f.filename), fileType: 'image', storagePath: 'attached to company email' })),
      conceptImagesCount: 0,
      recommendedFollowUp: 'Call the client within one business day and arrange a site inspection.',
    });
    result.ownerBriefingSent = ob.success;
    if (!ob.success && ob.error) result.errors.push(`Owner briefing failed: ${ob.error}`);
  } catch (err: any) {
    result.errors.push(`Owner briefing failed: ${err?.message || err}`);
  }

  if (!EMAIL_RE.test(clientEmail)) {
    result.clientEmailSkipped = clientEmail ? 'Invalid client email address' : 'No client email provided';
  } else {
    const row = (label: string, value: unknown) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#a8a29e;">${label}</td><td style="padding:6px 0;"><strong>${e(value)}</strong></td></tr>`;
    const clientHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head>
<body style="font-family:Arial,sans-serif;background:#f5f1ec;color:#2D2926;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e7ded5;">
    <div style="background:#2D2926;padding:24px;text-align:center;border-bottom:3px solid #E0B9A0;">
      <h1 style="color:#FAF8F5;margin:0;font-size:22px;letter-spacing:2px;">YANHAL HOLDINGS LTD</h1>
      <p style="color:#E0B9A0;margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Your Project Summary</p>
    </div>
    <div style="padding:24px;line-height:1.6;">
      <p>Dear ${e(fields.name, 'Valued Client')},</p>
      <p>Thank you for starting your project with Yanhal Holdings. Here is a copy of what you submitted. Our team has received it.</p>
      <table style="font-size:14px;border-collapse:collapse;">
        ${row('Service', fields.service)}
        ${row('Location', fields.location)}
        ${row('Size (m²)', fields.size)}
        ${row('Budget / Estimate', fields.budget)}
        ${row('Scope', fields.scope)}
        ${row('Images attached', files.length)}
      </table>
      <p style="font-size:13px;background:#faf8f5;border-left:4px solid #E0B9A0;padding:12px;margin-top:20px;white-space:pre-wrap;">${e(fields.message)}</p>
      <p><strong>Next step:</strong> our engineering lead will review your scope and contact you within one business day to arrange a site inspection. The figures above are indicative only and subject to site assessment and a Bill of Quantities.</p>
      <p style="font-size:13px;color:#78716c;border-top:1px solid #eee;padding-top:12px;">Questions? Call <a href="tel:+254724093256">+254 724 093256</a> or WhatsApp <a href="https://wa.me/254740895374">+254 740 895374</a>.</p>
    </div>
  </div>
</body></html>`;
    try {
      await sendMail({
        fromName: 'Yanhal Holdings',
        to: clientEmail,
        replyTo: companyEmail,
        subject: 'Your Project Summary — Yanhal Holdings Ltd',
        html: clientHtml,
      });
      result.clientEmailSent = true;
    } catch (err: any) {
      console.error('[Estimate Mailer] Client email failed:', err);
      result.errors.push(`Client email failed: ${err?.message || err}`);
    }
  }

  return result;
}
