// Add only the playbook guard hook to ~/.claude/settings.json. It does not touch permission mode, deny rules or model settings.
// Backs up the original to settings.json.bak-<timestamp> before writing.
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const file = join(homedir(), '.claude', 'settings.json');
const s = JSON.parse(readFileSync(file, 'utf8'));
const before = JSON.stringify(s);

const GUARD = { type: 'command', command: 'node', args: ['D:/ai-playbook/guardrails/guard.mjs'] };
const MATCHER = 'Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit|Read';

s.hooks ??= {};
s.hooks.PreToolUse ??= [];
const mine = s.hooks.PreToolUse.find((h) => JSON.stringify(h).includes('ai-playbook/guardrails/guard.mjs'));
if (!mine) s.hooks.PreToolUse.push({ matcher: MATCHER, hooks: [GUARD] });
else mine.matcher = MATCHER;


if (JSON.stringify(s) !== before) {
  const bak = `${file}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  copyFileSync(file, bak);
  writeFileSync(file, JSON.stringify(s, null, 2) + '\n');
  console.log(`merged playbook settings; backup at ${bak}`);
} else {
  console.log('settings already up to date');
}
