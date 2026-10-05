// Explicit live runs against existing installed skills; never installs/syncs.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { MANUAL_CASES, runManualSuite } from './lib/manual-evals.mjs';
import { runEvalProcess } from './lib/eval-process.mjs';
import { evalExitCode, summarizeEvals } from './lib/eval-outcomes.mjs';

export async function main(args = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (['--live', '--list'].includes(key)) { options[key] = true; continue; }
    if (!['--case', '--codex-bin', '--model', '--fixture-root', '--timeout-ms', '--output'].includes(key) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Invalid or missing option: ${key}`);
    options[key] = args[++i];
  }
  if (options['--list']) { console.log(JSON.stringify(MANUAL_CASES.map(({ id, skill, coverage }) => ({ id, skill, coverage })), null, 2)); return 0; }
  if (!options['--live']) throw new Error('Live evals require --live; they execute installed skills and consume model quota. Use --list or deterministic tests first.');
  if (!options['--codex-bin']) throw new Error('--codex-bin is required (native executable or Node CLI entry point); no installation is performed');
  const selected = options['--case'] ?? 'all';
  const cases = selected === 'all' ? MANUAL_CASES : MANUAL_CASES.filter(c => c.id === selected);
  if (!cases.length) throw new Error(`Unknown case: ${selected}`);
  const timeoutMs = Number(options['--timeout-ms'] ?? 240_000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new Error('--timeout-ms must be a positive integer');
  const binary = resolve(options['--codex-bin']);
  const results = await runManualSuite(cases, {
    fixtureParent: options['--fixture-root'],
    execute: ({ dir, prompt }) => runEvalProcess(binary, ['exec', '--ephemeral', '--json', '--sandbox', 'workspace-write', '--color', 'never', ...(options['--model'] ? ['--model', options['--model']] : []), '-C', dir, '-'], { cwd: dir, prompt, timeoutMs }),
    onResult: r => console.error(`${r.status} ${r.id} (${r.coverage})${r.reason ? `: ${r.reason}` : ''}`),
  });
  const report = { schemaVersion: 1, tool: 'codex', mode: 'manual', model: options['--model'] ?? 'CLI default',
    summary: summarizeEvals(results), results };
  // Only rubric booleans/reasons persist; prompts, raw traces and replies are not saved.
  const json = JSON.stringify(report, null, 2) + '\n';
  if (options['--output']) writeFileSync(resolve(options['--output']), json);
  console.log(json.trimEnd());
  return evalExitCode(results);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { process.exitCode = await main(); }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
