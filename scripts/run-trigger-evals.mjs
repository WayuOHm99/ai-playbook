// Trigger evals: does the agent load a skill for the queries that should trigger it, and not for near-misses?
// Usage: node scripts/run-trigger-evals.mjs --skill new-request [--tool codex|claude] [--runs 1] [--concurrency 3] [--fixture-root D:/ev]
// Each invocation owns a unique D:\ev\run-<random> root; queries get separate children.
// Detection: Claude = a Skill tool call with that skill name; Codex = the agent reading <skill>/SKILL.md.
// Results are appended to evals/results.md.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_FIXTURE_PARENT, runEvalFixtures } from './lib/eval-workspace.mjs';

const VAULT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const skill = arg('--skill');
const tool = arg('--tool', 'codex');
const runs = Number(arg('--runs', 1));
const concurrency = Number(arg('--concurrency', 3));
const fixtureParent = arg('--fixture-root', DEFAULT_FIXTURE_PARENT);
const TIMEOUT_MS = 240_000;
if (!skill) { console.error('--skill is required'); process.exit(2); }
const set = JSON.parse(readFileSync(join(VAULT, 'evals', `${skill}.json`), 'utf8'));

const FIXTURE = {
  'AGENTS.md': '# AGENTS.md\nSmall internal hospital web app (Vue + Express). Tracker: BACKLOG.md. Verify: npm test.\n',
  'STATE.md': '# State\nPhase: implement. Current ticket: #3 login page (in progress). Next action: finish form validation.\n',
  'BACKLOG.md': '# Backlog\n| # | Date | Source | Idea | Risk | Triage | Decision | Issue | Status |\n|---|---|---|---|---|---|---|---|---|\n',
  'README.md': '# Demo\nระบบ demo\n',
};

const jobs = [];
for (const [expect, list] of [['trigger', set.should], ['no-trigger', set.shouldNot]]) {
  list.forEach((q, i) => { for (let r = 0; r < runs; r++) jobs.push({ id: `${expect === 'trigger' ? 's' : 'n'}${i}r${r}`, expect, q }); });
}

const detect = (out) => tool === 'claude'
  ? out.split('\n').some((l) => { try { return JSON.parse(l).message?.content?.some((b) => b.type === 'tool_use' && b.name === 'Skill' && String(b.input?.skill || '').includes(skill)); } catch { return false; } })
  : new RegExp(`[\\\\/]${skill}[\\\\/]+SKILL\\.md`, 'i').test(out);

const runOne = (job, dir) => new Promise((res, rej) => {
  for (const [f, c] of Object.entries(FIXTURE)) writeFileSync(join(dir, f), c);
  const cmd = tool === 'claude'
    ? ['claude', ['-p', job.q, '--model', 'sonnet', '--permission-mode', 'plan', '--max-turns', '3', '--output-format', 'stream-json', '--verbose']]
    : ['codex', ['exec', '-m', 'gpt-6-luna', '--skip-git-repo-check', job.q]];
  const p = spawn(cmd[0], cmd[1], { cwd: dir, shell: true });
  let out = '';
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => (out += d));
  const t = setTimeout(() => p.kill(), TIMEOUT_MS);
  p.on('error', (error) => { clearTimeout(t); rej(error); });
  p.on('close', () => {
    clearTimeout(t);
    const fired = detect(out);
    const authFail = /Failed to authenticate|usage limit/i.test(out);
    res({ ...job, fired, pass: authFail ? null : fired === (job.expect === 'trigger'), authFail });
  });
});

const results = await runEvalFixtures(jobs, {
  fixtureParent,
  concurrency,
  execute: runOne,
  onResult(r) {
    console.log(`${r.pass === null ? 'ERR ' : r.pass ? 'pass' : 'FAIL'} ${r.expect.padEnd(10)} fired=${r.fired} ${r.q.slice(0, 70)}`);
  },
});

const valid = results.filter((r) => r.pass !== null);
const recall = valid.filter((r) => r.expect === 'trigger');
const neg = valid.filter((r) => r.expect === 'no-trigger');
const pct = (a) => (a.length ? Math.round((100 * a.filter((r) => r.pass).length) / a.length) : 0);
const line = `| ${new Date().toISOString().slice(0, 10)} | ${skill} | ${tool} | ${runs} | ${pct(recall)}% (${recall.filter((r) => r.pass).length}/${recall.length}) | ${pct(neg)}% (${neg.filter((r) => r.pass).length}/${neg.length}) | ${results.length - valid.length} |`;
const file = join(VAULT, 'evals', 'results.md');
if (!existsSync(file)) writeFileSync(file, '# Trigger eval results\n\n| Date | Skill | Tool | Runs | Should trigger (recall) | Near-miss correctly ignored | Errors |\n|---|---|---|---|---|---|---|\n');
appendFileSync(file, `${line}\n`);
const fails = valid.filter((r) => !r.pass).map((r) => `  - ${r.expect}: ${r.q}`);
console.log(`\n${line}${fails.length ? `\nFailures:\n${fails.join('\n')}` : ''}`);
