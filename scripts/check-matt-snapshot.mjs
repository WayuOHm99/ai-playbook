// Verify the reference snapshot without installing or executing upstream files.
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const vault = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(vault, 'upstream/matt-pocock'), source = join(root, 'source');
const hash = (algorithm, data) => createHash(algorithm).update(data).digest('hex');
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
function walk(path, prefix = '') {
  requireValue(lstatSync(path).isDirectory() && !lstatSync(path).isSymbolicLink(), 'Snapshot directories must not be links');
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    requireValue(!entry.isSymbolicLink(), 'Snapshot entries must not be links');
    const name = prefix + entry.name;
    if (entry.isDirectory()) return walk(join(path, entry.name), name + '/');
    requireValue(entry.isFile(), 'Expected regular snapshot files');
    return [name];
  });
}

try {
  requireValue(!process.argv.slice(2).length, 'This checker takes no arguments');
  const manifestPath = join(root, 'manifest.json');
  requireValue(lstatSync(manifestPath).isFile() && !lstatSync(manifestPath).isSymbolicLink(), 'Expected a regular manifest');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  requireValue(manifest.schemaVersion === 1 && manifest.snapshotType === 'repo-only-reference'
    && manifest.sourceRepository === 'https://github.com/mattpocock/skills' && /^[a-f0-9]{40}$/.test(manifest.sourceCommit), 'Invalid source metadata');
  requireValue(Array.isArray(manifest.files) && manifest.files.length === manifest.fileCount && Array.isArray(manifest.skills) && manifest.skills.length === manifest.skillCount, 'Invalid inventory counts');
  const actualFiles = walk(source).sort();
  const names = new Set();
  for (const file of manifest.files) {
    requireValue(typeof file.path === 'string' && !file.path.split('/').some(part => !part || part === '.' || part === '..') && !file.path.includes('\\')
      && (/^skills\/(engineering|productivity|in-progress|misc)\/[a-z0-9/_.-]+$/i.test(file.path) || ['LICENSE', 'CHANGELOG.md'].includes(file.path)), 'Invalid snapshot file path');
    requireValue(!names.has(file.path), 'Duplicate inventory path'); names.add(file.path);
    const data = readFileSync(join(source, file.path));
    const blob = createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');
    requireValue(data.length === file.bytes && hash('sha256', data) === file.sha256 && blob === file.gitBlob, `Snapshot drift: ${file.path}`);
  }
  requireValue(JSON.stringify(actualFiles) === JSON.stringify([...names].sort()), 'Missing or unexpected snapshot files');
  const skillPaths = [...names].filter(path => path.endsWith('/SKILL.md')).sort();
  requireValue(manifest.skillCount === 38 && manifest.primarySkillCount === 27 && manifest.referenceSkillCount === 11
    && JSON.stringify(manifest.skills.map(skill => skill.path).sort()) === JSON.stringify(skillPaths), 'Invalid source-skill inventory');
  const skillNames = new Set();
  for (const skill of manifest.skills) {
    requireValue(['engineering', 'productivity', 'in-progress', 'misc'].includes(skill.category)
      && skill.path.split('/')[1] === skill.category, 'Invalid skill category');
    const content = readFileSync(join(source, skill.path), 'utf8');
    requireValue(content.startsWith('---\n') && content.match(/^name:\s*(.+)$/m)?.[1] === skill.name && !skillNames.has(skill.name), 'Invalid skill name/frontmatter');
    skillNames.add(skill.name);
  }
  requireValue(manifest.skills.filter(s => ['engineering','productivity'].includes(s.category)).length === 27, 'Invalid primary-skill count');
  console.log(JSON.stringify({ status: 'pass', sourceCommit: manifest.sourceCommit, packageVersion: manifest.packageVersion, skills: manifest.skillCount, files: manifest.fileCount, installed: false }));
} catch (error) {
  console.error(error.code ? `Snapshot check failed (${error.code})` : error.message);
  process.exitCode = 1;
}
