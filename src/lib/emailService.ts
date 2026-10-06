/**
 * Yanhal Holdings Ltd — Notification & Email Dispatch Service
 * Handles visitor project summaries, authorized owner briefings, and appointment notices.
 * Records delivery status and retries to ensure failures never silently count as delivered.
 */

import { sendMail, isMailConfigured } from './mailTransport.js';
import dotenv from 'dotenv';
import { assistantStorage } from './assistantStorage.js';

dotenv.config();

const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'Yanhalholdingslimited@gmail.com';

export interface VisitorSummaryData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  statedGoal: string;
  projectType: string;
  serviceDepth: string;
  scope: string;
  sizeSqm: number;
  location: string;
  indicativeEstimate: {
    minKes: number;
    maxKes: number;
    minUsd: number;
    maxUsd: number;
    assumptions: string[];
  };
  uploadedFilesCount: number;
  missingInformation: string[];
  expectedNextStep: string;
  enquiryId: string;
}

export interface OwnerBriefingData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  enquiryId: string;
  projectType: string;
  serviceDepth: string;
  objective: string;
  scope: string;
  sizeSqm: number;
  location: string;
  mapsUrl?: string;
  statedFacts: { key: string; value: string; note?: string }[];
  inferredFacts: { key: string; value: string; note?: string }[];
  indicativeEstimate: {
    minKes: number;
    maxKes: number;
    minUsd: number;
    maxUsd: number;
    ratePerSqm: number;
  };
  uploadedFiles: { fileName: string; fileType: string; aiDescription?: string; storagePath: string }[];
  conceptImagesCount: number;
  recommendedFollowUp: string;
}

export async function sendVisitorSummaryEmail(data: VisitorSummaryData): Promise<{ success: boolean; error?: string }> {
  const assumptionsList = data.indicativeEstimate.assumptions.map(a => `<li style="margin-bottom: 6px;">${a}</li>`).join('');
  const missingList = data.missingInformation.length > 0
    ? data.missingInformation.map(m => `<li style="margin-bottom: 6px; color: #b45309;">${m}</li>`).join('')
    : '<li style="color: #15803d;">All primary specifications provided.</li>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: Arial, sans-serif; background-color: #080809; color: #FAF8F5; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #181514; border: 1px solid rgba(224,185,160,0.2); border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2D2926; padding: 28px 24px; border-bottom: 2px solid #E0B9A0; text-align: center;">
          <h1 style="color: #FAF8F5; margin: 0; font-size: 24px; letter-spacing: 2px;">YANHAL HOLDINGS LTD</h1>
          <p style="color: #E0B9A0; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Your Indicative Project Estimate & Summary</p>
        </div>
        <div style="padding: 28px 24px; line-height: 1.6;">
          <p style="font-size: 16px;">Dear ${data.visitorName || 'Valued Client'},</p>
          <p>Thank you for initiating your project brief with Yanhal Holdings. Here is the verified summary of your project details and the indicative estimator result calculated for your scope.</p>
          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 18px; margin: 20px 0;">
            <h3 style="color: #E0B9A0; margin-top: 0; font-size: 15px; border-bottom: 1px solid rgba(224,185,160,0.2); padding-bottom: 8px;">Stated Goal & Project Scope</h3>
            <p><strong>Primary Objective:</strong> ${data.statedGoal || 'General construction and engineering consultation'}</p>
            <p><strong>Service Category:</strong> ${data.projectType} (${data.serviceDepth})</p>
            <p><strong>Estimated Area:</strong> ${data.sizeSqm} m²</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Scope Overview:</strong> ${data.scope || 'Standard project delivery'}</p>
            <p><strong>Materials/Images Attached:</strong> ${data.uploadedFilesCount} reference item(s)</p>
          </div>

          <div style="background: #2D2926; border-left: 4px solid #E0B9A0; padding: 18px; margin: 20px 0; border-radius: 0 6px 6px 0;">
            <h3 style="color: #FAF8F5; margin-top: 0; font-size: 16px;">Indicative Cost Benchmark</h3>
            <p style="font-size: 22px; font-weight: bold; color: #E0B9A0; margin: 8px 0;">
              KES ${data.indicativeEstimate.minKes.toLocaleString()} – KES ${data.indicativeEstimate.maxKes.toLocaleString()}
            </p>
            <p style="font-size: 13px; color: #d6d3d1; margin: 0 0 12px 0;">
              Approx. $${data.indicativeEstimate.minUsd.toLocaleString()} – $${data.indicativeEstimate.maxUsd.toLocaleString()} USD
            </p>
            <p style="font-size: 12px; color: #a8a29e; margin-bottom: 6px;"><strong>Planning Assumptions:</strong></p>
            <ul style="font-size: 12px; color: #a8a29e; padding-left: 20px; margin: 0;">
              ${assumptionsList}
            </ul>
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 18px; margin: 20px 0;">
            <h4 style="color: #FAF8F5; margin-top: 0;">Information Still Pending / Missing</h4>
            <ul style="padding-left: 20px; margin: 0; font-size: 13px;">
              ${missingList}
            </ul>
          </div>

          <div style="margin: 24px 0;">
            <h4 style="color: #E0B9A0; margin-bottom: 8px;">Next Step</h4>
            <p style="font-size: 14px; margin: 0;">${data.expectedNextStep}</p>
          </div>

          <p style="font-size: 13px; color: #a8a29e; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 24px;">
            Need immediate clarification? Reach our Nairobi HQ directly by phone or WhatsApp at <a href="tel:+254740895374" style="color: #E0B9A0;">+254 740 895374</a> (<a href="https://wa.me/254740895374" style="color: #E0B9A0;">WhatsApp</a>).
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (isMailConfigured()) {
      await sendMail({
        fromName: 'Yanhal Holdings Estimator',
        to: data.visitorEmail,
        subject: `Your Project Estimate & Summary — Yanhal Holdings Ltd`,
        html,
      });
      await assistantStorage.recordNotification({
        type: 'visitor_summary',
        recipientEmail: data.visitorEmail,
        subject: `Your Project Estimate & Summary — Yanhal Holdings Ltd`,
        contentHtml: html,
        status: 'sent',
        enquiryId: data.enquiryId,
      });
      return { success: true };
    } else {
      console.log(`[Email Service] SMTP not configured. Visitor summary logged for ${data.visitorEmail}`);
      await assistantStorage.recordNotification({
        type: 'visitor_summary',
        recipientEmail: data.visitorEmail,
        subject: `Your Project Estimate & Summary — Yanhal Holdings Ltd`,
        contentHtml: html,
        status: 'failed',
        error: 'SMTP not configured',
        enquiryId: data.enquiryId,
      });
      return { success: false, error: 'SMTP not configured' };
    }
  } catch (err: any) {
    console.error('[Email Service] Visitor email delivery failed:', err);
    await assistantStorage.recordNotification({
      type: 'visitor_summary',
      recipientEmail: data.visitorEmail,
      subject: `Your Project Estimate & Summary — Yanhal Holdings Ltd`,
      contentHtml: html,
      status: 'failed',
      error: err.message || 'SMTP delivery exception',
      enquiryId: data.enquiryId,
    });
    return { success: false, error: err.message };
  }
}

export async function sendOwnerBriefingEmail(data: OwnerBriefingData): Promise<{ success: boolean; error?: string }> {
  const statedHtml = data.statedFacts.map(f => `<li><strong>${f.key}:</strong> ${f.value} ${f.note ? `<span style="color:#78716c;">(${f.note})</span>` : ''}</li>`).join('');
  const inferredHtml = data.inferredFacts.length > 0 
    ? data.inferredFacts.map(f => `<li><strong>${f.key}:</strong> ${f.value} <span style="color:#eab308;">(AI Inference - pending confirmation)</span></li>`).join('')
    : '<li>None. All project parameters were stated directly by the client.</li>';

  const filesHtml = data.uploadedFiles.length > 0
    ? data.uploadedFiles.map(f => `
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; margin-bottom: 8px;">
        <strong>${f.fileName}</strong> (${f.fileType})<br/>
        <em>Visual Inspection:</em> ${f.aiDescription || 'Material or site reference'}<br/>
        <span style="font-size: 11px; color: #a8a29e;">Access Control: Internal staff review available via Portal</span>
      </div>`).join('')
    : '<p style="color: #78716c;">No images or files attached by client.</p>';

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #080809; color: #FAF8F5; padding: 24px;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #181514; border: 1px solid #E0B9A0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #E0B9A0; border-bottom: 2px solid #2D2926; padding-bottom: 8px; margin-top: 0;">
          CONFIDENTIAL OWNER BRIEFING: NEW PROJECT ENQUIRY
        </h2>
        
        <div style="background: #2D2926; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h3 style="margin-top:0; color:#FAF8F5;">Client Identification</h3>
          <p><strong>Name:</strong> ${data.visitorName || 'Not Stated'}</p>
          <p><strong>Email:</strong> ${data.visitorEmail || 'Not Stated'}</p>
          <p><strong>Phone:</strong> ${data.visitorPhone || 'Not Stated'}</p>
          <p><strong>Enquiry Ref:</strong> ${data.enquiryId}</p>
        </div>

        <div style="margin: 16px 0;">
          <h3 style="color:#E0B9A0;">Project Objectives & Context</h3>
          <p><strong>Objective:</strong> ${data.objective || 'Not specified'}</p>
          <p><strong>Category:</strong> ${data.projectType} • Depth: ${data.serviceDepth}</p>
          <p><strong>Size:</strong> ${data.sizeSqm} m² • Base Rate: KES ${data.indicativeEstimate.ratePerSqm.toLocaleString()}/m²</p>
          <p><strong>Location:</strong> ${data.location} ${data.mapsUrl ? `<a href="${data.mapsUrl}" style="color:#E0B9A0;">[View Verified Map]</a>` : ''}</p>
          <p><strong>Scope:</strong> ${data.scope || 'Standard build/fit-out'}</p>
        </div>

        <div style="background: rgba(224,185,160,0.1); border: 1px solid #E0B9A0; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h4 style="margin: 0 0 8px 0; color:#E0B9A0;">Indicative Estimator Benchmark Delivered to Client</h4>
          <p style="font-size: 18px; font-weight: bold; margin: 0;">
            KES ${data.indicativeEstimate.minKes.toLocaleString()} – KES ${data.indicativeEstimate.maxKes.toLocaleString()}
            ($${data.indicativeEstimate.minUsd.toLocaleString()} – $${data.indicativeEstimate.maxUsd.toLocaleString()} USD)
          </p>
        </div>

        <div style="margin: 16px 0;">
          <h4 style="color:#FAF8F5;">Fact Origin & Provenance Breakdown</h4>
          <p style="font-size: 12px; color:#a8a29e;">Stated directly by visitor:</p>
          <ul style="font-size: 13px;">${statedHtml}</ul>
          <p style="font-size: 12px; color:#a8a29e;">Inferred by conversational AI (needs verification during briefing):</p>
          <ul style="font-size: 13px;">${inferredHtml}</ul>
        </div>

        <div style="margin: 16px 0;">
          <h4 style="color:#FAF8F5;">Uploaded Materials & AI Visual Analysis</h4>
          ${filesHtml}
        </div>

        <div style="background: #2D2926; padding: 16px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #10b981;">
          <h4 style="margin-top:0; color:#10b981;">Recommended Operations Follow-Up</h4>
          <p style="margin: 0; font-size: 14px;">${data.recommendedFollowUp}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (isMailConfigured()) {
      await sendMail({
        fromName: 'Yanhal Operations',
        to: COMPANY_EMAIL,
        subject: `[Confidential Briefing] Project Enquiry: ${data.projectType} — ${data.visitorName || 'Client'}`,
        html,
      });
      await assistantStorage.recordNotification({
        type: 'owner_briefing',
        recipientEmail: COMPANY_EMAIL,
        subject: `[Confidential Briefing] Project Enquiry: ${data.projectType} — ${data.visitorName || 'Client'}`,
        contentHtml: html,
        status: 'sent',
        enquiryId: data.enquiryId,
      });
      return { success: true };
    } else {
      console.log(`[Email Service] SMTP not configured. Owner briefing logged for ${COMPANY_EMAIL}`);
      await assistantStorage.recordNotification({
        type: 'owner_briefing',
        recipientEmail: COMPANY_EMAIL,
        subject: `[Confidential Briefing] Project Enquiry: ${data.projectType} — ${data.visitorName || 'Client'}`,
        contentHtml: html,
        status: 'failed',
        error: 'SMTP not configured',
        enquiryId: data.enquiryId,
      });
      return { success: false, error: 'SMTP not configured' };
    }
  } catch (err: any) {
    console.error('[Email Service] Owner briefing email delivery failed:', err);
    await assistantStorage.recordNotification({
      type: 'owner_briefing',
      recipientEmail: COMPANY_EMAIL,
      subject: `[Confidential Briefing] Project Enquiry: ${data.projectType} — ${data.visitorName || 'Client'}`,
      contentHtml: html,
      status: 'failed',
      error: err.message || 'SMTP delivery exception',
      enquiryId: data.enquiryId,
    });
    return { success: false, error: err.message };
  }
}
