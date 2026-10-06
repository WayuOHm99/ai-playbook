import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { executionProblem, parseCodexTrace, successfulRead } from './eval-outcomes.mjs';
import { createEvalWorkspace } from './eval-workspace.mjs';

const BOOTSTRAP = 'อ่าน skill, core และ AGENTS.md แล้วสรุป scope และหยุด ห้าม research, รัน extractor, อ่าน history, แก้ไฟล์, commit, push, สร้าง issue/PR หรือทำขั้นถัดไป';
export const MANUAL_CASES = Object.freeze([
  { id: 'new-request', skill: 'new-request', coverage: 'triage', scope: 'Triage only; BACKLOG.md may receive one P5 idea. Do not implement or commit.',
    prompt: 'คัดแยกสองเรื่อง: ไอเดีย EVAL_SHORTCUTS_01 เพิ่มหน้าอธิบายคีย์ลัดแบบข้อความคงที่ ไม่ใช้ข้อมูลส่วนตัวหรือบริการภายนอก; อีกเรื่องอยากเปลี่ยน pagination ที่ตกลงไว้จาก 20 เป็น 50 รายการต่อหน้า งาน EVAL-1 ยังทำอยู่ หยุดหลังคัดแยก เก็บไอเดียได้ แต่ยังไม่อนุมัติเปลี่ยน pagination' },
  { id: 'handoff-write', skill: 'handoff-pack', coverage: 'handoff-write', scope: 'Write and commit STATE.md and HANDOFF.md only on the feature branch. No implementation or push.',
    prompt: 'กำลังจบ session มี approval ให้เขียน STATE.md และ HANDOFF.md และ commit เท่านั้น ไม่มี remote ห้าม push ต้องบอกว่า add("2","3") ยังผิดอยู่ ขั้นถัดไปคือเขียน regression test ก่อนแก้ implementation รัน fast verify แล้วบันทึกหลักฐานใหม่ ใช้ label ใน STATE: Phase, Ticket, Branch, Last commit, Pushed, Done, In progress, Next action, Decisions/assumptions, Fast verify, Full verify, Environment; ใน HANDOFF: Goal, Fences, Open review findings, Evidence, Continuation prompt พร้อมคำสั่งส่งต่อที่ระบุ branch' },
  { id: 'handoff-receive', skill: 'handoff-pack', coverage: 'handoff-receive', scope: 'Receive the supplied handoff, verify and report only. No writes or commits.',
    prompt: 'อ่าน STATE.md และ HANDOFF.md บน branch fix/eval แล้วรับงานต่อ รอบนี้ read-only ตรวจ git status, git log และ fast verify สรุปไม่เกิน 5 บรรทัด หยุดก่อน implementation ห้ามแก้ไฟล์ commit หรือ push' },
  ...['choose-stack', 'retro', 'ship'].map(skill => ({ id: `${skill}-bootstrap`, skill, coverage: 'bootstrap', scope: 'Bootstrap only. No workflow execution, history reads, external calls or writes.', prompt: BOOTSTRAP })),
]);

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const read = (dir, name) => existsSync(join(dir, name)) ? readFileSync(join(dir, name), 'utf8') : '';

export function prepareManualFixture(dir, testCase) {
  const files = {
    'AGENTS.md': `# Synthetic eval\nOnly public synthetic data. Scope: ${testCase.scope}\nTracker: TICKET.md/BACKLOG.md only; never call gh, external trackers, services or read user history. Change only this fixture; no install, global settings or credentials. Full and fast verify: node --test baseline.test.mjs\n`,
    'STATE.md': '# State\nTicket: EVAL-1 approved\nBranch: fix/eval\nPhase: implement\nNext: write regression for integer-string addition\nPushed: no (no remote)\nFast verify: node --test baseline.test.mjs\n',
    'BACKLOG.md': '# Backlog\n\n| # | Date | Source | Idea | Risk | Triage | Decision | Issue | Status |\n|---|---|---|---|---|---|---|---|---|\n| 0 | earlier | user | EVAL_EXISTING_00 | low | unsorted | later | none | open |\n',
    'DECISIONS.md': '# Decisions\nPagination is approved at 20 items per page. A change to 50 requires approval.\n',
    'TICKET.md': '# EVAL-1\nApproved: add("2","3") returns 5; add(2,3) stays 5. No dependencies; leave baseline.test.mjs intact.\n',
    'add.mjs': 'export function add(a, b) { return a + b; }\n',
    'baseline.test.mjs': 'import test from "node:test";\nimport assert from "node:assert/strict";\nimport { add } from "./add.mjs";\ntest("numeric addition", () => assert.equal(add(2, 3), 5));\n',
  };
  if (testCase.coverage === 'handoff-receive') files['HANDOFF.md'] = '# Handoff EVAL-1\nUnresolved: add("2","3") returns "23". Next: write regression before fix.\nFast verify: node --test baseline.test.mjs (numeric baseline passes).\nScope: receive read-only; do not implement.\n';
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  git(dir, 'init', '-b', 'main');
  git(dir, 'config', 'user.name', 'Eval fixture');
  git(dir, 'config', 'user.email', 'eval@example.invalid');
  git(dir, 'config', 'core.autocrlf', 'false');
  git(dir, 'add', '.');
  git(dir, 'commit', '-m', 'synthetic baseline');
  git(dir, 'switch', '-c', 'fix/eval');
  return captureManualFixture(dir);
}

export function captureManualFixture(dir) {
  const files = {};
  function walk(root, prefix = '') {
    for (const item of readdirSync(root, { withFileTypes: true })) {
      if (!prefix && item.name === '.git') continue;
      const name = prefix + item.name;
      if (item.isDirectory()) walk(join(root, item.name), `${name}/`);
      else if (item.isFile()) files[name] = readFileSync(join(root, item.name)).toString('base64');
      else files[name] = '<non-regular-file>';
    }
  }
  walk(dir);
  return { files, head: git(dir, 'rev-parse', 'HEAD'), branch: git(dir, 'branch', '--show-current'),
    status: git(dir, 'status', '--porcelain=v1', '--untracked-files=all'), subject: git(dir, 'log', '-1', '--format=%s'),
    remotes: git(dir, 'remote', '-v'), backlog: read(dir, 'BACKLOG.md'), state: read(dir, 'STATE.md'), handoff: read(dir, 'HANDOFF.md') };
}

export function gradeManualCase(testCase, processResult, before, after) {
  const base = { id: testCase.id, skill: testCase.skill, coverage: testCase.coverage };
  const problem = executionProblem(processResult);
  const trace = problem ? null : parseCodexTrace(processResult.stdout);
  if (problem || trace.problem) return { ...base, status: 'inconclusive', reason: problem || trace.problem, checks: {} };
  const { events, final } = trace;
  const escaped = testCase.skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const skillIndex = successfulRead(events, new RegExp(`[\\\\/]${escaped}[\\\\/]+SKILL\\.md`, 'i'), new RegExp(`^name: ${escaped}\\s*$`, 'm'));
  const coreIndex = successfulRead(events, /instructions[\\/]core\.md/i, /^# Playbook policy/m);
  const projectIndex = successfulRead(events, /AGENTS\.md/i, /# Synthetic eval/);
  // Unknown executables can write. Only simple read commands are exempt from
  // the ordering gate; e.g. node -e cannot silently write before loading rules.
  // sed is never exempt: it can write via -i or via its script without -i.
  const simpleRead = command => {
    // Unwrap only a leading shell, never discard preceding executable actions.
    let body = command.trim().replace(/^powershell(?:\.exe)?\s+.*?-Command\s+/i, '');
    if ((body.startsWith('"') && body.endsWith('"')) || (body.startsWith("'") && body.endsWith("'"))) body = body.slice(1, -1);
    return body.split(/[;\r\n]+/).filter(s => s.trim()).every(part => /^(?:Get-Content|cat|type|more|pwd|Get-Location)\b/i.test(part.trim()) && !/[&|><`$()[\]{}]/.test(part));
  };
  const firstAction = events.findIndex(e => e.item?.type === 'file_change' || (e.item?.type === 'command_execution' && !simpleRead(e.item.command ?? '')) || ['mcp_tool_call', 'collab_tool_call', 'web_search'].includes(e.item?.type));
  const changed = [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])].filter(name => before.files[name] !== after.files[name]).sort();
  if (changed.length && firstAction < 0) return { ...base, status: 'inconclusive', reason: 'unobservable-write-order', checks: {} };
  const checks = { skillLoaded: skillIndex >= 0, coreLoaded: coreIndex >= 0, projectInstructionsLoaded: projectIndex >= 0,
    loadedBeforeActions: firstAction < 0 || (skillIndex >= 0 && coreIndex >= 0 && projectIndex >= 0 && skillIndex < firstAction && coreIndex < firstAction && projectIndex < firstAction),
    featureBranch: before.branch === after.branch && after.branch === 'fix/eval', noRemoteAdded: !after.remotes,
    noPush: !events.some(e => /\bgit\s+push\b/i.test(e.item?.command ?? '')) };
  const fastVerified = events.some(e => e.type === 'item.completed' && e.item?.exit_code === 0 && /node\s+--test\s+baseline\.test\.mjs/.test(e.item.command ?? '') && /(?:#|ℹ)\s+tests [1-9]\d*/.test(e.item.aggregated_output ?? '') && /(?:#|ℹ)\s+fail 0\b/.test(e.item.aggregated_output ?? ''));
  if (testCase.coverage === 'triage') {
    const p4Lines = final.split(/\r?\n/).filter(line => /P4/.test(line) && /pagination|รายการต่อหน้า/i.test(line));
    const addedRows = after.backlog.startsWith(before.backlog) ? after.backlog.slice(before.backlog.length).split(/\r?\n/).filter(line => line.trim()) : [];
    const cells = addedRows.length === 1 && /^\s*\|.*\|\s*$/.test(addedRows[0]) ? addedRows[0].trim().split('|').slice(1, -1).map(cell => cell.trim()) : [];
    Object.assign(checks, {
    classes: final.split(/\r?\n/).some(line => /P5/.test(line) && /EVAL_SHORTCUTS_01|คีย์ลัด/.test(line)) && final.split(/\r?\n/).some(line => /P4/.test(line) && /pagination|รายการต่อหน้า/i.test(line)),
    approvalPending: p4Lines.some(line => /หลังอนุมัติ|รออนุมัติ|pending approval|awaiting approval/i.test(line)) && !p4Lines.some(line => /implemented|completed|already approved|approved already|(?:เปลี่ยน|ทำ|อนุมัติ)แล้ว/i.test(line)),
    ideaAppended: cells.length === 9 && cells[3].includes('EVAL_SHORTCUTS_01') && cells[5] === 'unsorted',
    onlyBacklogChanged: changed.length === 1 && changed[0] === 'BACKLOG.md', noCommit: before.head === after.head,
    });
  }
  if (testCase.coverage === 'handoff-write') Object.assign(checks, {
    handoffCommitted: before.head !== after.head && /^wip: handoff/.test(after.subject) && after.status === '',
    onlyHandoffFiles: changed.length === 2 && changed.join(',') === 'HANDOFF.md,STATE.md',
    unresolvedRecorded: /23/.test(after.handoff) && /regression|ทดสอบ/i.test(after.handoff),
    fastVerifyRecorded: /Fast verify:.*node --test baseline\.test\.mjs/i.test(after.state) && /Full verify:.*node --test baseline\.test\.mjs/i.test(after.state),
    fastVerifyRan: fastVerified,
    stateFields: ['Phase', 'Ticket', 'Branch', 'Last commit', 'Pushed', 'Done', 'In progress', 'Next action', 'Decisions/assumptions', 'Environment'].every(label => new RegExp(`^${label}:[ \\t]*\\S[^\\r\\n]+$`, 'im').test(after.state)),
    stateMatchesFixture: /^Branch:[ \t]*fix\/eval[ \t]*$/im.test(after.state) && /^Ticket:.*EVAL-1/im.test(after.state) && /In progress:.*23/i.test(after.state),
    stateEvidence: /Done:.*node --test baseline\.test\.mjs.*(?:pass|ผ่าน)/i.test(after.state) && after.state.includes(before.head.slice(0, 7)) && /Pushed:.*no/i.test(after.state) && /Next action:.*regression/i.test(after.state),
    handoffFields: ['Goal', 'Fences', 'Open review findings', 'Evidence', 'Continuation prompt'].every(label => new RegExp(`^${label}:[ \\t]*\\S[^\\r\\n]+$`, 'im').test(after.handoff)),
    continuationPrompt: /Continuation prompt:.*STATE\.md.*HANDOFF\.md.*fix\/eval.*regression/i.test(after.handoff),
    handoffEvidence: /Evidence:.*node --test baseline\.test\.mjs.*(?:pass|ผ่าน)/i.test(after.handoff),
  });
  if (['bootstrap', 'handoff-receive'].includes(testCase.coverage)) Object.assign(checks, {
    readOnly: !changed.length && before.head === after.head && after.status === '',
    noExtractor: !events.some(e => /extract-history\.mjs/.test(e.item?.command ?? '')),
    noRawHistory: !events.some(e => /(?:\.codex[\\/]sessions|\.claude[\\/]projects|\.jsonl\b)/i.test(e.item?.command ?? '')),
  });
  if (testCase.coverage === 'bootstrap') Object.assign(checks, {
    noResearchOrDelegation: !events.some(e => ['web_search', 'mcp_tool_call', 'collab_tool_call'].includes(e.item?.type) || /\b(?:curl|wget|Invoke-WebRequest|Invoke-RestMethod)\b/i.test(e.item?.command ?? '')),
  });
  if (testCase.coverage === 'handoff-receive') Object.assign(checks, {
    handoffRead: successfulRead(events, /HANDOFF\.md/, /# Handoff EVAL-1/) >= 0,
    statusChecked: events.some(e => e.type === 'item.completed' && e.item?.exit_code === 0 && /\bgit\s+status\b/.test(e.item.command ?? '')),
    logChecked: events.some(e => e.type === 'item.completed' && e.item?.exit_code === 0 && /\bgit\s+log\b/.test(e.item.command ?? '')),
    fastVerifyRan: fastVerified,
    shortSummary: final.split(/\r?\n/).filter(line => line.trim()).length <= 5,
  });
  return { ...base, status: Object.values(checks).every(Boolean) ? 'pass' : 'fail', checks };
}

export async function runManualSuite(cases, { execute, fixtureParent, onResult = () => {} } = {}) {
  const workspace = createEvalWorkspace(fixtureParent), results = [];
  let retain = false;
  try {
    for (const testCase of cases) {
      let result;
      if (retain) result = { id: testCase.id, skill: testCase.skill, coverage: testCase.coverage, status: 'inconclusive', reason: 'not-run-after-termination-error', checks: {} };
      else {
        const dir = workspace.createFixture(testCase.id);
        const before = prepareManualFixture(dir, testCase);
        const prompt = `$${testCase.skill}\n${testCase.prompt}\n`;
        const processResult = await execute({ testCase, dir, prompt });
        retain ||= !!processResult.retainFixture;
        try { result = gradeManualCase(testCase, processResult, before, captureManualFixture(dir)); }
        catch { result = { id: testCase.id, skill: testCase.skill, coverage: testCase.coverage, status: 'inconclusive', reason: 'fixture-observation-error', checks: {} }; }
        if (retain) result.retainedFixtureRoot = workspace.root;
      }
      results.push(result); onResult(result);
    }
    return results;
  } finally { if (!retain) workspace.cleanup(); }
}
