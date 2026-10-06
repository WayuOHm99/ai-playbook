// Optional UserPromptSubmit hook for Claude Code: blocks a prompt that appears to contain a credential,
// before it is sent or stored in history. Reads the hook JSON on stdin; exit 2 blocks, exit 0 passes.
// It only knows the patterns below. A plain password or PIN with no label is not detected.
// The message never repeats the matched text.
import { realpathSync } from 'node:fs';
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
  // The label may be quoted (JSON, Python/JS dicts), so allow a closing quote before the separator.
  ['labelled password or secret', /(?:password|passwd|pwd|secret|api[_ -]?key|token|รหัสผ่าน|พาสเวิร์ด)["'`]?\s*(?:[:=]|คือ|เป็น)\s*["'`]?(?=[^\s"'`]*\d)(?=[^\s"'`]*[A-Za-z])[^\s"'`<>,}]{8,}/gi],
];

// Placeholders and variable names are the recommended way to refer to a secret, so they must pass.
// your_/example_ forms need a separator, so a real value such as "YourHosp1tal2026" is not treated as a placeholder.
const PLACEHOLDER = /^(?:<[^>]+>|\$\{?[A-Z_][A-Z0-9_]*\}?|process\.env\.[A-Z0-9_]+|x{4,}|\*{4,}|your[_-][a-z0-9_]+|example(?:[_-][a-z0-9_]+)?\d{0,3}|changeme)$/i;

export function scan(prompt) {
  const found = [];
  for (const [name, re] of RULES) {
    if (name === 'labelled password or secret') {
      // Check every labelled value: a placeholder earlier in the prompt must not hide a real one later.
      const real = [...prompt.matchAll(re)].some((m) => !PLACEHOLDER.test(m[0].replace(/^.*?(?:[:=]|คือ|เป็น)\s*["'`]?/i, '')));
      if (real) found.push(name);
      continue;
    }
    if (re.test(prompt)) found.push(name);
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

// Compare real paths so the hook still runs when its path goes through a symlink or junction.
const invokedPath = (() => { try { return realpathSync(process.argv[1] ?? ''); } catch { return ''; } })();
if (invokedPath === realpathSync(fileURLToPath(import.meta.url))) {
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
