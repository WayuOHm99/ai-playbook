// Read-only Git snapshot for /ship. This checks identity/cleanliness, not the review verdict or tests.
// Capture: node scripts/review-candidate.mjs --base origin/main
// Before push: node scripts/review-candidate.mjs --base <saved-base-SHA> --expect <reviewed-candidate-SHA>
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function captureReviewCandidate({ cwd = process.cwd(), base, expectedCandidate } = {}) {
  const git = (...args) => execFileSync('git', args, {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (!base) throw new Error('A base commit or ref is required.');
  const status = git('status', '--porcelain=v1', '--untracked-files=all').trim();
  if (status) throw new Error(`Uncommitted changes: ${status.split('\n').join('; ')}`);
  const resolveCommit = (ref, label) => {
    try { return git('rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`).trim(); }
    catch { throw new Error(`Cannot resolve ${label} commit: ${ref}`); }
  };
  const baseSha = resolveCommit(base, 'base');
  const candidate = resolveCommit('HEAD', 'candidate');
  if (expectedCandidate && (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(expectedCandidate) || candidate !== expectedCandidate.toLowerCase())) {
    throw new Error(`Candidate changed: reviewed ${expectedCandidate}, current ${candidate}. Verify and review the new candidate before pushing.`);
  }
  let mergeBase;
  try { mergeBase = git('merge-base', baseSha, candidate).trim(); }
  catch { throw new Error('Base and candidate have no common history.'); }
  const changedFiles = git('diff', '--name-only', '-z', mergeBase, candidate).split('\0').filter(Boolean);
  if (!changedFiles.length) throw new Error('No changes to review between base and candidate.');
  return {
    base: baseSha, mergeBase, candidate, changedFiles,
    diffCommand: `git diff ${mergeBase} ${candidate} --`,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && args[0] === '--help') {
      console.log('Usage: node review-candidate.mjs --base <ref-or-SHA> [--expect <reviewed-candidate-SHA>]');
    } else {
      const values = {};
      for (let i = 0; i < args.length; i += 2) {
        if (!['--base', '--expect'].includes(args[i]) || !args[i + 1] || values[args[i]]) throw new Error('Expected --base <ref-or-SHA> and optional --expect <reviewed-candidate-SHA>.');
        values[args[i]] = args[i + 1];
      }
      console.log(JSON.stringify(captureReviewCandidate({ base: values['--base'], expectedCandidate: values['--expect'] }), null, 2));
    }
  } catch (error) {
    console.error(`review-candidate: ${error.message}`);
    process.exitCode = 1;
  }
}
