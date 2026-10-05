// Real filesystem fixtures only; no Claude/Codex sessions, settings or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEvalWorkspace, runEvalFixtures, waitForEvalChildClose } from './eval-workspace.mjs';

const testRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../.scratch/eval-workspace-tests');
mkdirSync(testRoot, { recursive: true });
function fixture(t) {
  const root = mkdtempSync(join(testRoot, 'test-'));
  const parent = join(root, 'shared');
  mkdirSync(parent);
  const sentinel = join(parent, 'keep.txt');
  writeFileSync(sentinel, 'unrelated work');
  t.after(() => {
    const target = resolve(root);
    if (!target.startsWith(testRoot + sep) || lstatSync(target).isSymbolicLink() || realpathSync(target) !== target) throw new Error('Unsafe test fixture cleanup');
    rmSync(target, { recursive: true, force: true });
  });
  return { root, parent, sentinel };
}
const gate = () => { let release; const promise = new Promise(resolve => { release = resolve; }); return { promise, release }; };

test('two runs with the same job id retain separate files and clean only their own root', t => {
  const f = fixture(t);
  const a = createEvalWorkspace(f.parent);
  const b = createEvalWorkspace(f.parent);
  const da = a.createFixture('s0r0');
  const db = b.createFixture('s0r0');
  writeFileSync(join(da, 'value.txt'), 'A');
  writeFileSync(join(db, 'value.txt'), 'B');
  assert.notEqual(a.root, b.root);
  a.cleanup();
  assert.equal(existsSync(a.root), false);
  assert.equal(readFileSync(join(db, 'value.txt'), 'utf8'), 'B');
  assert.equal(readFileSync(f.sentinel, 'utf8'), 'unrelated work');
  b.cleanup();
  assert.deepEqual(readdirSync(f.parent), ['keep.txt']);
});

test('prior interrupted run is never reused or removed', t => {
  const f = fixture(t);
  const prior = join(f.parent, 'run-old');
  mkdirSync(join(prior, 's0r0'), { recursive: true });
  writeFileSync(join(prior, 's0r0', 'keep.txt'), 'prior evidence');
  const current = createEvalWorkspace(f.parent);
  current.createFixture('s0r0');
  current.cleanup();
  assert.equal(readFileSync(join(prior, 's0r0', 'keep.txt'), 'utf8'), 'prior evidence');
  assert.equal(existsSync(f.sentinel), true);
});

test('fixture ids cannot escape the root and duplicate ids do not replace files', t => {
  const f = fixture(t);
  const workspace = createEvalWorkspace(f.parent);
  for (const id of ['..', '../outside', '..\\outside', resolve(f.parent), 'a/b', 'a\\b', '']) {
    assert.throws(() => workspace.createFixture(id), /Invalid eval fixture id/);
  }
  const dir = workspace.createFixture('s0r0');
  writeFileSync(join(dir, 'keep.txt'), 'keep');
  assert.throws(() => workspace.createFixture('s0r0'), /EEXIST/);
  assert.equal(readFileSync(join(dir, 'keep.txt'), 'utf8'), 'keep');
  workspace.cleanup();
  workspace.cleanup();
  assert.throws(() => workspace.createFixture('n0r0'), /already closed/);
});

test('refuses a workspace whose ownership marker was replaced', t => {
  const f = fixture(t);
  const workspace = createEvalWorkspace(f.parent);
  writeFileSync(join(workspace.root, '.eval-run-owner'), 'another owner');
  assert.throws(() => workspace.cleanup(), /Refusing unowned/);
  assert.throws(() => workspace.createFixture('s0r0'), /Refusing unowned/);
  assert.equal(existsSync(workspace.root), true);
  assert.equal(existsSync(f.sentinel), true);
});

test('refuses a workspace whose marker is missing', t => {
  const f = fixture(t);
  const workspace = createEvalWorkspace(f.parent);
  // Rename this known file; do not broaden deletion permissions for the test.
  renameSync(join(workspace.root, '.eval-run-owner'), join(workspace.root, 'moved-marker'));
  assert.throws(() => workspace.cleanup(), /Refusing unowned/);
  assert.equal(existsSync(workspace.root), true);
});

test('refuses a root replaced with a junction/symlink; target data survives', t => {
  const f = fixture(t);
  const workspace = createEvalWorkspace(f.parent);
  const outside = join(f.root, 'outside');
  mkdirSync(outside);
  writeFileSync(join(outside, 'keep.txt'), 'outside data');
  renameSync(workspace.root, join(f.parent, 'held-root'));
  symlinkSync(outside, workspace.root, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => workspace.cleanup(), /Refusing replaced or linked/);
  assert.equal(readFileSync(join(outside, 'keep.txt'), 'utf8'), 'outside data');
});

test('refuses a replacement ordinary directory even with a copied ownership marker', t => {
  const f = fixture(t);
  const workspace = createEvalWorkspace(f.parent);
  const owner = readFileSync(join(workspace.root, '.eval-run-owner'), 'utf8');
  renameSync(workspace.root, join(f.parent, 'held-root'));
  mkdirSync(workspace.root);
  writeFileSync(join(workspace.root, '.eval-run-owner'), owner);
  writeFileSync(join(workspace.root, 'keep.txt'), 'replacement data');
  assert.throws(() => workspace.cleanup(), /Refusing replaced or linked/);
  assert.throws(() => workspace.createFixture('s0r0'), /Refusing replaced or linked/);
  assert.equal(readFileSync(join(workspace.root, 'keep.txt'), 'utf8'), 'replacement data');
});

test('recursive cleanup does not follow a junction/symlink inside an owned root', t => {
  const f = fixture(t);
  const workspace = createEvalWorkspace(f.parent);
  const outside = join(f.root, 'outside');
  mkdirSync(outside);
  writeFileSync(join(outside, 'keep.txt'), 'outside data');
  symlinkSync(outside, join(workspace.root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  workspace.cleanup();
  assert.equal(existsSync(workspace.root), false);
  assert.equal(readFileSync(join(outside, 'keep.txt'), 'utf8'), 'outside data');
});

test('refuses a redirected parent even if the replacement contains a matching marker', t => {
  const f = fixture(t);
  const workspace = createEvalWorkspace(f.parent);
  const owner = readFileSync(join(workspace.root, '.eval-run-owner'), 'utf8');
  const outside = join(f.root, 'outside');
  const replacement = join(outside, basename(workspace.root));
  mkdirSync(replacement, { recursive: true });
  writeFileSync(join(replacement, '.eval-run-owner'), owner);
  writeFileSync(join(replacement, 'keep.txt'), 'replacement data');
  renameSync(f.parent, join(f.root, 'held-parent'));
  symlinkSync(outside, f.parent, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => workspace.cleanup(), /Refusing replaced or linked/);
  assert.equal(readFileSync(join(replacement, 'keep.txt'), 'utf8'), 'replacement data');
});

test('batch cleans up after successful jobs and retains unrelated files', async t => {
  const f = fixture(t);
  const roots = new Set();
  const results = await runEvalFixtures([{ id: 's0r0' }, { id: 'n0r0' }], {
    fixtureParent: f.parent,
    concurrency: 2,
    execute: async (job, dir) => { roots.add(dirname(dir)); writeFileSync(join(dir, 'fixture.txt'), job.id); return job.id; },
  });
  assert.deepEqual(results.sort(), ['n0r0', 's0r0']);
  assert.equal(roots.size, 1);
  assert.equal(existsSync([...roots][0]), false);
  assert.deepEqual(readdirSync(f.parent), ['keep.txt']);
});

test('two concurrent batches can use the same job id without cleanup interfering', async t => {
  const f = fixture(t);
  const startedA = gate(), startedB = gate(), releaseA = gate(), releaseB = gate();
  let dirA, dirB;
  const a = runEvalFixtures([{ id: 's0r0' }], { fixtureParent: f.parent, execute: async (job, dir) => { dirA = dir; writeFileSync(join(dir, 'value.txt'), 'A'); startedA.release(); await releaseA.promise; return 'A'; } });
  const b = runEvalFixtures([{ id: 's0r0' }], { fixtureParent: f.parent, execute: async (job, dir) => { dirB = dir; writeFileSync(join(dir, 'value.txt'), 'B'); startedB.release(); await releaseB.promise; return 'B'; } });
  await Promise.all([startedA.promise, startedB.promise]);
  assert.notEqual(dirname(dirA), dirname(dirB));
  releaseA.release();
  assert.deepEqual(await a, ['A']);
  assert.equal(readFileSync(join(dirB, 'value.txt'), 'utf8'), 'B');
  releaseB.release();
  assert.deepEqual(await b, ['B']);
  assert.deepEqual(readdirSync(f.parent), ['keep.txt']);
});

test('worker failure waits for active jobs before cleanup and starts no further jobs', async t => {
  const f = fixture(t);
  const activeStarted = gate(), releaseActive = gate();
  const started = [];
  let activeDir;
  const batch = runEvalFixtures([{ id: 's0r0' }, { id: 's1r0' }, { id: 's2r0' }], {
    fixtureParent: f.parent, concurrency: 2,
    execute: async (job, dir) => {
      started.push(job.id);
      if (job.id === 's0r0') { await activeStarted.promise; throw new Error('synthetic spawn failure'); }
      activeDir = dir;
      activeStarted.release();
      await releaseActive.promise;
      assert.equal(existsSync(dir), true);
      return job.id;
    },
  });
  await activeStarted.promise;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(existsSync(activeDir), true);
  releaseActive.release();
  await assert.rejects(batch, /synthetic spawn failure/);
  assert.deepEqual(started, ['s0r0', 's1r0']);
  assert.deepEqual(readdirSync(f.parent), ['keep.txt']);
});

test('a child error does not settle the worker or remove its fixture before close', async t => {
  const f = fixture(t);
  const child = new EventEmitter();
  let dir, settled = false;
  const batch = runEvalFixtures([{ id: 's0r0' }], {
    fixtureParent: f.parent,
    execute: async (job, fixtureDir) => { dir = fixtureDir; await waitForEvalChildClose(child); return job.id; },
  });
  batch.then(() => { settled = true; }, () => { settled = true; });
  child.emit('error', new Error('child kill failed'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false);
  assert.equal(existsSync(dir), true);
  child.emit('close', 1);
  await assert.rejects(batch, /child kill failed/);
  assert.equal(existsSync(dirname(dir)), false);
  assert.deepEqual(readdirSync(f.parent), ['keep.txt']);
});

test('report callback failure still cleans only this run', async t => {
  const f = fixture(t);
  await assert.rejects(runEvalFixtures([{ id: 's0r0' }], { fixtureParent: f.parent, execute: async () => 'ok', onResult: () => { throw new Error('report failed'); } }), /report failed/);
  assert.deepEqual(readdirSync(f.parent), ['keep.txt']);
});

test('worker failure and refused cleanup preserve both errors and the workspace', async t => {
  const f = fixture(t);
  let root;
  await assert.rejects(runEvalFixtures([{ id: 's0r0' }], {
    fixtureParent: f.parent,
    execute: async (job, dir) => {
      root = dirname(dir);
      writeFileSync(join(root, '.eval-run-owner'), 'replaced');
      throw new Error('original worker failure');
    },
  }), error => {
    assert.ok(error instanceof AggregateError);
    assert.match(error.errors[0].message, /original worker failure/);
    assert.match(error.errors[1].message, /Refusing unowned/);
    return true;
  });
  assert.equal(existsSync(root), true);
  assert.equal(existsSync(f.sentinel), true);
});

test('invalid concurrency does not create any run directory', async t => {
  const f = fixture(t);
  for (const concurrency of [0, -1, NaN, Infinity, 1.5]) {
    await assert.rejects(runEvalFixtures([], { fixtureParent: f.parent, concurrency, execute: async () => {} }), /positive integer/);
  }
  assert.deepEqual(readdirSync(f.parent), ['keep.txt']);
});
