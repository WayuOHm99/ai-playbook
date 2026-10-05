// Short, isolated fixture directories. Never remove the shared parent or a prior run.
import { randomUUID } from 'node:crypto';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

export const DEFAULT_FIXTURE_PARENT = resolve('D:/ev');
const OWNER_FILE = '.eval-run-owner';

export function createEvalWorkspace(parent = DEFAULT_FIXTURE_PARENT) {
  mkdirSync(resolve(parent), { recursive: true });
  const parentRoot = realpathSync(resolve(parent));
  const root = mkdtempSync(join(parentRoot, 'run-'));
  const owner = randomUUID();
  writeFileSync(join(root, OWNER_FILE), owner, { flag: 'wx' });
  let closed = false;

  function requireOwnedRoot() {
    const target = resolve(root);
    const within = relative(parentRoot, target);
    if (!within || within === '..' || within.startsWith(`..${sep}`) || isAbsolute(within) || dirname(target) !== parentRoot) {
      throw new Error(`Refusing eval cleanup outside its parent: ${target}`);
    }
    const info = lstatSync(target);
    if (!info.isDirectory() || info.isSymbolicLink() || realpathSync(parentRoot) !== parentRoot || realpathSync(target) !== target) {
      throw new Error(`Refusing replaced or linked eval workspace: ${target}`);
    }
    const marker = join(target, OWNER_FILE);
    const markerInfo = lstatSync(marker, { throwIfNoEntry: false });
    if (!markerInfo?.isFile() || markerInfo.isSymbolicLink() || readFileSync(marker, 'utf8') !== owner) {
      throw new Error(`Refusing unowned eval workspace: ${target}`);
    }
    return target;
  }

  return Object.freeze({
    root,
    createFixture(id) {
      if (closed) throw new Error('Eval workspace is already closed');
      if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(id)) throw new Error(`Invalid eval fixture id: ${id}`);
      const target = join(requireOwnedRoot(), id);
      // No replacement/deletion: duplicate jobs are an error within this run.
      mkdirSync(target);
      return target;
    },
    cleanup() {
      if (closed) return;
      if (!lstatSync(root, { throwIfNoEntry: false })) { closed = true; return; }
      // Validate the absolute, canonical, owned target immediately before deletion.
      const target = requireOwnedRoot();
      rmSync(target, { recursive: true, force: true });
      closed = true;
    },
  });
}

export async function runEvalFixtures(jobs, { fixtureParent = DEFAULT_FIXTURE_PARENT, concurrency = 3, execute, onResult = () => {} }) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Eval concurrency must be a positive integer');
  if (typeof execute !== 'function') throw new Error('Eval execute callback is required');
  const workspace = createEvalWorkspace(fixtureParent);
  const results = [];
  let next = 0;
  let aborted = false;
  let failure;
  try {
    const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
      while (!aborted && next < jobs.length) {
        const job = jobs[next++];
        try {
          const dir = workspace.createFixture(job.id);
          const result = await execute(job, dir);
          results.push(result);
          onResult(result);
        } catch (error) {
          aborted = true;
          throw error;
        }
      }
    });
    // A rejected worker must not trigger cleanup while another CLI still uses its fixture.
    const settled = await Promise.allSettled(workers);
    const rejected = settled.find(result => result.status === 'rejected');
    if (rejected) throw rejected.reason;
    return results;
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    try {
      workspace.cleanup();
    } catch (cleanupError) {
      if (failure) throw new AggregateError([failure, cleanupError], 'Eval failed and workspace cleanup was refused');
      throw cleanupError;
    }
  }
}
