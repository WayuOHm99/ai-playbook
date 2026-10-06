// Optional UserPromptSubmit hook for Claude Code: blocks a prompt that appears to contain a credential,
// before it is sent or stored in history. Reads the hook JSON on stdin; exit 2 blocks, exit 0 passes.
// It only knows the patterns below. A plain password or PIN with no label is not detected.
// The message never repeats the matched text.
import { fileURLToPath } from 'node:url';

const RULES = [
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI-style API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],
  ['AWS access key id', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['Google API key', /\bAIza[A-Za-z0-9_-]{35}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Supabase/JWT token', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['password inside a connection URL', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s@/]{6,}@[^\s/]+/i],
  ['labelled password or secret', /(?:password|passwd|pwd|secret|api[_-]?key|token|รหัสผ่าน|พาสเวิร์ด)\s*(?:[:=]|คือ|เป็น)\s*["'`]?(?=[^\s"'`]*\d)(?=[^\s"'`]*[A-Za-z])[^\s"'`<>]{8,}/i],
];

// Placeholders and variable names are the recommended way to refer to a secret, so they must pass.
const PLACEHOLDER = /^(?:<[^>]+>|\$\{?[A-Z_][A-Z0-9_]*\}?|process\.env\.[A-Z0-9_]+|x{4,}|\*{4,}|your[_-]?\w+|example\w*|changeme)$/i;

export function scan(prompt) {
  const found = [];
  for (const [name, re] of RULES) {
    const m = re.exec(prompt);
    if (!m) continue;
    if (name === 'labelled password or secret') {
      const value = m[0].replace(/^.*?(?:[:=]|คือ|เป็น)\s*["'`]?/i, '');
      if (PLACEHOLDER.test(value)) continue;
    }
    found.push(name);
  }
  return found;
}

export function message(found) {
  return [
    'BLOCKED by playbook secret scan: ข้อความนี้ดูเหมือนมีความลับ (' + found.join(', ') + ')',
    'ข้อความยังไม่ถูกส่ง ให้ลบค่าจริงออกแล้วใช้ชื่อตัวแปรแทน เช่น DB_PASSWORD หรือ <API_KEY>',
    'ถ้าค่านี้เป็นของจริงและเคยวางที่อื่นมาก่อน ควรเปลี่ยน (rotate) ค่านั้น',
    'ถ้าเป็นการจับผิด ให้เขียนใหม่โดยไม่ใส่ค่าที่หน้าตาเหมือนคีย์ หรือปิด hook นี้ใน ~/.claude/settings.json',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { raw += c; });
  process.stdin.on('end', () => {
    let prompt = '';
    try { prompt = String(JSON.parse(raw).prompt ?? ''); } catch { process.exit(0); } // never block on malformed hook input
    const found = scan(prompt);
    if (found.length === 0) process.exit(0);
    process.stderr.write(message(found) + '\n');
    process.exit(2);
  });
}
