/**
 * Yanhal Holdings Ltd — shared runtime clock & grounding helpers.
 *
 * The ONLY source of truth for "what is the date/time" anywhere in the assistant.
 * Nothing in prompts or fallback replies may hard-code a date: it is generated here,
 * at the moment the prompt/reply is assembled, in East Africa Time (UTC+3, no DST).
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Company was established in 2020 — no company-related date can legitimately precede it. */
export const COMPANY_FOUNDED_YEAR = 2020;

export interface RuntimeClock {
  year: number;
  weekday: string;
  dateLong: string; // weekday, month, day, year
  timeLabel: string; // e.g. "1:37 PM"
  isoDate: string; // e.g. "2026-10-04"
  stamp: string; // full human stamp incl. timezone
  officeOpenNow: boolean;
  officeStatus: string;
}

export function getRuntimeClock(now: Date = new Date()): RuntimeClock {
  const eat = new Date(now.getTime() + EAT_OFFSET_MS);
  const year = eat.getUTCFullYear();
  const month = eat.getUTCMonth();
  const day = eat.getUTCDate();
  const dow = eat.getUTCDay();
  const hour = eat.getUTCHours();
  const minute = eat.getUTCMinutes();
  const minutes = hour * 60 + minute;

  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const timeLabel = `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
  const weekday = DAYS[dow];
  const dateLong = `${weekday}, ${MONTHS[month]} ${day}, ${year}`;
  const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  let officeOpenNow = false;
  if (dow >= 1 && dow <= 5) officeOpenNow = minutes >= 8 * 60 && minutes < 17 * 60;
  else if (dow === 6) officeOpenNow = minutes >= 9 * 60 && minutes < 13 * 60;

  const officeStatus = officeOpenNow
    ? 'The Nairobi office is open right now.'
    : dow === 0
      ? 'The Nairobi office is closed today (Sunday).'
      : 'The Nairobi office is closed at this hour.';

  return {
    year, weekday, dateLong, timeLabel, isoDate,
    stamp: `${dateLong}, ${timeLabel} East Africa Time (EAT, UTC+3)`,
    officeOpenNow, officeStatus,
  };
}

/** Rules appended to every system prompt. */
export const NEVER_INVENT_RULES = `ACCURACY RULES (mandatory):
   - Never invent or guess dates, years, times, prices, hours, names, phone numbers, projects or any other company fact.
   - For anything about today's date, day, time or the current year, use ONLY the LIVE CLOCK value above. Ignore your own training knowledge of the date.
   - For company details, hours, contacts and rates use ONLY the REFERENCE KNOWLEDGE in this prompt. If a fact is not there, say you do not have it and offer our direct contacts instead of guessing.`;

/** Block injected into every system prompt at assembly time. */
export function buildRuntimeFactsBlock(now: Date = new Date()): string {
  const c = getRuntimeClock(now);
  return `LIVE CLOCK (generated at request time — the single source of truth for the date): ${c.stamp}. Current year: ${c.year}. ${c.officeStatus}`;
}

const CLOCK_QUESTION_RE =
  /(what[’']?s?\s+(is\s+)?(the\s+)?(date|day|time|year)\b|\b(today[’']?s|current|todays)\s+(date|day|time|year)\b|\b(date|day|time)\s+(is\s+it\s+)?(today|now)\b|\bwhat\s+(year|month|day)\s+is\s+it\b|\bwhat\s+time\s+is\s+it\b|\bare\s+you\s+(open|closed)\s+(right\s+)?(now|today)\b|\bare\s+you\s+open\b.*\b(now|today)\b)/i;

export function isClockQuestion(message: string): boolean {
  return CLOCK_QUESTION_RE.test(message || '');
}

/** Deterministic answer for calendar/time questions — never touches the model. */
export function answerClockQuestion(message: string, now: Date = new Date()): string | null {
  if (!isClockQuestion(message)) return null;
  const c = getRuntimeClock(now);
  const m = (message || '').toLowerCase();
  if (/\bopen|closed\b/.test(m)) {
    return `It is ${c.timeLabel} EAT on ${c.dateLong}. ${c.officeStatus} Our hours are Monday to Friday 8:00 AM – 5:00 PM and Saturday 9:00 AM – 1:00 PM East Africa Time, closed on Sunday.`;
  }
  if (/\btime\b/.test(m) && !/\bdate|day\b/.test(m)) return `It is ${c.timeLabel} East Africa Time (EAT) on ${c.dateLong}.`;
  if (/\byear\b/.test(m) && !/\bdate\b/.test(m)) return `The current year is ${c.year}.`;
  return `Today is ${c.dateLong} (East Africa Time).`;
}

const MONTH_ALT = MONTHS.join('|');
const FULL_DATE_RE = new RegExp(`\\b(?:${MONTH_ALT})\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, 'gi');
const NOW_YEAR_RE = /\b(?:today|now|currently|current year|this year|the date is|it(?:'s| is))\b[^.\n]{0,40}?\b((?:19|20)\d{2})\b/gi;

/** Returns the first implausible year found in a date-like context, or null. */
export function findImplausibleYear(text: string, now: Date = new Date()): number | null {
  const current = getRuntimeClock(now).year;
  const bad = (y: number) => y < COMPANY_FOUNDED_YEAR || y > current + 1;
  for (const re of [FULL_DATE_RE, NOW_YEAR_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text || ''))) {
      const y = Number(m[1]);
      // "now"-style phrases must match the live year exactly; explicit dates only need to be plausible.
      if (re === NOW_YEAR_RE ? y !== current && y >= 2000 : bad(y)) return y;
    }
  }
  return null;
}

/**
 * Lightweight verification step: if a generated reply states a year that contradicts the
 * live clock, drop the offending sentence(s). If nothing is left, fall back to the clock answer.
 */
export function guardReplyAgainstClock(
  reply: string,
  now: Date = new Date()
): { reply: string; corrected: boolean; badYear: number | null } {
  const badYear = findImplausibleYear(reply, now);
  if (badYear === null) return { reply, corrected: false, badYear: null };
  const sentences = reply.split(/(?<=[.!?])\s+/).filter(s => findImplausibleYear(s, now) === null);
  const cleaned = sentences.join(' ').trim();
  const c = getRuntimeClock(now);
  return {
    reply: cleaned ? cleaned : `Today is ${c.dateLong} (East Africa Time).`,
    corrected: true,
    badYear,
  };
}

/** Maps a question to the verified knowledge tables that should have been used to answer it. */
export function detectKnowledgeSources(question: string, toolsUsed: string[] = []): string[] {
  const q = (question || '').toLowerCase();
  const s = new Set<string>();
  if (isClockQuestion(q)) s.add('runtime_clock');
  if (/\b(hours?|open|closed|opening)\b/.test(q)) s.add('company_hours_table');
  if (/\b(phone|call|whatsapp|email|contact|number)\b/.test(q)) s.add('company_contacts_table');
  if (/\b(price|cost|rate|kes|usd|budget|estimate|sqm|per\s*sq)/.test(q)) s.add('rate_benchmarks_table');
  if (/\b(where|located|address|office|headquarters|nairobi)\b/.test(q)) s.add('company_location_table');
  if (/\b(ceo|leader|leadership|who (runs|leads)|manager)\b/.test(q)) s.add('leadership_table');
  toolsUsed.forEach(t => s.add(`tool:${t}`));
  if (s.size === 0) s.add('general_prompt_knowledge');
  return [...s];
}

/** Structured, greppable trace of how a factual answer was produced. */
export function logKnowledgeSources(
  channel: string,
  info: { question: string; sources: string[]; deterministic?: boolean; corrected?: boolean; badYear?: number | null; clock?: string }
): void {
  try {
    console.info('[AI_PROVENANCE]', JSON.stringify({
      at: new Date().toISOString(),
      channel,
      question: (info.question || '').slice(0, 160),
      sources: info.sources,
      deterministic: !!info.deterministic,
      correctedByGuard: !!info.corrected,
      badYear: info.badYear ?? null,
      clock: info.clock ?? getRuntimeClock().stamp,
    }));
  } catch (_) { /* logging must never break a reply */ }
}
