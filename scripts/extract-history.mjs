// Extract recent Claude Code + Codex sessions into small, secret-masked text files for /retro.
// Usage: node scripts/extract-history.mjs [--since YYYY-MM-DD] [--out DIR]
// Default: last 7 days, output under _inbox/history-extract/<today>/ (git-ignored).
// Only user prompts and the first 500 chars of assistant replies are kept; tool output is skipped.
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dedupeSessions } from './lib/dedupe-sessions.mjs';

const VAULT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const today = new Date().toISOString().slice(0, 10);
const since = arg('--since', new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10));
const OUT = resolve(arg('--out', join(VAULT, '_inbox', 'history-extract', today)));
const sinceMs = Date.parse(since);

// Masking happens before anything is written, so secrets never reach the analysing agent.
const MASKS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, 'PRIVATE_KEY'],
  [/\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}/g, 'API_KEY'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/g, 'GITHUB_TOKEN'],
  [/\bAIza[0-9A-Za-z_-]{30,}/g, 'GOOGLE_KEY'],
  [/\bAKIA[0-9A-Z]{16}\b/g, 'AWS_KEY'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, 'JWT'],
  [/\b(mysql|mariadb|postgres(?:ql)?|mongodb(?:\+srv)?|redis):\/\/[^:\s/]+:[^@\s]+@/gi, '$1://[REDACTED:DB_CREDS]@'],
  [/((?:password|passwd|pwd|secret|token|api[_-]?key|pin|รหัสผ่าน|รหัส|พาสเวิร์ด)\s*[:=]\s*)\S+/gi, '$1[REDACTED:SECRET]'],
];
const mask = (t) => MASKS.reduce((s, [re, label]) => s.replace(re, label.includes('$1') ? label : `[REDACTED:${label}]`), t);

const NOISE = ['<environment_context>', '# AGENTS.md instructions', '<user_instructions>', '<permissions', '<local-command-stdout>',
  '<local-command-stderr>', '<system-reminder>', '<turn_aborted>', 'Caveat: The messages below', '<collaboration_mode>', '<skill>', '<INSTRUCTIONS>'];
const isNoise = (t) => !t.trim() || NOISE.some((p) => t.trimStart().startsWith(p));
const clean = (t) => t.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.jsonl') && statSync(p).mtimeMs >= sinceMs) out.push(p);
  }
  return out;
};
const project = (cwd) => {
  if (!cwd) return 'unknown';
  const p = cwd.replace(/\//g, '\\');
  if (/scratch-workspaces/i.test(p)) return 'claude-desktop-scratch';
  const m = p.match(/^[A-Za-z]:\\[^\\]+/);
  return (m ? m[0] : p).replace(/[:\\]+/g, '_').replace(/^([a-z])/, (c) => c.toUpperCase());
};

const sessions = {};
const add = (proj, s) => (sessions[proj] ||= []).push(s);
const lines = (f) => { try { return readFileSync(f, 'utf8').split('\n').filter(Boolean); } catch { return []; } };

for (const f of walk(join(homedir(), '.claude', 'projects'))) {
  if (f.includes(`${sep}subagents${sep}`)) continue;
  let cwd = null, date = null; const out = [];
  for (const l of lines(f)) {
    let o; try { o = JSON.parse(l); } catch { continue; }
    cwd ||= o.cwd; date ||= o.timestamp?.slice(0, 10);
    if (o.isSidechain) continue;
    const c = o.message?.content;
    if (o.type === 'user' && !o.isMeta) {
      let t = typeof c === 'string' ? c : Array.isArray(c) ? c.filter((b) => b.type === 'text').map((b) => b.text).join('\n') : '';
      const cmd = t.match(/<command-name>([^<]*)<\/command-name>[\s\S]*?(?:<command-args>([\s\S]*?)<\/command-args>)?/);
      if (cmd) t = `[${cmd[1]}${cmd[2] ? ` ${cmd[2].trim()}` : ''}]`;
      t = clean(t);
      if (!isNoise(t)) out.push(`[U] ${mask(t).slice(0, 2000)}`);
    } else if (o.type === 'assistant' && Array.isArray(c)) {
      const t = c.filter((b) => b.type === 'text').map((b) => b.text).join(' ').trim();
      if (t) out.push(`[A] ${mask(t).slice(0, 500).replace(/\s+/g, ' ')}`);
    }
  }
  if (date >= since && out.some((x) => x.startsWith('[U]'))) add(project(cwd), { tool: 'claude', id: basename(f, '.jsonl').slice(0, 8), date, out });
}

for (const f of walk(join(homedir(), '.codex', 'sessions'))) {
  let cwd = null, date = null; const out = [];
  for (const l of lines(f)) {
    let o; try { o = JSON.parse(l); } catch { continue; }
    if (o.type === 'session_meta') { cwd = o.payload?.cwd; date = (o.payload?.timestamp || o.timestamp || '').slice(0, 10); continue; }
    if (o.type !== 'response_item' || o.payload?.type !== 'message') continue;
    const t = clean((o.payload.content || []).filter((b) => /^(input|output)_text$/.test(b.type)).map((b) => b.text).join('\n'));
    if (o.payload.role === 'user' && !isNoise(t)) out.push(`[U] ${mask(t).slice(0, 2000)}`);
    else if (o.payload.role === 'assistant' && t) out.push(`[A] ${mask(t).slice(0, 500).replace(/\s+/g, ' ')}`);
  }
  if (date >= since && out.some((x) => x.startsWith('[U]'))) add(project(cwd), { tool: 'codex', id: basename(f, '.jsonl').slice(-12), date, out });
}

mkdirSync(OUT, { recursive: true });
const summary = [];
for (const [proj, all] of Object.entries(sessions)) {
  all.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const list = dedupeSessions(all);
  if (!list.length) continue;
  const body = list.map((s) => `\n## ${s.tool} ${s.date} ${s.id}\n${s.out.join('\n')}`).join('\n');
  writeFileSync(join(OUT, `${proj}.txt`), `# ${proj} (since ${since}, secrets masked)\n${body}\n`);
  summary.push(`${proj}: ${list.length} sessions, ${list.reduce((n, s) => n + s.out.filter((x) => x.startsWith('[U]')).length, 0)} prompts`);
}
console.log(`extract-history: since ${since} -> ${OUT}`);
console.log(summary.length ? summary.map((s) => `  ${s}`).join('\n') : '  no sessions in range');
