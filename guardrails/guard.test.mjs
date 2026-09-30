// Tests for guard.mjs. Run: node guardrails/guard.test.mjs
// Cases are built from fragments so this file never contains a literal destructive command line
// (which the guard itself would block when an agent writes it through a shell).
import { check } from './guard.mjs';

const R = ['r', 'm'].join('');
const bash = (command) => ({ tool_name: 'Bash', tool_input: { command } });
const ps = (command) => ({ tool_name: 'PowerShell', tool_input: { command } });
const file = (tool, path) => ({ tool_name: tool, tool_input: { file_path: path } });
const patch = (path, body) => ({ tool_name: 'apply_patch', tool_input: { input: `*** Begin Patch\n*** Update File: ${path}\n${body}\n*** End Patch` } });

const BLOCK = [
  bash(`${R} -rf build`), bash(`${R} -fr build`), bash(`${R} -r --force build`), bash(`${R} --recursive -f build`),
  ps(`Remove-Item -Recurse -Force .\\build`), ps(`${R} -Recurse -Force .\\build`), ps(`ri -r -fo build`), ps(`del -Force -Recurse x`),
  bash('cmd /c rd /s /q build'), bash('find . -name "*.log" -delete'),
  bash('git push --force origin feat/x'), bash('git push -f origin feat/x'), bash('git push origin +feat/x'),
  bash('git push origin --delete feat/x'), bash('git push origin :feat/x'),
  bash('git push origin main'), bash('git push origin HEAD:main'), bash('git push -u origin master'),
  bash('gh pr merge 5 --squash'),
  bash('git reset --hard HEAD~1'), bash('git clean -fd'), bash('git checkout -- .'), bash('git restore .'),
  bash('git branch -D feat/x'), bash('git stash clear'),
  bash('mysql -u root -e "DROP TABLE users"'), bash('docker exec db mysql -e "TRUNCATE TABLE logs"'),
  bash('psql -c "DELETE FROM users"'), bash('mysql -e "ALTER TABLE a DROP COLUMN b"'),
  bash('docker volume rm suth_mysql-data'), bash('docker compose down -v'),
  bash('docker compose -f deploy/compose.prod.yaml down --volumes'), bash('docker system prune -a --volumes'),
  bash('echo X=1 >> .env'), ps('Set-Content .env "X=1"'), bash("sed -i 's/a/b/' .env"), bash('cat .env'),
  ps('Get-Content .env.local'), bash('git add -f .env'),
  file('Write', 'D:/p/.env'), file('Edit', 'D:/p/.env.production'), file('Read', 'D:/p/.env'),
  patch('.env', '+SECRET=1'),
];

const ALLOW = [
  bash('npm test'), bash('npm run verify'), bash('git status'), bash('git push -u origin fix/12-kpi'),
  bash('git push --force-with-lease origin feat/x'), bash('git branch -d feat/x'), bash('git reset --soft HEAD~1'),
  bash('git commit -m "fix: truncate long device names"'), bash('gh issue create --body "delete from the list"'),
  bash('grep -rn "DROP TABLE" docs/'), bash('psql -c "DELETE FROM sessions WHERE expired"'),
  bash('docker compose down'), bash('docker compose -f compose.yaml up -d'),
  bash('cp .env.example .env.example.bak'), bash('cat .env.example'), bash(`${R} -r dist`),
  file('Write', 'D:/p/.env.example'), file('Read', 'D:/p/src/env.ts'), file('Edit', 'D:/p/src/config.ts'),
  patch('src/config.ts', '+const port = process.env.PORT'),
  { tool_name: 'Bash', tool_input: { command: `*** Begin Patch\n*** Add File: docs/x.md\n+Never run ${R} -rf /\n*** End Patch` } },
];

let fail = 0;
for (const c of BLOCK) if (!check(c)) { fail++; console.log('SHOULD BLOCK:', JSON.stringify(c.tool_input)); }
for (const c of ALLOW) { const r = check(c); if (r) { fail++; console.log(`SHOULD ALLOW (${r}):`, JSON.stringify(c.tool_input)); } }
console.log(`${BLOCK.length + ALLOW.length - fail}/${BLOCK.length + ALLOW.length} passed`);
process.exit(fail ? 1 : 0);
