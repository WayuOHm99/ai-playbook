#!/usr/bin/env node
// Shared PreToolUse guard for Claude Code and Codex. Reads the hook JSON on stdin.
// Exit 2 + stderr message = block (works in every permission mode). Exit 0 = allow.
// Rules are tested by guardrails/guard.test.mjs — run `node guardrails/guard.test.mjs` after any change.
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SQL_CLIENT = /\b(mysql|mariadb|psql|sqlite3|mysqlsh|sqlcmd)\b|\bdocker\b[^\n]*\bexec\b[^\n]*\b(mysql|mariadb|psql)\b|\bprisma\s+db\s+execute\b|\bknex\b|\bexecute\s*\(/i;

const SHELL_RULES = [
  // recursive force delete: bash, PowerShell (incl. aliases rm/ri/del/erase/rd/rmdir), cmd
  [/\brm\s+(?:-\w*r\w*f\w*|-\w*f\w*r\w*)\b/i, 'recursive force delete (rm -rf)'],
  [/\brm\s+(?:[^\n;&|]*\s)?(?:-r|-R|--recursive)\b[^\n;&|]*\s(?:-f|--force)\b|\brm\s+(?:[^\n;&|]*\s)?(?:-f|--force)\b[^\n;&|]*\s(?:-r|-R|--recursive)\b/, 'recursive force delete (rm -r -f)'],
  [/\b(?:Remove-Item|rm|ri|del|erase|rd|rmdir)\b[^\n;|]*\s-r(?:e(?:c(?:u(?:r(?:s(?:e)?)?)?)?)?)?\b[^\n;|]*\s-fo(?:r(?:c(?:e)?)?)?\b/i, 'recursive force delete (PowerShell)'],
  [/\b(?:Remove-Item|rm|ri|del|erase|rd|rmdir)\b[^\n;|]*\s-fo(?:r(?:c(?:e)?)?)?\b[^\n;|]*\s-r(?:e(?:c(?:u(?:r(?:s(?:e)?)?)?)?)?)?\b/i, 'recursive force delete (PowerShell)'],
  [/\b(?:rd|rmdir|del)\b[^\n;|]*\s\/s\b/i, 'recursive delete (cmd /s)'],
  [/\bfind\b[^\n;|]*\s-delete\b/, 'find -delete'],
  // git history / work destruction
  [/\bgit\s+push\b[^\n;&|]*(?:\s--force(?![-\w])|\s-f\b|\s\+\S)/, 'git push --force'],
  [/\bgit\s+push\b[^\n;&|]*\s(?:--delete\b|-d\b|:\S)/, 'deleting a remote branch'],
  [/\bgit\s+push\b[^\n;&|]*\s(?:\S+:)?(?:refs\/heads\/)?(?:main|master)(?=\s|$)/, 'git push to main/master (merge through a PR instead)'],
  [/\bgh\s+pr\s+merge\b/, 'gh pr merge (merging is the user\'s decision)'],
  [/\bgit\s+reset\s+--hard\b/, 'git reset --hard'],
  [/\bgit\s+clean\b[^\n;&|]*\s-\w*f/, 'git clean -f'],
  [/\bgit\s+(?:checkout|restore)\b[^\n;&|]*\s(?:--\s+)?\.(?:\s|$)/, 'discarding all local changes'],
  [/\bgit\s+branch\s+(?:[^\n;&|]*\s)?-D\b/, 'git branch -D (force delete)'],
  [/\bgit\s+stash\s+(?:clear|drop)\b/, 'git stash clear/drop'],
  // databases: only when the command talks to a SQL client (avoids blocking commit messages)
  [/\bDROP\s+(?:TABLE|DATABASE|SCHEMA|VIEW|COLUMN|INDEX|TRIGGER|USER|ROLE)\b/i, 'SQL DROP', SQL_CLIENT],
  [/\bTRUNCATE\s+(?:TABLE\s+)?\w/i, 'SQL TRUNCATE', SQL_CLIENT],
  [/\bDELETE\s+FROM\b(?![^;]*\bWHERE\b)/i, 'SQL DELETE without WHERE', SQL_CLIENT],
  // docker data
  [/\bdocker\s+volume\s+(?:rm|prune)\b/, 'docker volume rm/prune'],
  [/\bdocker\s+system\s+prune\b[^\n;&|]*--volumes/, 'docker system prune --volumes'],
  [/\bdocker[\s-]+compose\b[^\n;&|]*\sdown\b[^\n;&|]*\s(?:-v\b|--volumes\b)/, 'docker compose down -v'],
  // secrets: writing or reading .env files from the shell
  [/(?:>>?|\btee\b|Set-Content|Add-Content|Out-File|\bcp\b|\bmv\b|\bcopy\b|\bmove\b|\bsed\s+-i\b)[^\n|;&]*(?:^|[\s"'\/\\])\.env(?:\.(?!example\b|sample\b|template\b)[\w.-]+)?(?=[\s"']|$)/i, 'writing a .env file'],
  [/\b(?:cat|type|more|less|head|tail|Get-Content|gc)\b[^\n|;&]*(?:^|[\s"'\/\\])\.env(?:\.(?!example\b|sample\b|template\b)[\w.-]+)?(?=[\s"']|$)/i, 'reading a .env file (secrets)'],
  [/\bgit\s+add\b[^\n;&|]*\s-f\b[^\n;&|]*\.env\b/, 'force-adding a .env file to git'],
];

const isEnvPath = (p) => {
  const base = String(p || '').split(/[\\/]/).pop().toLowerCase();
  return /^\.env(\..+)?$/.test(base) && !/\.(example|sample|template)$/.test(base);
};

export function check(input) {
  const tool = String(input?.tool_name || '');
  const ti = input?.tool_input || {};
  const cmd = typeof ti.command === 'string' ? ti.command : Array.isArray(ti.command) ? ti.command.join(' ') : '';

  // Codex may pass an apply_patch body as `command`; file contents are not shell commands.
  if (cmd && !/^\s*\*\*\* Begin Patch/.test(cmd)) {
    for (const [re, name, context] of SHELL_RULES) {
      if (re.test(cmd) && (!context || context.test(cmd))) return name;
    }
  }
  if (/^(Write|Edit|MultiEdit|NotebookEdit|Read)$/i.test(tool)) {
    if (isEnvPath(ti.file_path) || isEnvPath(ti.path) || isEnvPath(ti.notebook_path)) {
      return tool === 'Read' ? 'reading a .env file (secrets)' : 'editing a .env file';
    }
  }
  if (/^apply_patch$/i.test(tool) || /\*\*\* (Add|Update|Delete) File:/.test(JSON.stringify(ti))) {
    const text = typeof ti.input === 'string' ? ti.input : typeof ti.patch === 'string' ? ti.patch : cmd || JSON.stringify(ti);
    for (const m of text.matchAll(/\*\*\* (?:Add|Update|Delete) File: ([^\n\r"\\]+)/g)) {
      if (isEnvPath(m[1].trim())) return 'patching a .env file';
    }
  }
  return null;
}

// Compare real paths so the hook still runs when its path goes through a symlink or junction.
const invokedPath = (() => { try { return realpathSync(process.argv[1] ?? ''); } catch { return ''; } })();
if (invokedPath === realpathSync(fileURLToPath(import.meta.url))) {
  let input;
  try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
  const reason = check(input);
  if (reason) {
    process.stderr.write(`BLOCKED by playbook guard: ${reason}. Ask the user to run this themselves or to approve an explicit exception.\n`);
    process.exit(2);
  }
  process.exit(0);
}
