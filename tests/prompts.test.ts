import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  answerClockQuestion, findImplausibleYear, getRuntimeClock, guardReplyAgainstClock,
  buildRuntimeFactsBlock, NEVER_INVENT_RULES, isClockQuestion, COMPANY_FOUNDED_YEAR,
} from '../src/lib/runtimeClock.js';
import { buildDynamicSystemInstruction } from '../src/lib/dynamicChat.js';
import { buildSystemPrompt } from '../src/lib/assistantOrchestrator.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 2031-03-05 12:00 UTC => Wednesday, March 5, 2031 3:00 PM EAT. Deliberately NOT the real year.
const FAKE_NOW = new Date(Date.UTC(2031, 2, 5, 12, 0, 0));

/** Remove the (legitimate) live-clock line so we can look for any *other* year literal. */
function stripClock(prompt: string, now: Date) {
  return prompt.replace(buildRuntimeFactsBlock(now), '');
}

test('runtime clock formats East Africa Time', () => {
  const c = getRuntimeClock(FAKE_NOW);
  assert.equal(c.dateLong, 'Wednesday, March 5, 2031');
  assert.equal(c.timeLabel, '3:00 PM');
  // 22:30 UTC on Dec 31 is already Jan 1 in Nairobi
  assert.equal(getRuntimeClock(new Date(Date.UTC(2027, 11, 31, 22, 30))).dateLong, 'Saturday, January 1, 2028');
});

for (const [name, build] of [
  ['dynamicChat', (n: Date) => buildDynamicSystemInstruction(n)],
  ['orchestrator', (n: Date) => buildSystemPrompt(false, undefined, undefined, n)],
  ['orchestrator(voice)', (n: Date) => buildSystemPrompt(true, undefined, undefined, n)],
] as const) {
  test(`${name} prompt is assembled at runtime with the live date`, () => {
    const prompt = build(FAKE_NOW);
    assert.ok(prompt.includes('Wednesday, March 5, 2031'), 'live date must be injected');
    assert.ok(prompt.includes(NEVER_INVENT_RULES), 'never-invent rules must be present');
  });

  test(`${name} prompt contains no static year`, () => {
    const years = [...stripClock(build(FAKE_NOW), FAKE_NOW).matchAll(/\b(19|20)\d{2}\b/g)].map(m => Number(m[0]));
    for (const y of years) assert.equal(y, COMPANY_FOUNDED_YEAR, `unexpected static year ${y} in ${name} prompt`);
    // and it must differ between two different "now" values
    assert.notEqual(build(FAKE_NOW), build(new Date(Date.UTC(2040, 0, 1))));
  });
}

test('no source file hard-codes a full calendar date string', () => {
  const re = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+20\d{2}/;
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [path.join(dir, e.name)] : []);
  for (const f of [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'netlify'))]) {
    assert.ok(!re.test(fs.readFileSync(f, 'utf8')), `static date string found in ${path.relative(ROOT, f)}`);
  }
});

test('"what is the date" variants are answered deterministically from the clock', () => {
  for (const q of ['What’s is the date today', "what's the date", 'What is today’s date?', 'what day is it', 'current year?']) {
    assert.ok(isClockQuestion(q), q);
    const a = answerClockQuestion(q, FAKE_NOW)!;
    assert.ok(a.includes('2031'), `${q} -> ${a}`);
    assert.ok(!a.includes('2023'));
  }
  assert.equal(answerClockQuestion('what services do you offer', FAKE_NOW), null);
});

test('verification guard removes an implausible year from a generated reply', () => {
  const now = new Date(Date.UTC(2026, 9, 4, 6, 0, 0));
  assert.equal(findImplausibleYear('Today\'s date is October 10, 2023.', now), 2023);
  assert.equal(findImplausibleYear('It is currently 2023.', now), 2023);
  assert.equal(findImplausibleYear('Today is October 4, 2026.', now), null);
  assert.equal(findImplausibleYear('We were established in 2020.', now), null);
  const g = guardReplyAgainstClock('Today\'s date is October 10, 2023.', now);
  assert.ok(g.corrected);
  assert.ok(g.reply.includes('October 4, 2026'));
  const mixed = guardReplyAgainstClock('Today is October 10, 2023. Our hours are 8 to 5.', now);
  assert.equal(mixed.reply, 'Our hours are 8 to 5.');
});
