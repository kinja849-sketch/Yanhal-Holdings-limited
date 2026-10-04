/**
 * Pre-deploy transport check. Run via `npm run check:mail` (also part of `npm run predeploy`).
 * Warns when no mail transport is configured; fails the build when REQUIRE_MAIL=true.
 */
import dotenv from 'dotenv';
import { activeMailProvider } from '../src/lib/mailTransport.js';

dotenv.config();
const provider = activeMailProvider();

if (provider === 'none') {
  const msg = 'No mail transport configured (set RESEND_API_KEY, or SMTP_USER + SMTP_PASS). Enquiries will be RECORDED only (Netlify Forms + function logs), not emailed.';
  if (process.env.REQUIRE_MAIL === 'true') {
    console.error(`[predeploy] FAIL: ${msg}`);
    process.exit(1);
  }
  console.warn(`[predeploy] WARNING: ${msg}`);
} else {
  console.log(`[predeploy] Mail transport: ${provider}`);
}
