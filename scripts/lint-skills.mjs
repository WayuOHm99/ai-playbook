// Validate the repository catalogue. Installation drift is a separate optional check.
// Usage: node scripts/lint-skills.mjs [--strict] [--repo-only | --strict-installations]
import { readFileSync, readdirSync, existsSync, readlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve, relative } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { discoverSkills, readSkill, implicitInvocationPolicy } from './lib/skill-catalog.mjs';

const VAULT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const options = new Set(process.argv.slice(2));
const allowedOptions = new Set(['--strict', '--repo-only', '--strict-installations']);
if ([...options].some(option => !allowedOptions.has(option)) || options.size !== process.argv.slice(2).length
    || (options.has('--repo-only') && options.has('--strict-installations'))) {
  console.error('Usage: node scripts/lint-skills.mjs [--strict] [--repo-only | --strict-installations]');
  process.exit(1);
}
const { skills, problems } = discoverSkills(join(VAULT, 'skills'));
const drift = [];
const warn = (skill, message) => problems.push(`${skill}: ${message}`);
const names = new Set();
const inventory = new Map();
const ALLOWED = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools', 'disable-model-invocation', 'argument-hint']);

for (const skill of skills) {
  const { name, dir, path } = skill;
  const { text, frontmatter: fm, problems: frontmatterProblems } = readSkill(skill);
  for (const problem of frontmatterProblems) warn(path, problem);
  if (!fm) { warn(path, 'no YAML frontmatter'); continue; }
  if (fm.name !== name) warn(path, `name "${fm.name}" must match folder "${name}"`);
  if (names.has(fm.name)) warn(path, `duplicate skill name "${fm.name}"`);
  names.add(fm.name);
  inventory.set(`skills/${path}/SKILL.md`, { name: fm.name, invocation: fm['disable-model-invocation'] === 'true' ? 'user' : 'model' });
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name || '') || fm.name.length > 64) warn(path, 'name must be lowercase a-z0-9 and single hyphens, max 64 chars');
  if (!fm.description) warn(path, 'description is required');
  else {
    if (fm.description.length > 1024) warn(path, `description is ${fm.description.length} chars (max 1024)`);
    if (/[<>]/.test(fm.description)) warn(path, 'description must not contain < or > (Codex validator rejects them)');
  }
  for (const key of Object.keys(fm)) if (!ALLOWED.has(key)) warn(path, `unknown frontmatter key "${key}" (put custom data under metadata)`);
  if (Object.hasOwn(fm, 'disable-model-invocation') && !['true', 'false'].includes(fm['disable-model-invocation'])) {
    warn(path, 'disable-model-invocation must be true or false');
  }
  const lines = text.split('\n').length;
  if (lines > 500) warn(path, `SKILL.md is ${lines} lines (spec recommends under 500)`);

  // Preserve upstream invocation roles: manual in Claude also means manual in Codex.
  const yaml = join(dir, 'agents', 'openai.yaml');
  const policy = existsSync(yaml) ? implicitInvocationPolicy(readFileSync(yaml, 'utf8')) : {};
  if (policy.error) warn(path, policy.error);
  if (fm['disable-model-invocation'] === 'true') {
    if (policy.value !== false) {
      warn(path, 'disable-model-invocation is set but agents/openai.yaml lacks policy.allow_implicit_invocation: false');
    }
  } else if (policy.value === false) warn(path, 'Codex manual policy disagrees with the model-invocable SKILL.md role');
  checkMarkdownLinks(dir);
}

function checkMarkdownLinks(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    const label = relative(join(VAULT, 'skills'), file).replaceAll('\\', '/');
    if (entry.isSymbolicLink()) { warn(label, 'skill contents must not be links'); continue; }
    if (entry.isDirectory()) { checkMarkdownLinks(file); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    // Documentation examples in fenced/inline code are not active Markdown links.
    let fence = null;
    const prose = readFileSync(file, 'utf8').split(/\r?\n/).filter(line => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/);
      if (marker) {
        if (!fence) fence = marker[1];
        else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
        return false;
      }
      return !fence;
    }).join('\n').replace(/(`+)[\s\S]*?\1/g, '');
    const targets = [...prose.matchAll(/\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\)/g)].map(match => match[1] || match[2]);
    for (const match of prose.matchAll(/^\s*\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm)) targets.push(match[1] || match[2]);
    for (const target of targets) {
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) continue;
      try {
        const path = decodeURIComponent(target.split(/[?#]/)[0]);
        if (path && !existsSync(resolve(dirname(file), path))) warn(label, `broken link ${target}`);
      } catch { warn(label, `invalid link encoding ${target}`); }
    }
  }
}

const cataloguePath = join(VAULT, 'skills', 'catalog.json');
if (existsSync(cataloguePath)) {
  try {
    const catalogue = JSON.parse(readFileSync(cataloguePath, 'utf8'));
    if (catalogue.schemaVersion !== 1 || !/^[a-f0-9]{40}$/.test(catalogue.sourceCommit) || !Array.isArray(catalogue.skills)) {
      warn('catalog.json', 'invalid catalogue metadata');
    } else {
      const declaredPaths = new Set();
      const declaredNames = new Set();
      for (const entry of catalogue.skills) {
        if (!entry || typeof entry.path !== 'string' || !inventory.has(entry.path)) {
          warn('catalog.json', `unknown skill path "${entry?.path}"`); continue;
        }
        if (declaredPaths.has(entry.path) || declaredNames.has(entry.name)) warn('catalog.json', `duplicate entry "${entry.name}"`);
        declaredPaths.add(entry.path); declaredNames.add(entry.name);
        const actual = inventory.get(entry.path);
        if (entry.name !== actual.name) warn('catalog.json', `name mismatch for ${entry.path}`);
        if (entry.invocation !== actual.invocation) warn('catalog.json', `invocation mismatch for ${actual.name}`);
      }
      for (const [path, skill] of inventory) if (!declaredPaths.has(path)) warn('catalog.json', `missing skill ${skill.name} (${path})`);
    }
  } catch { warn('catalog.json', 'invalid JSON'); }
}

// A vault-owned slash command resolves by skill name, independent of category folders.
const BUILTIN = new Set(['clear', 'compact', 'hooks', 'skills', 'context', 'security-review', 'code-review', 'doctor', 'init']);
const startHere = join(VAULT, '00-start-here.md');
if (existsSync(startHere)) for (const match of readFileSync(startHere, 'utf8').matchAll(/`\/([a-z][a-z0-9-]+)/g)) {
  if (!BUILTIN.has(match[1]) && !names.has(match[1])) warn('00-start-here', `/${match[1]} is not a catalogue skill`);
}

function hashTree(dir) {
  const hash = createHash('sha256');
  function walk(path, prefix = '') {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = join(path, entry.name);
      if (entry.isSymbolicLink()) hash.update(`${prefix}${entry.name}\0link\0${readlinkSync(child)}`);
      else if (entry.isDirectory()) walk(child, `${prefix}${entry.name}/`);
      else hash.update(`${prefix}${entry.name}\0`).update(readFileSync(child).toString('utf8').replace(/\r\n/g, '\n'));
    }
  }
  walk(dir);
  return hash.digest('hex');
}
if (!options.has('--repo-only')) {
  const installs = [join(homedir(), '.claude', 'skills'), join(homedir(), '.agents', 'skills')];
  for (const skill of skills) {
    for (const root of installs) {
      const installed = join(root, skill.name);
      if (!existsSync(installed)) drift.push(`${skill.name}: not installed in ${root}`);
      else {
        try {
          if (hashTree(installed) !== hashTree(skill.dir)) drift.push(`${skill.name}: installed copy in ${root} differs from the vault`);
        } catch { drift.push(`${skill.name}: cannot compare installed copy in ${root}`); }
      }
    }
  }
}

console.log(`lint-skills: catalogue ${skills.length} skills, ${problems.length ? `${problems.length} issue(s)` : 'OK'}`);
for (const problem of problems) console.log(`  - ${problem}`);
if (options.has('--repo-only')) console.log('lint-skills: installation drift not checked (--repo-only)');
else {
  console.log(`lint-skills: installation drift ${drift.length ? `${drift.length} difference(s)` : 'OK'} (separate from catalogue; no installation performed)`);
  for (const difference of drift) console.log(`  - ${difference}`);
}
process.exitCode = (problems.length && options.has('--strict')) || (drift.length && options.has('--strict-installations')) ? 1 : 0;
