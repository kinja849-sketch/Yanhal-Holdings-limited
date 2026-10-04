import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/** Calls the real Netlify handler with a real multipart body (what the browser sends). */
async function callHandler(fields: Record<string, string>) {
  const { handler } = await import('../netlify/functions/send-estimate.js');
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const req = new Request('http://localhost/api/send-estimate', { method: 'POST', body: fd });
  const res: any = await handler({
    httpMethod: 'POST',
    headers: { 'content-type': req.headers.get('content-type') },
    body: Buffer.from(await req.arrayBuffer()).toString('base64'),
    isBase64Encoded: true,
  });
  return { status: res.statusCode as number, body: JSON.parse(res.body) };
}

const VALID = { name: 'Test Client', phone: '+254700000000', email: 'client@example.com', service: 'Renovation', location: 'Nairobi', size: '120', message: 'hi' };

test('hidden Netlify estimator form is registered with every posted field', () => {
  const html = read('index.html');
  const form = html.match(/<form[^>]*name="estimator"[^>]*>[\s\S]*?<\/form>/)?.[0];
  assert.ok(form, 'estimator form missing from index.html');
  assert.match(form!, /data-netlify="true"/);
  assert.match(form!, /name="form-name"[^>]*value="estimator"/);
  const posted = [...read('src/components/StartProject.tsx').matchAll(/formPayload\.append\(\s*"([\w-]+)"/g)].map(m => m[1]);
  assert.ok(posted.length > 5);
  for (const f of posted.filter(f => f !== 'form-name')) {
    assert.ok(new RegExp(`name="${f}"`).test(form!), `field "${f}" posted by StartProject is not registered in the Netlify form`);
  }
});

test('/api/send-estimate is routed to an existing Netlify function', () => {
  const toml = read('netlify.toml');
  assert.match(toml, /from\s*=\s*"\/api\/send-estimate"\s*\n\s*to\s*=\s*"\/\.netlify\/functions\/send-estimate"/);
  assert.ok(fs.existsSync(path.join(ROOT, 'netlify/functions/send-estimate.ts')));
});

test('front-end only shows success after a confirmed response', () => {
  const src = read('src/components/StartProject.tsx');
  assert.match(src, /res\.ok && result\?\.success/);
  assert.ok(!/couldn't send your enquiry just now/.test(src), 'generic error message must not return');
});

test('API rejects incomplete submissions with 400', async () => {
  const r = await callHandler({ name: 'x' });
  assert.equal(r.status, 400);
});

test('no mail transport: enquiry is still recorded and visitor is told it was received (202)', async () => {
  const saved = { r: process.env.RESEND_API_KEY, u: process.env.SMTP_USER, p: process.env.SMTP_PASS };
  delete process.env.RESEND_API_KEY; delete process.env.SMTP_USER; delete process.env.SMTP_PASS;
  const logs: string[] = [];
  const origLog = console.log, origErr = console.error;
  console.log = (...a: any[]) => { logs.push(a.join(' ')); };
  console.error = () => {};
  try {
    const r = await callHandler(VALID);
    assert.equal(r.status, 202);
    assert.equal(r.body.success, true);
    assert.equal(r.body.deliveryStatus, 'recorded_only');
    assert.equal(r.body.recorded, true);
    assert.ok(logs.some(l => l.includes('[ENQUIRY_RECORD]') && l.includes('Test Client')), 'internal record must be logged');
  } finally {
    console.log = origLog; console.error = origErr;
    if (saved.r) process.env.RESEND_API_KEY = saved.r;
    if (saved.u) process.env.SMTP_USER = saved.u;
    if (saved.p) process.env.SMTP_PASS = saved.p;
  }
});

test('working transport: company briefing + owner briefing + visitor copy are sent (200)', async () => {
  const savedKey = process.env.RESEND_API_KEY, savedFetch = globalThis.fetch;
  process.env.RESEND_API_KEY = 're_test_key';
  const sent: string[] = [];
  globalThis.fetch = (async (url: any, init: any) => {
    if (String(url).includes('api.resend.com')) {
      sent.push(JSON.parse(init.body).subject);
      return new Response('{"id":"x"}', { status: 200 });
    }
    return savedFetch(url, init);
  }) as any;
  try {
    const r = await callHandler(VALID);
    assert.equal(r.status, 200);
    assert.equal(r.body.deliveryStatus, 'delivered');
    assert.equal(r.body.companyEmailSent, true);
    assert.equal(r.body.ownerBriefingSent, true);
    assert.equal(r.body.clientEmailSent, true);
    assert.ok(sent.some(s => s.startsWith('New Project Estimate')));
    assert.ok(sent.some(s => s.includes('Confidential Briefing')));
    assert.ok(sent.some(s => s.includes('Your Project Summary')));
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey) process.env.RESEND_API_KEY = savedKey; else delete process.env.RESEND_API_KEY;
  }
});

test('transport rejecting the company email still records and reports 202, never a hard failure', async () => {
  const savedKey = process.env.RESEND_API_KEY, savedFetch = globalThis.fetch;
  process.env.RESEND_API_KEY = 're_test_key';
  globalThis.fetch = (async (url: any, init: any) =>
    String(url).includes('api.resend.com') ? new Response('{"message":"boom"}', { status: 500 }) : savedFetch(url, init)) as any;
  const origErr = console.error; console.error = () => {};
  try {
    const r = await callHandler(VALID);
    assert.equal(r.status, 202);
    assert.equal(r.body.recorded, true);
    assert.equal(r.body.companyEmailSent, false);
    assert.ok(r.body.errors.length > 0);
  } finally {
    console.error = origErr; globalThis.fetch = savedFetch;
    if (savedKey) process.env.RESEND_API_KEY = savedKey; else delete process.env.RESEND_API_KEY;
  }
});
