// Tests for prompt-secret-scan.mjs. Run: node --test guardrails/prompt-secret-scan.test.mjs
// Credential-shaped samples are assembled from fragments so this file never contains a literal token
// that a secret scanner (or this hook) would flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { scan, message } from './prompt-secret-scan.mjs';

const script = fileURLToPath(new URL('./prompt-secret-scan.mjs', import.meta.url));
const A = 'Ab3dEf6hIj9kLmN0pQrStUvWxYz1234567890abcd';
const j = (...parts) => parts.join('');

const BLOCK = {
  'Anthropic API key': j('ใช้คีย์นี้ ', 'sk-', 'ant-', 'api03-', A),
  'OpenAI-style API key': j('key ', 'sk-', 'proj-', A),
  'GitHub token': j('gh', 'p_', A.slice(0, 36)),
  'GitHub fine-grained token': j('github', '_pat_', A.slice(0, 32)),
  'AWS access key id': j('AK', 'IA', 'ABCDEFGHIJKLMNOP'),
  'Google API key': j('AI', 'za', A.slice(0, 35)),
  'Slack token': j('xo', 'xb-', '1234567890-abcdefghij'),
  'JWT': j('ey', 'J', A.slice(0, 20), '.', 'ey', 'J', A.slice(0, 20), '.', A.slice(0, 20)),
  'private key block': j('-----BEGIN RSA ', 'PRIVATE KEY-----'),
  'connection URL': j('mysql://root:', 'Sup3rSecretPw', '@db.internal:3306/app'),
  'labelled password (en)': j('admin password', ': ', 'Hosp1talAdmin99'),
  'labelled password (th)': j('รหัสผ่าน', 'คือ ', 'Admin2026pass'),
  'api key assignment': j('API_KEY', '=', 'q7Wm2Lx9Zp4Tn8Vb'),
  'quoted label in JSON': j('{"host":"db","user":"root","pass', 'word":"', 'Hosp1talAdmin99"}'),
  'quoted label in Python dict': j("cfg = {'pass", "word': '", "Hosp1talAdmin99'}"),
  'API key with a space': j('API key: ', 'q7Wm2Lx9Zp4Tn8Vb'),
  'real secret after a placeholder': j('ตัวอย่าง password: example123 แต่ของจริงคือ pass', 'word: ', 'Zq81mmTT9x'),
  'real value starting with Your': j('pass', 'word: ', 'YourHosp1tal2026'),
  'real value starting with Example': j('pass', 'word: ', 'Example2026x'),
};

const PASS = [
  'ทำต่อ',
  'รหัสผ่านอยู่ในตัวแปร DB_PASSWORD อย่า echo ค่า',
  'password: <DB_PASSWORD>',
  'token = ${GITHUB_TOKEN}',
  'ตั้งค่า api_key=process.env.OPENAI_API_KEY ในโค้ด',
  'อธิบายว่า JWT กับ API key ต่างกันอย่างไร',
  'แก้หน้า login ให้ช่อง password ยาวอย่างน้อย 8 ตัวอักษร',
  'commit 9836558c5fb9d7a0a4d2b61e7c2f1d3e4a5b6c7d แล้วเปิด PR',
  'เปิด https://github.com/WayuOHm99/ai-playbook/pull/11',
  'secret: changeme',
  'password: your_db_password',
  'API_KEY=YOUR_API_KEY_123',
  '{"password": "<DB_PASSWORD>"}',
];

for (const [name, text] of Object.entries(BLOCK)) {
  test(`blocks ${name}`, () => {
    assert.ok(scan(text).length > 0);
  });
}

for (const text of PASS) {
  test(`passes: ${text.slice(0, 40)}`, () => {
    assert.deepEqual(scan(text), []);
  });
}

test('message never repeats the prompt text', () => {
  const text = BLOCK['labelled password (en)'];
  assert.ok(!message(scan(text)).includes('Hosp1tal'));
});

test('CLI exits 2 and prints no secret for a credential prompt', () => {
  const r = spawnSync(process.execPath, [script], { input: JSON.stringify({ prompt: BLOCK['connection URL'] }), encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /BLOCKED by playbook secret scan/);
  assert.ok(!r.stderr.includes('Sup3r'));
});

// Links the script's directory rather than the file: a Windows junction needs no elevated rights, while a
// file symlink does, so the file form skipped on ordinary Windows machines. POSIX ignores the type argument
// and creates a directory symlink. Sync installs Codex skills through junctions, so this is the real shape.
test('CLI still runs when started through a linked directory', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'secret-scan-'));
  const link = join(dir, 'linked');
  // Remove the link itself, never recursively, so cleanup cannot reach the real guardrails directory.
  t.after(() => {
    try { rmdirSync(link); } catch { try { unlinkSync(link); } catch { /* link was never created */ } }
    rmdirSync(dir);
  });
  symlinkSync(dirname(script), link, 'junction');
  const r = spawnSync(process.execPath, [join(link, basename(script))], { input: JSON.stringify({ prompt: BLOCK['connection URL'] }), encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /BLOCKED by playbook secret scan/);
});

test('CLI exits 0 for a normal prompt and for malformed input', () => {
  assert.equal(spawnSync(process.execPath, [script], { input: JSON.stringify({ prompt: 'ทำต่อ' }), encoding: 'utf8' }).status, 0);
  assert.equal(spawnSync(process.execPath, [script], { input: 'not json', encoding: 'utf8' }).status, 0);
});
