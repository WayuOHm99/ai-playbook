// Lint vault skills against the Agent Skills spec (agentskills.io/specification) and check that the
// installed copies match the vault. Warn-only: always exits 0 unless --strict is passed.
// Usage: node scripts/lint-skills.mjs [--strict]
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const VAULT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = join(VAULT, 'skills');
const INSTALLS = [join(homedir(), '.claude', 'skills'), join(homedir(), '.agents', 'skills')];
const problems = [];
const warn = (skill, msg) => problems.push(`${skill}: ${msg}`);

const hashTree = (dir) => {
  const h = createHash('sha256');
  const walk = (d, rel = '') => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p, `${rel}${e.name}/`);
      else h.update(`${rel}${e.name}\0`).update(readFileSync(p).toString('utf8').replace(/\r\n/g, '\n'));
    }
  };
  walk(dir);
  return h.digest('hex');
};

const parseFrontmatter = (text) => {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = {};
  let key = null;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) { key = kv[1]; fm[key] = kv[2].replace(/^["']|["']$/g, ''); }
    else if (key && /^\s+/.test(line)) fm[key] += ` ${line.trim()}`;
  }
  return fm;
};

// Keys from the spec plus the Claude-only keys we use on purpose.
const ALLOWED = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools', 'disable-model-invocation']);

for (const name of readdirSync(SKILLS).filter((n) => statSync(join(SKILLS, n)).isDirectory())) {
  const dir = join(SKILLS, name);
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) { warn(name, 'missing SKILL.md'); continue; }
  const text = readFileSync(file, 'utf8');
  const fm = parseFrontmatter(text);
  if (!fm) { warn(name, 'no YAML frontmatter'); continue; }

  if (fm.name !== name) warn(name, `name "${fm.name}" must match folder "${name}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name || '') || fm.name.length > 64) warn(name, 'name must be lowercase a-z0-9 and single hyphens, max 64 chars');
  if (!fm.description) warn(name, 'description is required');
  else {
    if (fm.description.length > 1024) warn(name, `description is ${fm.description.length} chars (max 1024)`);
    if (/[<>]/.test(fm.description)) warn(name, 'description must not contain < or > (Codex validator rejects them)');
  }
  for (const k of Object.keys(fm)) if (!ALLOWED.has(k)) warn(name, `unknown frontmatter key "${k}" (put custom data under metadata)`);
  const lines = text.split('\n').length;
  if (lines > 500) warn(name, `SKILL.md is ${lines} lines (spec recommends under 500)`);

  // Manual-only in Claude must also be manual-only in Codex.
  if (fm['disable-model-invocation'] === 'true') {
    const yaml = join(dir, 'agents', 'openai.yaml');
    if (!existsSync(yaml) || !/allow_implicit_invocation:\s*false/.test(readFileSync(yaml, 'utf8'))) {
      warn(name, 'disable-model-invocation is set but agents/openai.yaml lacks policy.allow_implicit_invocation: false');
    }
  }
  // Relative links inside the skill must resolve.
  for (const m of text.matchAll(/\]\((?!https?:|#)([^)\s]+)\)/g)) {
    if (!existsSync(join(dir, m[1]))) warn(name, `broken link ${m[1]}`);
  }
  // Drift: installed copies must match the vault.
  const vaultHash = hashTree(dir);
  for (const root of INSTALLS) {
    const inst = join(root, name);
    if (!existsSync(inst)) warn(name, `not installed in ${root} (run scripts/sync.ps1)`);
    else if (hashTree(inst) !== vaultHash) warn(name, `installed copy in ${root} differs from the vault (run scripts/sync.ps1)`);
  }
}

// Every /skill named in the start-here map must exist somewhere Claude or Codex can see it.
const startHere = readFileSync(join(VAULT, '00-start-here.md'), 'utf8');
const BUILTIN = new Set(['clear', 'compact', 'hooks', 'skills', 'context', 'security-review', 'code-review', 'doctor', 'init']);
for (const m of startHere.matchAll(/`\/([a-z][a-z0-9-]+)/g)) {
  const s = m[1];
  if (!BUILTIN.has(s) && !INSTALLS.some((r) => existsSync(join(r, s))) && !existsSync(join(SKILLS, s))) warn('00-start-here', `/${s} is not an installed skill`);
}

if (problems.length) {
  console.log(`lint-skills: ${problems.length} warning(s)`);
  for (const p of problems) console.log(`  - ${p}`);
} else console.log('lint-skills: all skills OK, installed copies match the vault');
process.exit(problems.length && process.argv.includes('--strict') ? 1 : 0);
