// Execution health is checked before skill/behavior grading. Errors are never passes.
export function executionProblem({ code, signal, timedOut, error, stderr = '' }) {
  if (timedOut) return 'timeout';
  if (error) return 'process-error';
  if (signal) return 'signal';
  if (/oauth.*expired|failed to authenticate|authentication.*failed|usage limit|quota.*exceeded|rate limit|model.*(?:not supported|unsupported)/i.test(stderr)) return 'auth-or-limit';
  if (code !== 0) return 'nonzero-exit';
  return null;
}

export function summarizeEvals(results) {
  const count = status => results.filter(r => r.status === status).length;
  const passed = count('pass'), failed = count('fail'), inconclusive = count('inconclusive');
  const total = results.length, scored = passed + failed;
  return { total, passed, failed, inconclusive, scored,
    passRate: total ? Math.round(100 * passed / total) : null,
    scoredPassRate: scored ? Math.round(100 * passed / scored) : null };
}

export function evalExitCode(results) {
  const summary = summarizeEvals(results);
  if (!summary.total || summary.inconclusive) return 2;
  return summary.failed ? 1 : 0;
}

export function parseCodexTrace(stdout) {
  const events = [];
  for (const line of stdout.split(/\r?\n/).filter(line => line.trim())) {
    try {
      const event = JSON.parse(line);
      if (!event || typeof event !== 'object' || typeof event.type !== 'string') throw new Error();
      events.push(event);
    } catch { return { problem: 'invalid-json-events', events: [] }; }
  }
  if (events.some(e => e.type === 'error' || e.type === 'turn.failed')) return { problem: 'agent-error', events };
  // An earlier completed turn cannot certify a truncated continuation. Be
  // conservative about trailing events and require this turn's own reply.
  if (events.at(-1)?.type !== 'turn.completed') return { problem: 'incomplete-events', events };
  const previousCompletion = events.slice(0, -1).findLastIndex(e => e.type === 'turn.completed');
  const lastStart = events.findLastIndex(e => e.type === 'turn.started');
  const finalTurn = events.slice(Math.max(lastStart, previousCompletion + 1));
  const messages = finalTurn.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message' && typeof e.item.text === 'string');
  if (!messages.length || !messages.at(-1).item.text.trim()) return { problem: 'incomplete-events', events };
  return { problem: null, events, final: messages.at(-1).item.text };
}

// Require a completed successful read command and document content. A prompt, path
// mention, echo, failed read, or item.started is not evidence of loading a skill.
export function successfulRead(events, pathPattern, contentPattern) {
  return events.findIndex(e => e.type === 'item.completed' && e.item?.type === 'command_execution'
    && e.item.exit_code === 0 && typeof e.item.command === 'string'
    && /(?:^|[\s;|&"'(])(?:Get-Content|cat|type|sed|more)\b/i.test(e.item.command)
    && !/\b(?:echo|Write-Output)\b/i.test(e.item.command)
    && pathPattern.test(e.item.command) && contentPattern.test(e.item.aggregated_output ?? ''));
}

export function gradeLegacyTrigger(skill, tool, result, expected) {
  const problem = executionProblem(result);
  if (problem) return { status: 'inconclusive', reason: problem, fired: null };
  let fired;
  if (tool === 'codex') {
    const trace = parseCodexTrace(result.stdout);
    if (trace.problem) return { status: 'inconclusive', reason: trace.problem, fired: null };
    fired = successfulRead(trace.events, new RegExp(`[\\\\/]${skill}[\\\\/]+SKILL\\.md`, 'i'), new RegExp(`^name: ${skill}\\s*$`, 'm')) >= 0;
  } else {
    let events;
    try { events = result.stdout.split(/\r?\n/).filter(l => l.trim()).map(l => JSON.parse(l)); }
    catch { return { status: 'inconclusive', reason: 'invalid-json-events', fired: null }; }
    if (events.some(e => !e || typeof e !== 'object' || typeof e.type !== 'string')) return { status: 'inconclusive', reason: 'invalid-json-events', fired: null };
    const end = events.findLast(e => e?.type === 'result');
    if (!end || end.is_error || end.subtype !== 'success') return { status: 'inconclusive', reason: 'agent-error-or-incomplete-events', fired: null };
    const uses = events.flatMap(e => e.message?.content ?? []).filter(b => b.type === 'tool_use' && b.name === 'Skill' && b.input?.skill === skill);
    const replies = events.flatMap(e => e.message?.content ?? []).filter(b => b.type === 'tool_result' && !b.is_error);
    fired = uses.some(use => replies.some(reply => reply.tool_use_id === use.id));
  }
  return { status: fired === expected ? 'pass' : 'fail', fired };
}
