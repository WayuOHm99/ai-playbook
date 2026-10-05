// Real Git fixtures: node --test scripts/review-candidate.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { captureReviewCandidate } from './review-candidate.mjs';

const testRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../.scratch/review-candidate-tests');
const cli = fileURLToPath(new URL('./review-candidate.mjs', import.meta.url));
mkdirSync(testRoot, { recursive: true });
function fixture(t) {
  const cwd = mkdtempSync(join(testRoot, 'run-'));
  t.after(() => {
    const target = resolve(cwd);
    if (!target.startsWith(testRoot + sep)) throw new Error('Fixture cleanup outside test root');
    rmSync(target, { recursive: true, force: true });
  });
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-b', 'main');
  git('config', 'user.name', 'Workflow fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'core.autocrlf', 'false');
  writeFileSync(join(cwd, '.gitignore'), '.scratch/\n');
  writeFileSync(join(cwd, 'app.txt'), 'original\n');
  git('add', '.gitignore', 'app.txt');
  git('commit', '-m', 'baseline');
  const base = git('rev-parse', 'HEAD');
  git('update-ref', 'refs/remotes/origin/main', base);
  git('switch', '-c', 'fix/1-demo');
  const commit = (file, contents) => {
    writeFileSync(join(cwd, file), contents);
    git('add', '--', file);
    git('commit', '-m', 'candidate change');
    return git('rev-parse', 'HEAD');
  };
  return { cwd, git, base, commit };
}

test('rejects an empty commit range before a candidate exists', t => {
  const f = fixture(t);
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: 'origin/main' }), /No changes/);
});

test('rejects uncommitted implementation and a new untracked regression test', t => {
  const f = fixture(t);
  writeFileSync(join(f.cwd, 'app.txt'), 'changed\n');
  writeFileSync(join(f.cwd, 'regression.test.txt'), 'new test\n');
  assert.equal(f.git('diff', 'origin/main...HEAD'), '');
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: 'origin/main' }), /Uncommitted.*app\.txt[\s\S]*regression\.test\.txt/);
});

test('includes both the implementation and newly committed test in the pinned diff', t => {
  const f = fixture(t);
  f.commit('app.txt', 'changed\n');
  const candidate = f.commit('regression.test.txt', 'new test\n');
  const snapshot = captureReviewCandidate({ cwd: f.cwd, base: 'origin/main' });
  assert.equal(snapshot.base, f.base);
  assert.equal(snapshot.candidate, candidate);
  assert.deepEqual(snapshot.changedFiles, ['app.txt', 'regression.test.txt']);
  const diff = f.git('diff', snapshot.mergeBase, snapshot.candidate);
  assert.match(diff, /\+changed/);
  assert.match(diff, /\+new test/);
});

test('accepts git-ignored evidence files without hiding unrelated untracked files', t => {
  const f = fixture(t);
  f.commit('app.txt', 'changed\n');
  mkdirSync(join(f.cwd, '.scratch'));
  writeFileSync(join(f.cwd, '.scratch', 'evidence.txt'), 'fixture evidence\n');
  assert.ok(captureReviewCandidate({ cwd: f.cwd, base: f.base }).candidate);
  writeFileSync(join(f.cwd, 'unrelated.txt'), 'untracked work\n');
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: f.base }), /Uncommitted.*unrelated\.txt/);
});

test('rejects a clean new commit when the reviewed candidate is stale', t => {
  const f = fixture(t);
  const reviewed = f.commit('app.txt', 'changed\n');
  f.commit('app.txt', 'changed again after review\n');
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: f.base, expectedCandidate: reviewed }), /Candidate changed/);
});

test('accepts the exact reviewed candidate and retains a frozen base when a remote ref moves', t => {
  const f = fixture(t);
  const reviewed = f.commit('app.txt', 'changed\n');
  const first = captureReviewCandidate({ cwd: f.cwd, base: 'origin/main' });
  f.git('update-ref', 'refs/remotes/origin/main', reviewed);
  const final = captureReviewCandidate({ cwd: f.cwd, base: first.base, expectedCandidate: first.candidate });
  assert.equal(final.base, f.base);
  assert.equal(final.candidate, reviewed);
  assert.deepEqual(final.changedFiles, ['app.txt']);
});

test('rejects a missing base and an option-like ref without executing shell text', t => {
  const f = fixture(t);
  f.commit('app.txt', 'changed\n');
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: 'missing-ref' }), /Cannot resolve base/);
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: '--help' }), /Cannot resolve base/);
});

test('rejects staged changes after a candidate commit', t => {
  const f = fixture(t);
  const reviewed = f.commit('app.txt', 'changed\n');
  writeFileSync(join(f.cwd, 'app.txt'), 'staged after review\n');
  f.git('add', 'app.txt');
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: f.base, expectedCandidate: reviewed }), /Uncommitted.*app\.txt/);
});

test('preserves leading whitespace in changed file names', t => {
  const f = fixture(t);
  f.commit(' spaced.txt', 'new file\n');
  assert.deepEqual(captureReviewCandidate({ cwd: f.cwd, base: f.base }).changedFiles, [' spaced.txt']);
});

test('captures the branch diff when the base has diverged', t => {
  const f = fixture(t);
  f.git('switch', 'main');
  const advancedBase = f.commit('base-only.txt', 'remote change\n');
  f.git('switch', 'fix/1-demo');
  const candidate = f.commit('app.txt', 'candidate change\n');
  const snapshot = captureReviewCandidate({ cwd: f.cwd, base: advancedBase });
  assert.equal(snapshot.base, advancedBase);
  assert.equal(snapshot.mergeBase, f.base);
  assert.equal(snapshot.candidate, candidate);
  assert.deepEqual(snapshot.changedFiles, ['app.txt']);
});

test('CLI emits candidate JSON, returns nonzero for stale review, and rejects malformed arguments', t => {
  const f = fixture(t);
  const reviewed = f.commit('app.txt', 'changed\n');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd: f.cwd, encoding: 'utf8' });
  const captured = run('--base', 'origin/main');
  assert.equal(captured.status, 0, captured.stderr);
  assert.equal(JSON.parse(captured.stdout).candidate, reviewed);
  const checked = run('--base', f.base, '--expect', reviewed);
  assert.equal(checked.status, 0, checked.stderr);
  f.commit('app.txt', 'changed after review\n');
  const stale = run('--base', f.base, '--expect', reviewed);
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /Candidate changed/);
  for (const args of [[], ['--base'], ['--base', f.base, '--base', f.base], ['--unknown', 'value']]) {
    assert.equal(run(...args).status, 1, `Expected rejection for ${args.join(' ')}`);
  }
});

function submoduleFixture(t) {
  const f = fixture(t);
  const source = fixture(t);
  f.git('-c', 'protocol.file.allow=always', '-c', 'core.autocrlf=false', 'submodule', 'add', source.cwd, 'module');
  f.git('commit', '-m', 'add local fixture submodule');
  const base = f.git('rev-parse', 'HEAD');
  const child = (...args) => f.git('-C', 'module', ...args);
  child('config', 'user.name', 'Workflow fixture');
  child('config', 'user.email', 'fixture@example.invalid');
  child('config', 'core.autocrlf', 'false');
  assert.equal(child('status', '--porcelain=v1'), '', 'child fixture must start clean');
  return { ...f, base, child };
}

test('rejects dirty submodule work even when Git configuration hides it', t => {
  const f = submoduleFixture(t);
  f.commit('app.txt', 'candidate change\n');
  f.git('config', 'diff.ignoreSubmodules', 'all');
  writeFileSync(join(f.cwd, 'module', 'app.txt'), 'uncommitted child change\n');
  assert.equal(f.git('status', '--porcelain=v1', '--untracked-files=all'), '');
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: f.base }), /Uncommitted.*module/);
  writeFileSync(join(f.cwd, 'module', 'app.txt'), 'original\n');
  writeFileSync(join(f.cwd, 'module', 'new-test.txt'), 'untracked child test\n');
  f.git('config', 'submodule.module.ignore', 'all');
  assert.equal(f.git('status', '--porcelain=v1', '--untracked-files=all'), '');
  assert.throws(() => captureReviewCandidate({ cwd: f.cwd, base: f.base }), /Uncommitted.*module/);
});

test('includes a committed submodule pointer change even when Git configuration hides it', t => {
  const f = submoduleFixture(t);
  writeFileSync(join(f.cwd, 'module', 'app.txt'), 'committed child change\n');
  f.child('add', 'app.txt');
  f.child('commit', '-m', 'child candidate');
  f.git('add', 'module');
  f.git('commit', '-m', 'update child pointer');
  f.git('config', 'diff.ignoreSubmodules', 'all');
  const snapshot = captureReviewCandidate({ cwd: f.cwd, base: f.base });
  assert.deepEqual(snapshot.changedFiles, ['module']);
  const args = snapshot.diffCommand.split(' ').slice(1);
  assert.match(f.git(...args), /Subproject commit/);
});
