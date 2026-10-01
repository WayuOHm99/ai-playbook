// Run: node scripts/lib/dedupe-sessions.test.mjs
import assert from 'node:assert/strict';
import { dedupeSessions } from './dedupe-sessions.mjs';

// A resumed session replays the first session's prompts, then adds one new prompt.
const original = { date: '2026-09-30', out: ['[U] สร้างคลัง', '[A] ok', '[U] ทำต่อ', '[A] done'] };
const resumed = { date: '2026-10-01', out: ['[U] สร้างคลัง', '[A] ok', '[U] ทำต่อ', '[A] done', '[U] push ด้วย', '[A] pushed'] };
const pureReplay = { date: '2026-10-01', out: ['[U] สร้างคลัง', '[A] ok'] };

const result = dedupeSessions([original, resumed, pureReplay]);
assert.equal(result.length, 2, 'a session with no new prompt is dropped');
assert.deepEqual(result[1].out, ['[U] push ด้วย', '[A] pushed'], 'replayed lines are removed from the resumed session');
assert.deepEqual(result[0].out, original.out, 'the first session is kept intact');
console.log('dedupe-sessions: 3/3 passed');
