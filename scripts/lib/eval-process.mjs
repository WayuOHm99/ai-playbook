import { spawn, spawnSync } from 'node:child_process';

// No shell interpolation: prompts go on stdin. Windows .js/.mjs entry points
// run through Node, or callers provide a native .exe rather than an npm .cmd.
export function runEvalProcess(binary, args, { cwd, prompt, timeoutMs = 240_000 } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new Error('timeoutMs must be a positive integer');
  const script = /\.[cm]?js$/i.test(binary);
  if (process.platform === 'win32' && !script && !/\.exe$/i.test(binary)) throw new Error('On Windows use a native .exe or Node .js/.mjs CLI entry point');
  return new Promise(resolve => {
    const child = spawn(script ? process.execPath : binary, script ? [binary, ...args] : args,
      { cwd, windowsHide: true, shell: false, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', error, timedOut = false, retainFixture = false;
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });
    child.on('error', e => { error ??= e.message; });
    child.stdin.on('error', e => { if (e.code !== 'EPIPE') error ??= e.message; });
    const timer = setTimeout(() => {
      timedOut = true;
      if (!child.pid) return;
      if (process.platform === 'win32') {
        // Kill descendants before close permits fixture cleanup.
        const killed = spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, encoding: 'utf8' });
        if (killed.status !== 0) { retainFixture = true; error ??= 'Process-tree termination failed'; child.kill(); }
      } else {
        try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { retainFixture = true; error ??= e.message; child.kill('SIGKILL'); }
      }
    }, timeoutMs);
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, timedOut, error, stdout, stderr, retainFixture });
    });
    child.stdin.end(prompt);
  });
}
