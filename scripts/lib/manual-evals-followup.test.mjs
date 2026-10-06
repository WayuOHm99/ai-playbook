import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseCodexTrace, gradeLegacyTrigger } from './eval-outcomes.mjs';
import { MANUAL_CASES, gradeManualCase } from './manual-evals.mjs';

const command = (command, output) => ({ type: 'item.completed', item: {
  type: 'command_execution', command, aggregated_output: output, exit_code: 0,
} });
const reads = [
  command('Get-Content D:/skills/retro/SKILL.md', '---\nname: retro\n---'),
  command('Get-Content D:/ai-playbook/instructions/core.md', '# Playbook policy'),
  command('Get-Content AGENTS.md', '# Synthetic eval'),
];
const message = text => ({ type: 'item.completed', item: { type: 'agent_message', text } });
const complete = [...reads, message('โหลดกฎแล้ว หยุดตาม scope'), { type: 'turn.completed' }];
const encode = events => events.map(e => JSON.stringify(e)).join('\n');
const healthy = events => ({ code: 0, signal: null, timedOut: false, stderr: '', stdout: encode(events) });
const bootstrap = MANUAL_CASES.find(c => c.id === 'retro-bootstrap');
const snapshot = { files: {}, head: 'same', branch: 'fix/eval', status: '', remotes: '' };
const scratch = resolve('.scratch/manual-eval-followup-tests');
mkdirSync(scratch, { recursive: true });
const root = mkdtempSync(join(scratch, 'run-'));

test('an earlier completion cannot validate a later truncated turn or item', () => {
  for (const tail of [
    [{ type: 'turn.started' }],
    [{ type: 'item.started', item: { type: 'command_execution', id: 'pending' } }],
    [{ type: 'turn.started' }, message('still running')],
    [{ type: 'turn.started' }, { type: 'item.started', item: { type: 'agent_message', id: 'pending' } }],
  ]) {
    const result = gradeManualCase(bootstrap, healthy([...complete, ...tail]), snapshot, snapshot);
    assert.equal(result.status, 'inconclusive', JSON.stringify(tail));
    assert.equal(result.reason, 'incomplete-events');
    assert.equal(parseCodexTrace(encode([...complete, ...tail])).problem, 'incomplete-events');
  }
});

test('the final completed turn must supply its own nonempty final message', () => {
  for (const tail of [
    [{ type: 'turn.started' }, { type: 'turn.completed' }],
    [{ type: 'turn.started' }, message('  '), { type: 'turn.completed' }],
    [{ type: 'turn.started' }, command('Get-Content AGENTS.md', '# Synthetic eval'), { type: 'turn.completed' }],
  ]) assert.equal(parseCodexTrace(encode([...complete, ...tail])).problem, 'incomplete-events');
  const second = [{ type: 'turn.started' }, message('final second turn'), { type: 'turn.completed' }];
  const valid = parseCodexTrace(encode([...complete, ...second]) + '\n\n');
  assert.equal(valid.problem, null); assert.equal(valid.final, 'final second turn');
  assert.equal(parseCodexTrace(encode(complete)).problem, null);
});

test('legacy Codex trigger scoring also excludes a truncated last turn', () => {
  const result = gradeLegacyTrigger('retro', 'codex', healthy([...complete, { type: 'turn.started' }]), true);
  assert.equal(result.status, 'inconclusive'); assert.equal(result.fired, null);
});

test('sed mutations before rules are actions even when another action follows loading', () => {
  const later = command('node -e "console.log(1)"', '1');
  for (const mutation of [
    "sed -i 's/foo/bar/' STATE.md",
    "sed --in-place 's/foo/bar/' STATE.md",
    "sed -i.bak 's/foo/bar/' STATE.md",
    "sed -ni '1p' STATE.md",
    "sed 'w written.txt' STATE.md",
    "sed 'e touch written.txt' STATE.md",
    "powershell.exe -Command \"sed -i 's/foo/bar/' STATE.md\"",
    "sed -i 's/foo/bar/' STATE.md; powershell.exe -Command \"Get-Content AGENTS.md\"",
  ]) {
    const events = [command(mutation, ''), ...reads, later, message('หยุดตาม scope'), { type: 'turn.completed' }];
    const result = gradeManualCase(bootstrap, healthy(events), snapshot, snapshot);
    assert.equal(result.status, 'fail', mutation);
    assert.equal(result.checks.loadedBeforeActions, false, mutation);
  }
});

test('the conservative action gate retains ordinary reads and treats all sed forms as potential writes', () => {
  assert.equal(gradeManualCase(bootstrap, healthy(complete), snapshot, snapshot).status, 'pass');
  const events = [command("sed -n '1,200p' README.md", 'demo'), ...complete];
  const result = gradeManualCase(bootstrap, healthy(events), snapshot, snapshot);
  assert.equal(result.status, 'fail'); assert.equal(result.checks.loadedBeforeActions, false);
});

test('running manual CLI reports a truncated fake stream as inconclusive with exit 2 and preserves the parent', () => {
  const fake = join(root, 'truncated-codex.mjs');
  writeFileSync(fake, `for await (const chunk of process.stdin) {}\nprocess.stdout.write(${JSON.stringify(encode([...complete, { type: 'turn.started' }]))});\n`);
  const parent = join(root, 'fixtures'); mkdirSync(parent); writeFileSync(join(parent, 'prior.txt'), 'keep');
  const output = join(root, 'report.json');
  const run = spawnSync(process.execPath, [resolve('scripts/run-manual-evals.mjs'), '--live', '--case', 'retro-bootstrap', '--codex-bin', fake, '--fixture-root', parent, '--output', output], { encoding: 'utf8' });
  assert.equal(run.status, 2, run.stderr);
  const report = JSON.parse(readFileSync(output, 'utf8'));
  assert.equal(report.summary.passed, 0); assert.equal(report.summary.inconclusive, 1);
  assert.equal(report.summary.scoredPassRate, null); assert.equal(report.results[0].reason, 'incomplete-events');
  assert.deepEqual(readdirSync(parent), ['prior.txt']);
});
