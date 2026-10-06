// Prove the same CI entry point rejects bad data and skipped tests in owned copies.
// Retain synthetic fixtures; do not install skills, touch real homes or modify source tests.
import assert from 'node:assert/strict';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

assert.equal(process.platform, 'win32', 'Windows is required for the actual CI entry point');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const parent = join(root, '.scratch', 'ci-failure-probe');
mkdirSync(parent, { recursive: true });
const fixture = mkdtempSync(join(parent, 'run-'));
const paths = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
for (const path of paths) {
  if (path === 'me' || path.startsWith('me/')) continue;
  const source = resolve(root, path), target = resolve(fixture, path);
  for (const [base, full] of [[root, source], [fixture, target]]) {
    const rel = relative(base, full);
    assert.ok(rel && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel), 'Path escapes fixture');
  }
  assert.ok(lstatSync(source).isFile() && !lstatSync(source).isSymbolicLink(), 'Only tracked regular files may be copied');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}
const cataloguePath = join(fixture, 'skills', 'catalog.json');
const original = readFileSync(cataloguePath);
const catalogue = JSON.parse(original);
const probeSkill = catalogue.skills.find(skill => skill.name === 'ask-matt');
assert.ok(probeSkill, 'The intentional probe needs the active ask-matt skill');
probeSkill.invocation = 'intentional-invalid-probe';
writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 2));

function probe(name, expected) {
  const run = spawnSync('pwsh', ['-NoProfile', '-File', join(fixture, 'scripts', 'ci-checks.ps1')], {
    cwd: fixture, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024,
    // A child's expected failures must not add misleading PASS messages to the job summary.
    env: { ...process.env, GITHUB_STEP_SUMMARY: '' },
  });
  const log = (run.stdout ?? '') + (run.stderr ?? '');
  writeFileSync(join(fixture, `${name}.log`), log);
  assert.ifError(run.error);
  assert.equal(run.signal, null);
  assert.equal(run.status, 1, `Expected CI failure, got ${run.status}: ${log}`);
  assert.match(log, expected);
  const result = { probe: name, status: 'PASS', childExit: run.status, observed: log.match(expected)?.[0] };
  console.log(JSON.stringify(result));
  return result;
}
const results = [probe('bad-catalogue', /catalog\.json: invocation mismatch for ask-matt/)];
writeFileSync(cataloguePath, original);
writeFileSync(join(fixture, 'scripts', 'ci-intentional-skip.test.mjs'),
  "import test from 'node:test';\ntest.skip('CI intentional synthetic skip probe', () => {});\n");
results.push(probe('skipped-test', /Node tests must all run and pass/));
writeFileSync(join(fixture, 'probe-results.json'), JSON.stringify({ fixture, results }, null, 2));
console.log(`Failure detection PASS: two actual nonzero CI entry-point runs; retained synthetic fixture ${fixture}`);
