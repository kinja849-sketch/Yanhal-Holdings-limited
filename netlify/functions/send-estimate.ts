// Netlify serverless endpoint for the Start Project form (mirrors /api/send-estimate in server.ts).
// Accepts multipart/form-data, emails the company briefing and the client's summary copy.
// @ts-ignore - busboy ships no bundled types
import busboy from 'busboy';
import { sendEstimateEmails, estimateHttpResponse, type EstimateFile } from '../../src/lib/estimateMailer.js';

const json = (statusCode: number, obj: unknown) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

function parseMultipart(event: any): Promise<{ fields: Record<string, string>; files: EstimateFile[] }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(event.headers || {})) headers[k.toLowerCase()] = String(v);

    const fields: Record<string, string> = {};
    const files: EstimateFile[] = [];
    const bb = busboy({ headers });

    bb.on('field', (name: string, value: string) => { fields[name] = value; });
    bb.on('file', (_name: string, stream: NodeJS.ReadableStream, info: { filename?: string }) => {
      const chunks: Buffer[] = [];
      stream.on('data', (c: Buffer) => chunks.push(c));
      stream.on('end', () => {
        const content = Buffer.concat(chunks);
        if (content.length > 0) files.push({ filename: info.filename || `estimate_image_${files.length + 1}.jpg`, content });
      });
    });
    bb.on('error', reject);
    bb.on('close', () => resolve({ fields, files }));

    bb.end(Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8'));
  });
}

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { fields, files } = await parseMultipart(event);
    if (!fields.name || !fields.phone || !fields.service) {
      return json(400, { error: 'Missing required fields' });
    }

    const result = await sendEstimateEmails(fields as any, files);
    const { status, body } = estimateHttpResponse(result);
    return json(status, body);
  } catch (err: any) {
    console.error('[send-estimate] Error:', err);
    return json(500, { success: false, error: `Failed to process submission: ${err?.message || 'unknown error'}` });
  }
};
