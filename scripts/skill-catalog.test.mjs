// CLI regressions use synthetic vaults only; no installed skills or agents are invoked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scripts = dirname(fileURLToPath(import.meta.url));
const fixtures = resolve(scripts, '../.scratch/skill-catalog-tests');
mkdirSync(fixtures, { recursive: true });
function fixture() {
  const vault = mkdtempSync(join(fixtures, 'run-'));
  const home = join(vault, 'synthetic home');
  mkdirSync(home);
  const write = (path, content) => {
    mkdirSync(dirname(join(vault, path)), { recursive: true });
    writeFileSync(join(vault, path), content);
  };
  write('00-start-here.md', 'Use `/demo` and `/flat`.\n');
  write('scripts/lint-skills.mjs', '');
  copyFileSync(join(scripts, 'lint-skills.mjs'), join(vault, 'scripts/lint-skills.mjs'));
  if (existsSync(join(scripts, 'lib/skill-catalog.mjs'))) {
    write('scripts/lib/skill-catalog.mjs', '');
    copyFileSync(join(scripts, 'lib/skill-catalog.mjs'), join(vault, 'scripts/lib/skill-catalog.mjs'));
  }
  const skill = (path, name, extra = '', body = '') => write(`${path}/SKILL.md`,
    `---\nname: ${name}\ndescription: A synthetic fixture skill.\n${extra}---\n\n${body}`);
  const lint = (...args) => spawnSync(process.execPath,
    [join(vault, 'scripts/lint-skills.mjs'), '--strict', '--repo-only', ...args], { encoding: 'utf8' });
  const lintInstallations = (...args) => spawnSync(process.execPath,
    [join(vault, 'scripts/lint-skills.mjs'), '--strict', ...args],
    { encoding: 'utf8', env: { ...process.env, USERPROFILE: home, HOME: home } });
  return { vault, home, write, skill, lint, lintInstallations };
}

test('lint discovers nested and flat skill roots without cataloguing upstream or archive copies', () => {
  const f = fixture();
  f.skill('skills/engineering/demo', 'demo', 'disable-model-invocation: true\n');
  f.write('skills/engineering/demo/agents/openai.yaml', 'policy:\n  allow_implicit_invocation: false\n');
  f.skill('skills/flat', 'flat');
  f.skill('upstream/source/skills/engineering/demo', 'bad-name');
  f.skill('archive/skills/flat', 'bad-name');
  const result = f.lint();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /2 skills.*(?:OK|pass)/i);
  assert.doesNotMatch(result.stdout, /missing SKILL\.md|not installed|bad-name|installed copies match/);
});

test('a manual skill requires a real policy block rather than a comment or unrelated field', () => {
  const f = fixture();
  f.write('00-start-here.md', 'Use `/demo`.\n');
  f.skill('skills/engineering/demo', 'demo', 'disable-model-invocation: true\n');
  for (const yaml of [
    '# policy:\n#   allow_implicit_invocation: false\n',
    'interface:\n  allow_implicit_invocation: false\npolicy:\n  allow_implicit_invocation: true\n',
  ]) {
    f.write('skills/engineering/demo/agents/openai.yaml', yaml);
    const result = f.lint();
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /policy\.allow_implicit_invocation: false/);
  }
});

test('frontmatter rejects duplicate keys and invalid invocation booleans', () => {
  const f = fixture();
  f.write('00-start-here.md', 'Use `/demo`.\n');
  f.skill('skills/engineering/demo', 'demo', 'name: demo\ndisable-model-invocation: sometimes\n');
  const result = f.lint();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /duplicate frontmatter key "name"/);
  assert.match(result.stdout, /disable-model-invocation must be true or false/);
});

test('the active manifest must enumerate discovered paths and preserve each invocation role', () => {
  const f = fixture();
  f.write('00-start-here.md', 'Use `/demo` and `/other`.\n');
  f.skill('skills/engineering/demo', 'demo', 'disable-model-invocation: true\n');
  f.write('skills/engineering/demo/agents/openai.yaml', 'policy:\n  allow_implicit_invocation: false\n');
  f.skill('skills/productivity/other', 'other');
  const catalogue = { schemaVersion: 1, sourceCommit: 'a'.repeat(40), skills: [
    { name: 'demo', path: 'skills/engineering/demo/SKILL.md', invocation: 'model' },
  ] };
  f.write('skills/catalog.json', JSON.stringify(catalogue));
  const result = f.lint();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /catalog\.json.*invocation.*demo/);
  assert.match(result.stdout, /catalog\.json.*missing.*other/);
  catalogue.skills[0].invocation = 'user';
  catalogue.skills.push({ name: 'other', path: 'skills/productivity/other/SKILL.md', invocation: 'model' });
  f.write('skills/catalog.json', JSON.stringify(catalogue));
  assert.equal(f.lint().status, 0);
});

test('relative Markdown links resolve fragments and encoded names, including supporting documents', () => {
  const f = fixture();
  f.write('00-start-here.md', 'Use `/demo`.\n');
  f.skill('skills/engineering/demo', 'demo', '', '[Guide](references/guide%20one.md#intro)\n[Web](https://example.invalid/doc)\n');
  f.write('skills/engineering/demo/references/guide one.md', '# Intro\n[Skill](../SKILL.md)\n');
  let result = f.lint();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  f.write('skills/engineering/demo/references/guide one.md', '# Intro\n[Missing](absent.md#intro)\n');
  result = f.lint();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /references\/guide one\.md.*broken link absent\.md#intro/);
});

test('repository strict lint reports synthetic installation drift separately and only enforces it on request', () => {
  const f = fixture();
  f.write('00-start-here.md', 'Use `/demo`.\n');
  f.skill('skills/engineering/demo', 'demo');
  const result = f.lintInstallations();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /catalogue 1 skills, OK/);
  assert.match(result.stdout, /installation drift 2 difference\(s\)/);
  assert.ok(result.stdout.includes(f.home), 'Only the synthetic home may be inspected');
  assert.equal(f.lintInstallations('--strict-installations').status, 1);
  assert.equal(f.lint('--strict-installations').status, 1, 'Conflicting modes must fail');
});

test('nested skill identity validation catches duplicate names, folder mismatch and unknown frontmatter', () => {
  const f = fixture();
  f.write('00-start-here.md', '');
  f.skill('skills/engineering/demo', 'demo');
  f.skill('skills/productivity/demo', 'demo');
  f.skill('skills/engineering/wrong-folder', 'Upper-Name', 'unexpected: data\n');
  const result = f.lint();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /duplicate skill name "demo"/);
  assert.match(result.stdout, /name "Upper-Name" must match folder "wrong-folder"/);
  assert.match(result.stdout, /name must be lowercase/);
  assert.match(result.stdout, /unknown frontmatter key "unexpected"/);
});
