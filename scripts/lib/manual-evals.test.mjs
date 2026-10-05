import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { MANUAL_CASES, gradeManualCase, runManualSuite } from './manual-evals.mjs';
import { evalExitCode, executionProblem, gradeLegacyTrigger, parseCodexTrace, summarizeEvals } from './eval-outcomes.mjs';
import { runEvalProcess } from './eval-process.mjs';

const scratch = resolve('.scratch/manual-eval-tests');
mkdirSync(scratch, { recursive: true });
const root = mkdtempSync(join(scratch, 'run-'));
const command = (cmd, output, exit_code = 0) => ({ type: 'item.completed', item: { type: 'command_execution', command: cmd, aggregated_output: output, exit_code } });
const loaded = skill => [command(`Get-Content D:/skills/${skill}/SKILL.md`, `---\nname: ${skill}\n---\n# Skill`), command('Get-Content D:/ai-playbook/instructions/core.md', '# Agent working rules'), command('Get-Content AGENTS.md', '# Synthetic eval')];
const completed = (events = [], final = 'สรุป scope แล้วหยุด') => [...events, { type: 'item.completed', item: { type: 'agent_message', text: final } }, { type: 'turn.completed' }].map(e => JSON.stringify(e)).join('\n');
const healthy = stdout => ({ code: 0, signal: null, timedOut: false, stdout, stderr: '' });
const snapshot = { files: {}, head: 'baseline', branch: 'fix/eval', status: '', remotes: '', backlog: '', state: '', handoff: '', subject: '' };
const bootstrap = MANUAL_CASES.find(c => c.id === 'retro-bootstrap');
const git = (dir, ...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const fixtureEnv = { ...process.env }; delete fixtureEnv.NODE_TEST_CONTEXT;
const writerDocuments = head => ({
  state: `# State\nPhase: implement\nTicket: EVAL-1 approved\nBranch: fix/eval\nLast commit: ${head}\nPushed: no (no remote)\nDone: node --test baseline.test.mjs passes (1 test)\nIn progress: add(\"2\",\"3\") returns 23\nNext action: write regression before fix\nDecisions/assumptions: no dependencies; integer strings are accepted\nFast verify: node --test baseline.test.mjs\nFull verify: node --test baseline.test.mjs\nEnvironment: no blockers\n`,
  handoff: '# Handoff\nGoal: add("2","3") should return 5; currently returns 23\nFences: do not change baseline.test.mjs or push\nOpen review findings: none yet\nEvidence: node --test baseline.test.mjs passes (1 test); unresolved bug in add.mjs:1\nContinuation prompt: อ่าน STATE.md กับ HANDOFF.md บน branch fix/eval แล้วเขียน regression test ก่อนแก้\n',
});

test('nonzero no-trigger runs are inconclusive, never a legacy pass (F7 reproduction)', () => {
  const result = gradeLegacyTrigger('new-request', 'codex', { ...healthy(completed()), code: 9 }, false);
  assert.equal(result.status, 'inconclusive'); assert.equal(result.fired, null);
  assert.equal(evalExitCode([result]), 2);
});

test('timeout, spawn error, signal, auth, quota and unsupported model never score', () => {
  for (const changes of [{ timedOut: true }, { error: 'ENOENT' }, { signal: 'SIGTERM' }, { stderr: 'OAuth session expired and could not be refreshed' }, { stderr: 'usage limit reached' }, { stderr: 'model is not supported' }]) {
    const result = gradeManualCase(bootstrap, { ...healthy(completed(loaded('retro'))), ...changes }, snapshot, snapshot);
    assert.equal(result.status, 'inconclusive', JSON.stringify(changes));
    assert.ok(executionProblem({ ...healthy(''), ...changes }));
  }
});

test('zero valid and mixed summaries show coverage and never imply all passed', () => {
  assert.deepEqual(summarizeEvals([{ status: 'inconclusive' }]), { total: 1, passed: 0, failed: 0, inconclusive: 1, scored: 0, passRate: 0, scoredPassRate: null });
  assert.equal(summarizeEvals([]).passRate, null); assert.equal(evalExitCode([]), 2);
  assert.equal(summarizeEvals([{ status: 'pass' }, { status: 'inconclusive' }]).passRate, 50);
  assert.equal(evalExitCode([{ status: 'fail' }]), 1); assert.equal(evalExitCode([{ status: 'pass' }]), 0);
});

test('malformed, missing final, missing completion, turn.failed and error events are inconclusive', () => {
  for (const stdout of ['', 'not JSON', '{}', JSON.stringify({ type: 'turn.completed' }), JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'done' } }), completed([{ type: 'turn.failed' }]), completed([{ type: 'error', message: 'rate limit' }])]) {
    assert.ok(parseCodexTrace(stdout).problem);
    assert.equal(gradeManualCase(bootstrap, healthy(stdout), snapshot, snapshot).status, 'inconclusive');
  }
});

test('path mentions, echo, started commands, failed reads and missing content do not prove loading', () => {
  const falseReads = [
    command('echo D:/skills/retro/SKILL.md', 'name: retro'),
    { type: 'item.started', item: loaded('retro')[0].item },
    command('Get-Content D:/skills/retro/SKILL.md', 'name: retro', 1),
    command('Get-Content D:/skills/retro/SKILL.md', 'file not found'),
  ];
  for (const event of falseReads) {
    const result = gradeManualCase(bootstrap, healthy(completed([event, loaded('retro')[1]], 'D:/skills/retro/SKILL.md name: retro')), snapshot, snapshot);
    assert.equal(result.status, 'fail'); assert.equal(result.checks.skillLoaded, false);
  }
});

test('successful skill read without core fails; loading after a write fails', () => {
  const noCore = gradeManualCase(bootstrap, healthy(completed([loaded('retro')[0]])), snapshot, snapshot);
  assert.equal(noCore.checks.coreLoaded, false); assert.equal(noCore.status, 'fail');
  const late = gradeManualCase(bootstrap, healthy(completed([{ type: 'item.started', item: { type: 'file_change' } }, ...loaded('retro')])), snapshot, snapshot);
  assert.equal(late.checks.loadedBeforeActions, false);
});

test('quoted native shell reads count; bootstrap rejects extractor, raw history and research', () => {
  const quoted = loaded('retro').map(e => command(`powershell.exe -Command "${e.item.command}"`, e.item.aggregated_output));
  assert.equal(gradeManualCase(bootstrap, healthy(completed(quoted)), snapshot, snapshot).status, 'pass');
  for (const extra of [command('node D:/ai-playbook/scripts/extract-history.mjs', 'done'), command('Get-Content C:/home/.codex/sessions/data.jsonl', 'raw'), command('curl https://example.invalid', 'data'), { type: 'item.completed', item: { type: 'web_search' } }]) {
    assert.equal(gradeManualCase(bootstrap, healthy(completed([...loaded('retro'), extra])), snapshot, snapshot).status, 'fail');
  }
});

test('readonly checks observe actual changed files, commits and remotes', () => {
  for (const after of [{ ...snapshot, files: { 'secret.txt': 'new' } }, { ...snapshot, head: 'newcommit' }, { ...snapshot, remotes: 'origin remote' }]) {
    assert.equal(gradeManualCase(bootstrap, healthy(completed([...loaded('retro'), command('node -e "mutate()"', 'done')])), snapshot, after).status, 'fail');
  }
});

test('unknown executables before loading fail ordering; missing action evidence is inconclusive', () => {
  for (const cmd of ['node -e "mutate()"', 'python -c "mutate()"', 'Set-Content BACKLOG.md changed']) {
    const result = gradeManualCase(bootstrap, healthy(completed([command(cmd, 'done'), ...loaded('retro')])), snapshot, snapshot);
    assert.equal(result.status, 'fail'); assert.equal(result.checks.loadedBeforeActions, false);
  }
  const changed = { ...snapshot, files: { 'new.txt': 'changed' } };
  assert.equal(gradeManualCase(bootstrap, healthy(completed(loaded('retro'))), snapshot, changed).reason, 'unobservable-write-order');
});

test('triage requires pending approval and one appended row preserving prior backlog', () => {
  const before = { ...snapshot, backlog: '# Backlog\nprior row\n' };
  const row = '| 1 | today | user | EVAL_SHORTCUTS_01 | low | unsorted | later | none | open |\n';
  const after = { ...before, files: { 'BACKLOG.md': 'changed' }, backlog: before.backlog + row };
  const events = [...loaded('new-request'), { type: 'item.completed', item: { type: 'file_change' } }];
  const evaluate = (final, observed = after) => gradeManualCase(MANUAL_CASES[0], healthy(completed(events, final)), before, observed);
  const good = 'P5 EVAL_SHORTCUTS_01 คีย์ลัด เก็บไว้ก่อน\nP4 pagination 50 รออนุมัติ';
  assert.equal(evaluate(good).status, 'pass');
  for (const final of ['P5 EVAL_SHORTCUTS_01\nP4 pagination 50 implemented', 'P5 EVAL_SHORTCUTS_01\nP4 pagination 50 already approved', 'P5 EVAL_SHORTCUTS_01\nP4 pagination 50']) assert.equal(evaluate(final).checks.approvalPending, false);
  for (const backlog of [row, before.backlog + 'EVAL_SHORTCUTS_01 unsorted\n', before.backlog + row + row]) assert.equal(evaluate(good, { ...after, backlog }).checks.ideaAppended, false);
});

test('handoff writer rejects missing required fields and evidence even when committed', () => {
  const testCase = MANUAL_CASES.find(c => c.coverage === 'handoff-write');
  const docs = writerDocuments(snapshot.head);
  const after = { ...snapshot, ...docs, head: 'commit', subject: 'wip: handoff EVAL-1', files: { 'HANDOFF.md': 'new', 'STATE.md': 'changed' } };
  const events = [...loaded('handoff-pack'), command('node --test baseline.test.mjs', '# tests 1\n# fail 0'), { type: 'item.completed', item: { type: 'file_change' } }];
  const evaluate = observed => gradeManualCase(testCase, healthy(completed(events)), snapshot, observed);
  assert.equal(evaluate(after).status, 'pass');
  for (const label of ['Phase', 'Ticket', 'Branch', 'Last commit', 'Pushed', 'Done', 'In progress', 'Next action', 'Decisions/assumptions', 'Environment']) {
    const result = evaluate({ ...after, state: after.state.replace(new RegExp(`^${label}:.*\\n`, 'm'), '') });
    assert.equal(result.status, 'fail', label);
  }
  for (const label of ['Goal', 'Fences', 'Open review findings', 'Evidence', 'Continuation prompt']) {
    const result = evaluate({ ...after, handoff: after.handoff.replace(new RegExp(`^${label}:.*\\n`, 'm'), '') });
    assert.equal(result.status, 'fail', label);
  }
  assert.equal(evaluate({ ...after, state: 'node --test baseline.test.mjs', handoff: '23 regression' }).status, 'fail');
  assert.equal(evaluate({ ...after, state: after.state.replace('Branch: fix/eval', 'Branch: main') }).checks.stateMatchesFixture, false);
  assert.equal(evaluate({ ...after, handoff: after.handoff.replace('Goal: add("2","3") should return 5; currently returns 23', 'Goal:') }).checks.handoffFields, false);
  assert.equal(gradeManualCase(testCase, healthy(completed([...loaded('handoff-pack'), { type: 'item.completed', item: { type: 'file_change' } }])), snapshot, after).checks.fastVerifyRan, false);
});

test('Claude legacy detection pairs exact Skill tool names with successful results', () => {
  const use = { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Skill', id: 'call1', input: { skill: 'new-request' } }] } };
  const reply = { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'call1', content: 'loaded' }] } };
  const result = { type: 'result', subtype: 'success', is_error: false };
  const run = events => gradeLegacyTrigger('new-request', 'claude', healthy(events.map(e => JSON.stringify(e)).join('\n')), true);
  assert.equal(run([use, reply, result]).status, 'pass');
  assert.equal(run([use, result]).status, 'fail');
  assert.equal(run([use, { ...reply, message: { content: [{ type: 'tool_result', tool_use_id: 'call1', is_error: true }] } }, result]).status, 'fail');
  assert.equal(run([{ ...use, message: { content: [{ ...use.message.content[0], input: { skill: 'other-new-request' } }] } }, reply, result]).status, 'fail');
  assert.equal(run([use, { ...result, is_error: true }]).status, 'inconclusive');
  assert.equal(run([null, result]).status, 'inconclusive');
});

test('all six deterministic cases grade fixture state and successful completed tools', async () => {
  const parent = join(root, 'suite'); mkdirSync(parent); writeFileSync(join(parent, 'prior.txt'), 'keep');
  const results = await runManualSuite(MANUAL_CASES, { fixtureParent: parent, async execute({ testCase, dir, prompt }) {
    assert.ok(prompt.startsWith(`$${testCase.skill}\n`));
    const events = loaded(testCase.skill); let final = 'scope แล้วหยุด';
    if (testCase.coverage === 'triage') {
      writeFileSync(join(dir, 'BACKLOG.md'), readFileSync(join(dir, 'BACKLOG.md'), 'utf8') + '| 1 | today | user | EVAL_SHORTCUTS_01 | low | unsorted | later | none | open |\n');
      events.push({ type: 'item.completed', item: { type: 'file_change' } });
      final = 'P5 EVAL_SHORTCUTS_01 คีย์ลัด เก็บไว้ก่อน\nP4 pagination 50 หลังอนุมัติ';
    }
    if (testCase.coverage === 'handoff-write') {
      events.push(command('node --test baseline.test.mjs', execFileSync(process.execPath, ['--test', 'baseline.test.mjs'], { cwd: dir, encoding: 'utf8', env: fixtureEnv })));
      const docs = writerDocuments(git(dir, 'rev-parse', 'HEAD'));
      writeFileSync(join(dir, 'STATE.md'), docs.state);
      writeFileSync(join(dir, 'HANDOFF.md'), docs.handoff);
      events.push({ type: 'item.completed', item: { type: 'file_change' } });
      git(dir, 'add', 'STATE.md', 'HANDOFF.md'); git(dir, 'commit', '-m', 'wip: handoff EVAL-1');
    }
    if (testCase.coverage === 'handoff-receive') events.push(command('Get-Content HANDOFF.md', readFileSync(join(dir, 'HANDOFF.md'), 'utf8')), command('git status', git(dir, 'status')), command('git log -3', git(dir, 'log', '-3')), command('node --test baseline.test.mjs', execFileSync(process.execPath, ['--test', 'baseline.test.mjs'], { cwd: dir, encoding: 'utf8', env: fixtureEnv })));
    return healthy(completed(events, final));
  } });
  assert.equal(results.length, 6);
  for (const result of results) assert.equal(result.status, 'pass', JSON.stringify(result));
  assert.deepEqual(readdirSync(parent), ['prior.txt']);
});

test('a correct-looking triage reply cannot conceal implementation edits', async () => {
  const [result] = await runManualSuite([MANUAL_CASES[0]], { fixtureParent: join(root, 'negative'), async execute({ dir }) {
    writeFileSync(join(dir, 'BACKLOG.md'), 'EVAL_SHORTCUTS_01 unsorted');
    writeFileSync(join(dir, 'add.mjs'), 'implemented without approval');
    return healthy(completed([...loaded('new-request'), { type: 'item.completed', item: { type: 'file_change' } }], 'P5 EVAL_SHORTCUTS_01\nP4 pagination รออนุมัติ'));
  } });
  assert.equal(result.status, 'fail'); assert.equal(result.checks.onlyBacklogChanged, false);
});

test('inconclusive jobs continue the suite, but failed tree termination preserves fixtures and stops execution', async () => {
  const parent = join(root, 'retained'); let calls = 0;
  const results = await runManualSuite(MANUAL_CASES.slice(0, 3), { fixtureParent: parent, async execute() {
    calls++;
    return { ...healthy(''), code: 1, retainFixture: calls === 2, timedOut: calls === 2 };
  } });
  assert.equal(calls, 2); assert.ok(results.every(r => r.status === 'inconclusive'));
  assert.equal(results[2].reason, 'not-run-after-termination-error');
  assert.ok(existsSync(results[1].retainedFixtureRoot));
});

test('real child receives Thai and shell metacharacters literally through stdin', async () => {
  const fake = join(root, 'stdin.mjs'); writeFileSync(fake, 'let s=""; for await (const d of process.stdin) s+=d; process.stdout.write(s);');
  const prompt = '$new-request\nภาษาไทย & echo INJECTED; `whoami` $(secret)';
  const result = await runEvalProcess(fake, [], { cwd: root, prompt });
  assert.equal(result.code, 0); assert.equal(result.stdout, prompt); assert.equal(result.error, undefined);
});

test('missing executable yields a process error after close', async () => {
  const result = await runEvalProcess(join(root, 'missing.exe'), [], { cwd: root, prompt: '' });
  assert.ok(result.error); assert.equal(executionProblem(result), 'process-error');
});

test('real child exit 9 is inconclusive and timeout kills a spawned descendant', async () => {
  const exit = join(root, 'exit.mjs'); writeFileSync(exit, 'process.exit(9);');
  assert.equal(executionProblem(await runEvalProcess(exit, [], { cwd: root, prompt: '' })), 'nonzero-exit');
  const timeout = join(root, 'timeout.mjs'), pidFile = join(root, 'descendant.pid');
  writeFileSync(timeout, 'import {spawn} from "node:child_process"; import {writeFileSync} from "node:fs"; const p=spawn(process.execPath,["-e","setInterval(()=>{},1000)"],{stdio:"ignore"}); writeFileSync(process.argv[2],String(p.pid)); setInterval(()=>{},1000);');
  const result = await runEvalProcess(timeout, [pidFile], { cwd: root, prompt: '', timeoutMs: 1500 });
  assert.equal(result.timedOut, true); assert.equal(result.retainFixture, false);
  const pid = Number(readFileSync(pidFile, 'utf8'));
  if (process.platform === 'win32') {
    const listing = spawnSync('tasklist.exe', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], { encoding: 'utf8' });
    assert.equal(listing.status, 0); assert.ok(!listing.stdout.includes(`"${pid}"`), listing.stdout);
  } else assert.throws(() => process.kill(pid, 0));
});

test('manual CLI defaults to no execution, lists six cases, and grades a fake CLI JSON trace', () => {
  const cli = resolve('scripts/run-manual-evals.mjs');
  const idle = spawnSync(process.execPath, [cli], { encoding: 'utf8' }); assert.equal(idle.status, 2); assert.match(idle.stderr, /require --live/);
  const listing = spawnSync(process.execPath, [cli, '--list'], { encoding: 'utf8' }); assert.equal(listing.status, 0); assert.equal(JSON.parse(listing.stdout).length, 6);
  const fake = join(root, 'fake-cli.mjs');
  writeFileSync(fake, `let s=''; for await (const d of process.stdin) s+=d; if(!s.startsWith('$retro\\n')) process.exit(9); console.log(${JSON.stringify(completed(loaded('retro')))});`);
  const run = spawnSync(process.execPath, [cli, '--live', '--case', 'retro-bootstrap', '--codex-bin', fake, '--fixture-root', join(root, 'cli')], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr); const report = JSON.parse(run.stdout); assert.equal(report.summary.passed, 1);
  assert.ok(!run.stdout.includes('Agent working rules')); assert.equal(report.mode, 'manual');
});

test('legacy CLI is gated and every failed fake CLI job stays inconclusive', () => {
  const cli = resolve('scripts/run-trigger-evals.mjs');
  const gated = spawnSync(process.execPath, [cli, '--skill', 'new-request'], { encoding: 'utf8' }); assert.equal(gated.status, 2); assert.match(gated.stderr, /legacy-trigger/);
  const fake = join(root, 'exit.mjs');
  const run = spawnSync(process.execPath, [cli, '--legacy-trigger', '--live', '--skill', 'new-request', '--cli-bin', fake, '--fixture-root', join(root, 'legacy')], { encoding: 'utf8' });
  assert.equal(run.status, 2, run.stderr); const report = JSON.parse(run.stdout);
  assert.equal(report.summary.inconclusive, 16); assert.equal(report.summary.passed, 0); assert.equal(report.summary.scoredPassRate, null);
});
