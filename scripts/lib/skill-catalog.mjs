// A skill is the folder containing SKILL.md, regardless of its category depth.
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

export function discoverSkills(root) {
  const skills = [];
  const problems = [];
  function walk(dir) {
    if (lstatSync(dir).isSymbolicLink()) {
      problems.push(`${relative(root, dir) || '.'}: skill directories must not be links`);
      return;
    }
    if (existsSync(join(dir, 'SKILL.md'))) {
      const file = lstatSync(join(dir, 'SKILL.md'));
      if (!file.isFile() || file.isSymbolicLink()) problems.push(`${relative(root, dir)}: SKILL.md must be a regular file`);
      else skills.push({ name: basename(dir), dir, path: relative(root, dir).replaceAll('\\', '/') });
      return;
    }
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) problems.push(`${relative(root, join(dir, entry.name))}: catalogue entries must not be links`);
      else if (entry.isDirectory()) walk(join(dir, entry.name));
    }
  }
  if (!existsSync(root)) problems.push('skills: missing catalogue directory');
  else walk(root);
  return { skills, problems };
}

export function parseFrontmatter(text, problems = []) {
  const match = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return null;
  const fields = {};
  let key = null;
  for (const line of match[1].split('\n')) {
    const item = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (item) {
      key = item[1];
      if (Object.hasOwn(fields, key)) problems.push(`duplicate frontmatter key "${key}"`);
      fields[key] = item[2].replace(/^["']|["']$/g, '');
    } else if (key && /^\s+/.test(line)) fields[key] += ` ${line.trim()}`;
  }
  return fields;
}

export function readSkill(skill) {
  const text = readFileSync(join(skill.dir, 'SKILL.md'), 'utf8');
  const problems = [];
  return { text, frontmatter: parseFrontmatter(text, problems), problems };
}

// Only the boolean inside the root policy mapping controls Codex invocation.
export function implicitInvocationPolicy(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let inPolicy = false;
  const values = [];
  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^policy:\s*(?:#.*)?$/.test(line)) { inPolicy = true; continue; }
    if (/^\S/.test(line)) inPolicy = false;
    if (inPolicy) {
      const match = line.match(/^  allow_implicit_invocation:\s*(true|false)\s*(?:#.*)?$/);
      if (match) values.push(match[1] === 'true');
      else if (/^\s+allow_implicit_invocation:/.test(line)) return { error: 'policy.allow_implicit_invocation must be an unquoted boolean' };
    }
  }
  if (values.length > 1) return { error: 'duplicate policy.allow_implicit_invocation' };
  return { value: values[0] };
}
