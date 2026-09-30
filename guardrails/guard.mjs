#!/usr/bin/env node
// Shared PreToolUse guard for Claude Code and Codex. Reads hook JSON on stdin.
// Exit 2 + stderr message = block (works in both tools, in every permission mode).
import { readFileSync } from 'node:fs';

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }

const tool = String(input.tool_name || '');
const ti = input.tool_input || {};
const cmd = typeof ti.command === 'string' ? ti.command : (Array.isArray(ti.command) ? ti.command.join(' ') : '');
const blob = JSON.stringify(ti);

const shellRules = [
  [/\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r|-r\s+-f|-f\s+-r|--recursive\b[^\n]*--force|--force\b[^\n]*--recursive)/i, 'rm -rf'],
  [/\bRemove-Item\b[^\n]*-Recurse[^\n]*-Force|\bRemove-Item\b[^\n]*-Force[^\n]*-Recurse|\b(ri|del|rd|rmdir)\b[^\n]*\/s\b/i, 'recursive delete (PowerShell/cmd)'],
  [/\bgit\s+push\b[^\n]*(\s--force(?![-\w])|\s-f\b|\s\+[\w\/.-]+)/i, 'git push --force'],
  [/\bgit\s+reset\s+--hard\b/i, 'git reset --hard'],
  [/\bgit\s+clean\b[^\n]*-[a-z]*f/i, 'git clean -f'],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/i, 'git checkout/restore . (discard all changes)'],
  [/\bgit\s+branch\s+-D\b/i, 'git branch -D'],
  [/\bDROP\s+(TABLE|DATABASE|SCHEMA|VIEW|ROLE|USER)\b/i, 'SQL DROP'],
  [/\bTRUNCATE\b/i, 'SQL TRUNCATE'],
  [/\bDELETE\s+FROM\b(?![^;]*\bWHERE\b)/i, 'SQL DELETE without WHERE'],
  [/\bdocker\s+volume\s+(rm|prune)\b/i, 'docker volume rm/prune'],
  [/\bdocker\s+system\s+prune\b[^\n]*--volumes/i, 'docker system prune --volumes'],
  [/\bdocker[\s-]+compose\s+down\b[^\n]*(\s-v\b|--volumes)/i, 'docker compose down -v'],
  [/(>>?|\btee\b(\s+-a)?|Set-Content|Add-Content|Out-File|\bcp\b|\bmv\b|\bcopy\b|\bmove\b)[^\n|;&]*(^|[\s"'\/\\])\.env(\.(?!example\b|sample\b|template\b)[\w.-]+)?(\s|"|'|$)/i, 'writing a .env file'],
];

function envPath(p) {
  const base = String(p || '').split(/[\\/]/).pop().toLowerCase();
  return /^\.env(\..+)?$/.test(base) && !/\.(example|sample|template)$/.test(base);
}

let reason = null;
if (/^(Bash|PowerShell|shell|local_shell|exec_command|shell_command)$/i.test(tool) || cmd) {
  for (const [re, name] of shellRules) if (re.test(cmd)) { reason = name; break; }
}
if (!reason && /^(Write|Edit|MultiEdit|NotebookEdit|apply_patch)$/i.test(tool)) {
  if (envPath(ti.file_path) || envPath(ti.path) || envPath(ti.notebook_path)) reason = 'editing a .env file';
  else if (/\*\*\* (Add|Update|Delete) File: [^\n"]*\.env(?!\.(example|sample|template))(\.[\w.-]+)?(\\n|\s|")/i.test(blob)) reason = 'patching a .env file';
}
if (reason) {
  process.stderr.write(`BLOCKED by playbook guard: ${reason}. Ask the user to run this themselves or to approve an explicit exception.\n`);
  process.exit(2);
}
process.exit(0);
