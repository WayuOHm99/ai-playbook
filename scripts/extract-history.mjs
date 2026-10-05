// Explicitly selected history -> private draft -> human-reviewed analysis file.
// No default scan, no model/network calls, no raw text in stdout/errors.
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { captureHistory, releaseReviewed, reviewInfo, validDate } from './lib/history-review.mjs';

const VAULT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HELP = `Select 1-5 explicit sessions (never auto-discovers history):
  node scripts/extract-history.mjs --session codex=<JSONL path> [--session claude=<JSONL path>] [--since YYYY-MM-DD] [--out <private parent>]
Inspect metadata/digest without printing transcript contents:
  node scripts/extract-history.mjs --review-info <review directory>
Only after the human inspected/edited the draft and explicitly approved it:
  node scripts/extract-history.mjs --release-reviewed <review directory> --human-reviewed --expect <draft SHA256>
Output stays under this vault's _inbox/ or .scratch/. Regex filtering is not an anonymization guarantee.`;

export function main(args = process.argv.slice(2)) {
  if (args.length === 1 && args[0] === '--help') { console.log(HELP); return 0; }
  const options = {}, selections = [];
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key === '--human-reviewed') { if (options[key]) throw new Error('Duplicate option'); options[key] = true; continue; }
    if (!['--session', '--since', '--out', '--review-info', '--release-reviewed', '--expect'].includes(key) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Unknown or incomplete option; use --help');
    const value = args[++i];
    if (key === '--session') {
      const separator = value.indexOf('=');
      if (separator < 1) throw new Error('Session format is codex=<path> or claude=<path>');
      selections.push({ tool: value.slice(0, separator), path: value.slice(separator + 1) });
    } else { if (options[key] !== undefined) throw new Error('Duplicate option'); options[key] = value; }
  }
  let info;
  if (options['--review-info'] || options['--release-reviewed']) {
    if (selections.length || options['--since'] || options['--out'] || (options['--review-info'] && (options['--release-reviewed'] || options['--human-reviewed'] || options['--expect']))) throw new Error('Capture, review-info and release modes cannot be mixed');
    info = options['--review-info'] ? reviewInfo({ vault: VAULT, root: options['--review-info'] })
      : releaseReviewed({ vault: VAULT, root: options['--release-reviewed'], humanReviewed: options['--human-reviewed'] === true, expectedDigest: options['--expect'] });
  } else {
    if (options['--human-reviewed'] || options['--expect']) throw new Error('Review confirmation only applies to release mode');
    const since = options['--since'] ?? new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    if (!validDate(since)) throw new Error('Invalid since date');
    info = captureHistory({ vault: VAULT, selections, since, ...(options['--out'] ? { outParent: resolve(options['--out']) } : {}) });
  }
  console.log(JSON.stringify(info, null, 2));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { process.exitCode = main(); }
  catch (error) { console.error(error.code ? `History operation failed (${error.code}); no transcript content is printed` : error.message); process.exitCode = 2; }
}
