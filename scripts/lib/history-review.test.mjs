import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { redactHistory } from './history-redaction.mjs';
import { captureHistory, releaseReviewed, reviewInfo, requirePrivatePath, validDate } from './history-review.mjs';

const vault = resolve('.');
const scratch = join(vault, '.scratch/history-review-tests'); mkdirSync(scratch, { recursive: true });
const root = mkdtempSync(join(scratch, 'run-'));
const sourceRoot = join(root, 'private-sources'); mkdirSync(sourceRoot);
const since = '2026-10-01';
const codex = (text, role = 'user', timestamp = '2026-10-05T01:00:00Z') => ({ type: 'response_item', timestamp, payload: { type: 'message', role, content: [{ type: role === 'user' ? 'input_text' : 'output_text', text }] } });
const meta = { type: 'session_meta', payload: { cwd: 'C:/Users/EVAL_PRIVATE_PERSON/project', timestamp: '2026-10-05T00:00:00Z' } };
function source(name, events) { const path = join(sourceRoot, name); writeFileSync(path, events.map(e => typeof e === 'string' ? e : JSON.stringify(e)).join('\n')); return path; }
function capture(selections, options = {}) { return captureHistory({ vault, selections, since, outParent: join(root, 'bundles'), ...options }); }
const approved = info => releaseReviewed({ vault, root: info.root, expectedDigest: info.draftSha256, humanReviewed: true });
const allOutput = info => readdirSync(info.root).map(name => readFileSync(join(info.root, name), 'utf8')).join('\n');

test('no arguments fail closed without scanning history or creating a default output', () => {
  const cli = resolve('scripts/extract-history.mjs');
  const run = spawnSync(process.execPath, [cli], { encoding: 'utf8' });
  assert.equal(run.status, 2); assert.match(run.stderr, /Select between 1 and 5/); assert.equal(run.stdout, '');
  assert.throws(() => capture([]), /Select between/);
});

test('explicit selection excludes unselected sessions and omits source path/cwd/session identifiers', () => {
  const selected = source('EVAL_PRIVATE_SOURCE_NAME.jsonl', [meta, codex('รันเทสแล้วพบ regression ก่อนแก้')]);
  source('unselected.jsonl', [meta, codex('UNSELECTED_MARKER')]);
  const info = capture([{ tool: 'codex', path: selected }]);
  assert.equal(info.status, 'needs-human-review'); assert.equal(info.selectedSessions, 1); assert.equal(info.prompts, 1);
  const output = allOutput(info) + JSON.stringify(info);
  for (const value of ['UNSELECTED_MARKER', 'EVAL_PRIVATE_PERSON', 'EVAL_PRIVATE_SOURCE_NAME', sourceRoot]) assert.ok(!output.includes(value), value);
  assert.match(output, /session-001 codex/); assert.equal(info.analysisPath, undefined);
  assert.ok(!readdirSync(info.root).includes('reviewed.txt'));
});

test('selected provenance inside quotes is masked literally, including metadata appearing later', () => {
  const sessionId = 'ea742d28-920d-489f-9749-9355834d547f', cwd = '/srv/SYNTHETIC_HOSPITAL_APP';
  const filename = 'SYNTHETIC_PRIVATE_[SOURCE]+.jsonl', path = join(sourceRoot, filename);
  source(filename, [codex(`Review ${filename} (${path.replace(/\\/g, '/')}), project ${cwd}, session ${sessionId}. Keep the process correction.`),
    { type: 'session_meta', payload: { id: sessionId, cwd, timestamp: '2026-10-05T00:00:00Z' } }]);
  const info = capture([{ tool: 'codex', path }]);
  const released = approved(info);
  for (const value of [filename, path, path.replace(/\\/g, '/'), cwd, sessionId]) assert.ok(!allOutput(released).includes(value));
  assert.match(readFileSync(released.analysisPath, 'utf8'), /Keep the process correction/);
  const claudeId = '8c2c047f-b812-4a27-b71e-d8b93c678f06';
  const claudePath = source('claude-provenance.jsonl', [{ type: 'user', timestamp: '2026-10-05T00:00:00Z', cwd,
    sessionId: claudeId, message: { content: `Project ${cwd}, session ${claudeId}; process correction: retain verification evidence.` } }]);
  const claude = capture([{ tool: 'claude', path: claudePath }]);
  assert.ok(!allOutput(claude).includes(claudeId)); assert.ok(!allOutput(claude).includes(cwd));
});

test('oversized or excessive provenance metadata is rejected before draft persistence', () => {
  const long = source('long-metadata.jsonl', [{ type: 'session_meta', payload: { cwd: 'x'.repeat(4097) } }, codex('Process note')]);
  assert.throws(() => capture([{ tool: 'codex', path: long }]), /4096-character limit/);
  const many = source('many-metadata.jsonl', Array.from({ length: 130 }, (_, i) => ({ type: 'user', sessionId: `synthetic-session-${i}` })));
  assert.throws(() => capture([{ tool: 'claude', path: many }]), /128-value limit/);
});

test('redaction covers synthetic keys, quoted secrets, Thai fields, email, phone, ID and personal paths', () => {
  const values = [
    'sk-proj-' + 'x'.repeat(40), 'ghp_' + 'x'.repeat(36), 'AIza' + 'x'.repeat(35), 'AKIA' + 'A'.repeat(16),
    'eyJ' + 'x'.repeat(12) + '.' + 'x'.repeat(16) + '.' + 'x'.repeat(16),
    'EVAL_FAKE_PASSWORD WITH SPACES', 'EVAL_PERSON_NAME', 'EVAL_HN_0099', 'eval-person@example.invalid', '089-123-4567', '1-2345-67890-12-3', 'C:/Users/EVAL_PERSON_NAME/private file.txt', '/home/EVAL_PERSON_NAME/private.txt',
  ];
  const text = values.slice(0, 5).join('\n') + `\npassword: "${values[5]}"\nชื่อผู้ป่วย: ${values[6]}; HN: ${values[7]}; phone: ${values[10]}\n${values[8]} ${values[9]}\n${values[11]}\n${values[12]}\n${values[13]}\npostgres://synthetic-user:EVAL_DB_PASSWORD@db.invalid/db\n-----BEGIN PRIVATE KEY-----\nEVAL_KEY_BODY\n-----END PRIVATE KEY-----`;
  const result = redactHistory(text);
  for (const value of values) assert.ok(!result.includes(value), `Synthetic value remains: index ${values.indexOf(value)}`);
  assert.ok(!result.includes('EVAL_DB_PASSWORD')); assert.ok(!result.includes('EVAL_KEY_BODY'));
  assert.match(result, /REDACTED/);
  assert.equal(redactHistory('Read https://example.invalid/docs for workflow'), 'Read https://example.invalid/docs for workflow');
});

test('sanitization happens before truncation; tool outputs, noise, old messages and malformed lines stay out', () => {
  const path = source('minimized.jsonl', [meta, codex('OLD_MESSAGE', 'user', '2026-09-01T00:00:00Z'), codex('<environment_context>NOISE_MARKER'),
    { type: 'response_item', payload: { type: 'function_call_output', output: 'RAW_TOOL_MARKER' } }, 'MALFORMED_RAW_MARKER',
    codex('safe '.repeat(390) + 'password: "EVAL_SECRET_LONG_VALUE ' + 'x'.repeat(200) + '"'), codex('assistant '.repeat(100), 'assistant')]);
  const info = capture([{ tool: 'codex', path }]);
  const draft = readFileSync(join(info.root, 'draft.txt'), 'utf8');
  for (const value of ['OLD_MESSAGE', 'NOISE_MARKER', 'RAW_TOOL_MARKER', 'MALFORMED_RAW_MARKER', 'EVAL_SECRET_LONG_VALUE']) assert.ok(!draft.includes(value));
  assert.equal(info.invalidLines, 1);
  const quoted = draft.split('\n').filter(l => /^\[[UA]\]/.test(l));
  assert.ok(quoted.find(l => l.startsWith('[U]')).length <= 2004);
  assert.ok(quoted.find(l => l.startsWith('[A]')).length <= 504);
});

test('Claude content is reduced to text and skips metadata/sidechains/tool results', () => {
  const event = (type, content, extra = {}) => ({ type, timestamp: '2026-10-05T00:00:00Z', cwd: meta.payload.cwd, message: { content }, ...extra });
  const path = source('claude.jsonl', [event('user', 'Process correction: verify before claim'), event('user', 'META_MARKER', { isMeta: true }), event('user', 'SIDECHAIN_MARKER', { isSidechain: true }),
    event('user', [{ type: 'tool_result', content: 'TOOL_MARKER' }]), event('assistant', [{ type: 'text', text: 'Evidence saved' }, { type: 'tool_use', input: 'SECRET_TOOL_MARKER' }])]);
  const info = capture([{ tool: 'claude', path }]); const draft = readFileSync(join(info.root, 'draft.txt'), 'utf8');
  assert.equal(info.prompts, 1); assert.match(draft, /Process correction/);
  for (const marker of ['META_MARKER', 'SIDECHAIN_MARKER', 'TOOL_MARKER']) assert.ok(!draft.includes(marker));
});

test('replayed quotes are deduped only within the same project, without exporting project names', () => {
  const first = source('first.jsonl', [meta, codex('same process note')]);
  const fork = source('fork.jsonl', [meta, codex('same process note'), codex('new correction')]);
  const other = source('other.jsonl', [{ ...meta, payload: { ...meta.payload, cwd: 'C:/Users/OTHER_PRIVATE_NAME/project' } }, codex('same process note')]);
  const info = capture([{ tool: 'codex', path: first }, { tool: 'codex', path: fork }, { tool: 'codex', path: other }]);
  assert.equal(info.exportedSessions, 3); assert.equal(info.prompts, 3);
  assert.ok(!allOutput(info).includes('OTHER_PRIVATE_NAME'));
});

test('release requires explicit human confirmation and a matching digest; draft edits require fresh review', () => {
  const info = capture([{ tool: 'codex', path: source('review.jsonl', [meta, codex('process note')]) }]);
  assert.throws(() => releaseReviewed({ vault, root: info.root, expectedDigest: info.draftSha256 }), /human-reviewed/);
  assert.throws(() => releaseReviewed({ vault, root: info.root, expectedDigest: '0'.repeat(64), humanReviewed: true }), /Draft changed/);
  writeFileSync(join(info.root, 'draft.txt'), '# HUMAN PROCESS SUMMARY\n[U] A regression check prevented rework.\n');
  assert.throws(() => approved(info), /Draft changed/);
  const current = reviewInfo({ vault, root: info.root });
  const released = approved(current);
  assert.equal(released.status, 'ready-for-analysis'); assert.match(released.analysisPath, /reviewed\.txt$/);
  assert.match(readFileSync(released.analysisPath, 'utf8'), /regression check/);
});

test('release refilters known identifiers added during human editing and detects later content changes', () => {
  const info = capture([{ tool: 'codex', path: source('changed.jsonl', [meta, codex('process note')]) }]);
  writeFileSync(join(info.root, 'draft.txt'), 'Process note\npassword: "EDITED_FAKE_SECRET"\nHN: EDITED_FAKE_HN\n');
  const released = approved(reviewInfo({ vault, root: info.root }));
  const text = readFileSync(released.analysisPath, 'utf8'); assert.ok(!text.includes('EDITED_FAKE_SECRET')); assert.ok(!text.includes('EDITED_FAKE_HN'));
  writeFileSync(released.analysisPath, text + '\nTAMPERED\n');
  assert.throws(() => reviewInfo({ vault, root: info.root }), /Reviewed content changed/);
});

test('source limits, duplicates, invalid dates and public output paths are rejected', () => {
  const path = source('limits.jsonl', [meta, codex('process note')]);
  assert.throws(() => capture(Array(6).fill({ tool: 'codex', path })), /between 1 and 5/);
  assert.throws(() => capture([{ tool: 'codex', path }, { tool: 'codex', path }]), /twice/);
  assert.throws(() => capture([{ tool: 'other', path }]), /explicit codex or claude/);
  assert.throws(() => capture([{ tool: 'codex', path }], { since: '2026-02-30' }), /valid/);
  assert.throws(() => capture([{ tool: 'codex', path }], { outParent: join(vault, 'public-history-output') }), /_inbox or .scratch/);
  assert.ok(!validDate('not-date')); assert.ok(validDate('2026-10-05'));
  const large = join(sourceRoot, 'large.jsonl'); writeFileSync(large, 'x'.repeat(20 * 1024 * 1024 + 1));
  assert.throws(() => capture([{ tool: 'codex', path: large }]), /20 MiB/);
});

test('bounded message counts and repeated captures keep separate owned drafts without overwrites', () => {
  const path = source('many.jsonl', [meta, ...Array.from({ length: 201 }, (_, i) => codex(`Process note ${i}`))]);
  const first = capture([{ tool: 'codex', path }]); const second = capture([{ tool: 'codex', path }]);
  assert.notEqual(first.root, second.root); assert.equal(first.prompts, 200); assert.equal(first.omittedMessages, 1);
  assert.equal(readFileSync(join(first.root, 'draft.txt'), 'utf8'), readFileSync(join(second.root, 'draft.txt'), 'utf8'));
  approved(first); assert.throws(() => approved(first), /EEXIST/);
});

test('linked output roots and linked review files are refused', () => {
  const external = join(root, 'external'); mkdirSync(external);
  const link = join(root, 'linked-output'); symlinkSync(external, link, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => requirePrivatePath(vault, link), /link/);
  const info = capture([{ tool: 'codex', path: source('linked-review.jsonl', [meta, codex('note')]) }]);
  // No deletion of existing files: use a new receipt link to an unrelated file.
  const receipt = join(root, 'fake-receipt.json'); writeFileSync(receipt, '{}');
  if (process.platform === 'win32') {
    const receiptDirectory = join(info.root, 'review-receipt.json'); symlinkSync(external, receiptDirectory, 'junction');
  } else symlinkSync(receipt, join(info.root, 'review-receipt.json'));
  assert.throws(() => reviewInfo({ vault, root: info.root }), /regular file/);
});

test('non-string metadata dates are omitted safely; usable message dates still work', () => {
  const path = source('odd-dates.jsonl', [{ type: 'session_meta', payload: { timestamp: { slice: 7 } } }, codex('Undated note', 'user', null), codex('Dated process note')]);
  const info = capture([{ tool: 'codex', path }]);
  assert.equal(info.prompts, 1); assert.ok(!allOutput(info).includes('Undated note'));
  assert.throws(() => capture([null]), /Session file path/);
});

test('invalid manifests and unsupported receipts cannot produce a ready status', () => {
  const selection = [{ tool: 'codex', path: source('invalid-bundles.jsonl', [meta, codex('Process note')]) }];
  const invalid = capture(selection), manifestPath = join(invalid.root, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify({ ...manifest, selectedSessions: 6 }));
  assert.throws(() => reviewInfo({ vault, root: invalid.root }), /Invalid review manifest/);
  writeFileSync(manifestPath, JSON.stringify({ ...manifest, bundleId: 'different-owner' }));
  assert.throws(() => reviewInfo({ vault, root: invalid.root }), /Invalid review manifest/);
  const released = approved(capture(selection)), receiptPath = join(released.root, 'review-receipt.json');
  const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
  writeFileSync(receiptPath, JSON.stringify({ ...receipt, schemaVersion: 999 }));
  assert.throws(() => reviewInfo({ vault, root: released.root }), /review again/);
});

test('changing a draft after release invalidates the current analysis receipt', () => {
  const released = approved(capture([{ tool: 'codex', path: source('post-release-edit.jsonl', [meta, codex('Process note')]) }]));
  writeFileSync(join(released.root, 'draft.txt'), 'New process note requiring review');
  assert.throws(() => reviewInfo({ vault, root: released.root }), /Reviewed content changed/);
});

test('running CLI captures only selected fixtures, reveals metadata only, and releases the exact reviewed digest', () => {
  const cli = resolve('scripts/extract-history.mjs');
  const path = source('cli-personal-name.jsonl', [meta, codex('ชื่อผู้ป่วย: CLI_PERSON; HN: CLI_HN; Process correction: verify first')]);
  const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  const initial = run(['--session', `codex=${path}`, '--since', since, '--out', join(root, 'cli-output')]);
  assert.equal(initial.status, 0, initial.stderr);
  const info = JSON.parse(initial.stdout); assert.equal(info.status, 'needs-human-review');
  for (const marker of ['CLI_PERSON', 'CLI_HN', path]) assert.ok(!initial.stdout.includes(marker));
  const denied = run(['--release-reviewed', info.root, '--expect', info.draftSha256]); assert.equal(denied.status, 2);
  const release = run(['--release-reviewed', info.root, '--human-reviewed', '--expect', info.draftSha256]);
  assert.equal(release.status, 0, release.stderr); assert.equal(JSON.parse(release.stdout).status, 'ready-for-analysis');
  const check = run(['--review-info', info.root]); assert.equal(check.status, 0); assert.equal(JSON.parse(check.stdout).status, 'ready-for-analysis');
  const bad = run(['--session', `codex=${path}`, '--since', '2026-02-30']); assert.equal(bad.status, 2);
  const mixed = run(['--review-info', info.root, '--session', `codex=${path}`]); assert.equal(mixed.status, 2);
});
