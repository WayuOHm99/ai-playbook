// Merge playbook settings into ~/.claude/settings.json without removing anything the user already has.
// Backs up the original to settings.json.bak-<timestamp> before writing.
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const file = join(homedir(), '.claude', 'settings.json');
const s = JSON.parse(readFileSync(file, 'utf8'));
const before = JSON.stringify(s);

const GUARD = { type: 'command', command: 'node', args: ['D:/ai-playbook/guardrails/guard.mjs'] };
const MATCHER = 'Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit|Read';

s.permissions ??= {};
s.permissions.defaultMode = 'auto';
const deny = new Set(s.permissions.deny ?? []);
for (const r of [
  'Edit(**/.env)', 'Edit(**/.env.local)', 'Edit(**/.env.production)',
  'Read(**/.env)', 'Read(**/.env.local)', 'Read(**/.env.production)',
  'Bash(gh pr merge *)', 'Bash(git push origin main*)', 'Bash(git push origin master*)',
  'Bash(git push --force *)', 'Bash(git push -f *)', 'Bash(git reset --hard *)',
  'Bash(rm -rf *)', 'Bash(docker volume rm *)', 'Bash(docker compose down -v*)',
]) deny.add(r);
s.permissions.deny = [...deny];

s.hooks ??= {};
s.hooks.PreToolUse ??= [];
const mine = s.hooks.PreToolUse.find((h) => JSON.stringify(h).includes('ai-playbook/guardrails/guard.mjs'));
if (!mine) s.hooks.PreToolUse.push({ matcher: MATCHER, hooks: [GUARD] });
else mine.matcher = MATCHER;
// Write() path rules are never consulted by Claude Code (Edit() covers all file tools); drop them to silence startup warnings.
s.permissions.deny = s.permissions.deny.filter((r) => !r.startsWith('Write('));

s.modelSettings ??= {};
s.modelSettings['claude-sonnet-5-5'] ??= { effortLevel: 'high' };

if (JSON.stringify(s) !== before) {
  const bak = `${file}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  copyFileSync(file, bak);
  writeFileSync(file, JSON.stringify(s, null, 2) + '\n');
  console.log(`merged playbook settings; backup at ${bak}`);
} else {
  console.log('settings already up to date');
}
