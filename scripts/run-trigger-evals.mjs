// Historical auto-trigger experiment only. Manual-only skills use run-manual-evals.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEvalWorkspace } from './lib/eval-workspace.mjs';
import { runEvalProcess } from './lib/eval-process.mjs';
import { gradeLegacyTrigger, summarizeEvals, evalExitCode } from './lib/eval-outcomes.mjs';

const VAULT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const options = {};
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (['--legacy-trigger', '--live'].includes(key)) { options[key] = true; continue; }
    if (!['--skill', '--tool', '--runs', '--cli-bin', '--model', '--fixture-root', '--timeout-ms', '--output'].includes(key) || !process.argv[i + 1] || process.argv[i + 1].startsWith('--')) throw new Error(`Invalid or missing option: ${key}`);
    options[key] = process.argv[++i];
  }
  if (!options['--legacy-trigger'] || !options['--live']) throw new Error('Historical automatic-trigger experiment requires --legacy-trigger --live; use run-manual-evals.mjs for current manual-only skills');
  const skill = options['--skill'];
  if (!/^[a-z][a-z0-9-]*$/.test(skill ?? '')) throw new Error('--skill is required and must be a safe skill name');
  const tool = options['--tool'] ?? 'codex';
  if (!['codex', 'claude'].includes(tool)) throw new Error('--tool must be codex or claude');
  if (!options['--cli-bin']) throw new Error('--cli-bin is required (native executable or Node CLI entry point)');
  const runs = Number(options['--runs'] ?? 1), timeoutMs = Number(options['--timeout-ms'] ?? 240_000);
  if (!Number.isInteger(runs) || runs < 1 || !Number.isInteger(timeoutMs) || timeoutMs < 1) throw new Error('runs and timeout-ms must be positive integers');
  const set = JSON.parse(readFileSync(join(VAULT, 'evals', `${skill}.json`), 'utf8'));
  if (![set.should, set.shouldNot].every(list => Array.isArray(list) && list.every(q => typeof q === 'string' && q.trim()))) throw new Error('Invalid legacy query set');
  const jobs = [];
  for (const [expected, list] of [[true, set.should], [false, set.shouldNot]]) list.forEach((q, i) => { for (let r = 0; r < runs; r++) jobs.push({ id: `${expected ? 's' : 'n'}${i}r${r}`, expected, q }); });
  if (!jobs.length) throw new Error('Legacy query set is empty');
  const workspace = createEvalWorkspace(options['--fixture-root']), results = [];
  let retain = false;
  try {
    for (const job of jobs) {
      let result;
      if (retain) result = { status: 'inconclusive', reason: 'not-run-after-termination-error', fired: null };
      else {
        const dir = workspace.createFixture(job.id);
        for (const [name, content] of Object.entries({
          'AGENTS.md': '# Synthetic trigger fixture\nRead-only. No files, commits, installs, settings or external services. Tracker: BACKLOG.md.\n',
          'STATE.md': '# State\nPhase: implement. Current ticket: login page. Next: form validation.\n',
          'BACKLOG.md': '# Backlog\n', 'README.md': '# Demo\n',
        })) writeFileSync(join(dir, name), content);
        const args = tool === 'codex'
          ? ['exec', '--ephemeral', '--json', '--sandbox', 'read-only', '--color', 'never', '--skip-git-repo-check', ...(options['--model'] ? ['--model', options['--model']] : []), '-C', dir, '-']
          : ['--print', '--verbose', '--output-format', 'stream-json', '--permission-mode', 'plan', '--max-turns', '3', ...(options['--model'] ? ['--model', options['--model']] : [])];
        const execution = await runEvalProcess(resolve(options['--cli-bin']), args, { cwd: dir, prompt: job.q, timeoutMs });
        retain ||= !!execution.retainFixture;
        result = gradeLegacyTrigger(skill, tool, execution, job.expected);
        if (retain) result.retainedFixtureRoot = workspace.root;
      }
      results.push({ id: job.id, expected: job.expected, ...result });
      console.error(`${result.status} ${job.id}${result.reason ? `: ${result.reason}` : ''}`);
    }
  } finally { if (!retain) workspace.cleanup(); }
  const report = { schemaVersion: 1, mode: 'legacy-auto-trigger', skill, tool, runs, summary: summarizeEvals(results), results };
  const json = JSON.stringify(report, null, 2) + '\n';
  if (options['--output']) writeFileSync(resolve(options['--output']), json);
  console.log(json.trimEnd());
  process.exitCode = evalExitCode(results);
} catch (error) { console.error(error.message); process.exitCode = 2; }
