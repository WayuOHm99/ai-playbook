// Resumed or forked sessions replay earlier prompts. Keep only lines not already seen in an earlier session
// of the same project, and drop sessions left with no new user prompt.
// sessions: [{ date, out: ['[U] ...', '[A] ...'] }] sorted oldest first.
export function dedupeSessions(sessions) {
  const seen = new Set();
  const result = [];
  for (const s of sessions) {
    const out = s.out.filter((line) => !seen.has(line));
    for (const line of s.out) seen.add(line);
    if (out.some((l) => l.startsWith('[U]'))) result.push({ ...s, out });
  }
  return result;
}
