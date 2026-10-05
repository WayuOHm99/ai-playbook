// Best-effort reduction, not an anonymization guarantee. Human review is required.
const RULES = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED:PRIVATE_KEY]'],
  [/\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}/g, '[REDACTED:API_KEY]'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/g, '[REDACTED:GITHUB_TOKEN]'],
  [/\bAIza[0-9A-Za-z_-]{30,}/g, '[REDACTED:GOOGLE_KEY]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED:AWS_KEY]'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[REDACTED:JWT]'],
  [/\b(mysql|mariadb|postgres(?:ql)?|mongodb(?:\+srv)?|redis):\/\/[^:\s/]+:[^@\s]+@/gi, '$1://[REDACTED:DB_CREDS]@'],
  [/((?:["']?)(?:password|passwd|pwd|secret|token|api[_-]?key|pin|รหัสผ่าน|รหัส|พาสเวิร์ด)(?:["']?)\s*[:=]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;]+)/gi, '$1[REDACTED:SECRET]'],
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED:EMAIL]'],
  [/(?<!\d)\d[- ]?\d{4}[- ]?\d{5}[- ]?\d{2}[- ]?\d(?!\d)/g, '[REDACTED:ID]'],
  [/(?<!\d)(?:\+66|0)(?:[ -]?\d){8,9}(?!\d)/g, '[REDACTED:PHONE]'],
  [/((?:ชื่อ(?:ผู้ป่วย|ผู้ใช้|นามสกุล)?|patient[_ ]?name|full[_ ]?name|name|HN|AN|MRN|เลข(?:ประจำตัว(?:ประชาชน)?|บัตร(?:ประชาชน)?|ผู้ป่วย)|โทร(?:ศัพท์)?|เบอร์(?:โทร)?|phone|tel(?:ephone)?|address|ที่อยู่)\s*[:=]\s*)[^\r\n,;|]+/gi, '$1[REDACTED:PERSONAL_FIELD]'],
  [/((?:ผู้ป่วย)?ชื่อ\s*(?:[:=]\s*)?)(?:นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)[^\r\n,;|]+/g, '$1[REDACTED:PERSONAL_FIELD]'],
  [/(?<![A-Z0-9_])[A-Z]:[\\/][^\r\n,;|]+/gi, '[REDACTED:PATH]'],
  [/\/(?:home|Users)\/[^\r\n,;|]+/g, '[REDACTED:PATH]'],
];

export function redactHistory(text) {
  return RULES.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text);
}
