<!--
TEMPLATE. How to start the app locally on Windows 11. Goal: a stranger gets it running in 10 minutes.
Replace <placeholders>; delete steps that do not apply. Every command here must have been run by you.
-->
# Run locally (Windows)

Last checked: <YYYY-MM-DD> on <Windows 11, Node 24.x, Docker Desktop x.y>

## 1. Prerequisites
- Node.js <24 LTS> (`node -v`), npm (`npm -v`)
- Git (`git --version`); long paths on: `git config --global core.longpaths true`
- Docker Desktop, running (whale icon not animating) if the project uses MySQL in Docker
- Free ports: <3000 web, 4000 api, 3310 db> (see check below)

## 2. First time
```powershell
git clone <repo-url> <folder>
cd <folder>
npm install
# ทำเอง (agent ถูกกันไม่ให้แก้ .env): copy สองไฟล์นี้แล้วแก้ค่าเอง, never commit
copy <database/docker/compose.env.example> <database/docker/compose.env>
copy <apps/api/.env.example> <apps/api/.env>
```

## 3. Start everything
```powershell
docker info                      # must print Server info, not an error
npm run <db:up>                  # starts MySQL, waits until healthy
npm run <db:bootstrap>           # first time only: creates admin (password comes from env)
npm run <dev:api>                # terminal 1
npm run <dev:web>                # terminal 2
```
Open <http://localhost:5173>. Login: <seeded test user per README; synthetic data only>.

## 4. Check it works (30 seconds)
```powershell
curl http://localhost:<4000>/api/health          # expect: ok / status up
docker ps                                        # db container "healthy"
npm run verify                                   # full check before handing work over
```

## 5. Docker checks
| Problem | Check | Fix |
|---|---|---|
| `docker info` errors | Docker Desktop not running | Start Docker Desktop, wait for "running" |
| Container restarting | `docker logs <db-container>` | wrong password in env vs existing volume: `npm run <db:reset>` (**deletes local dev data**) |
| Port already in use | `netstat -ano \| findstr :<3310>` | stop the other process or change the port in compose.env |
| `db` not healthy after 2 min | `docker compose --env-file <...> logs db` | low disk/RAM in Docker Desktop settings |
| WSL2 errors | `wsl --status` | `wsl --update`, reboot |

## 6. White screen / blank page
Open browser DevTools (F12), check **Console** and **Network** first.
| Symptom | Likely cause | Fix |
|---|---|---|
| Blank page, Console error `Failed to fetch` / 404 on `/api/...` | API not running or wrong proxy/port | start API; check `VITE_API_URL` / vite proxy target |
| Blank page, `Unexpected token <` | API returned HTML (wrong URL) or build served at wrong base path | check base path and proxy |
| Blank after a code change | stale Vite cache | stop dev server; delete `apps/web/node_modules/.vite`; start again |
| Blank after pulling new code | dependencies changed | `npm install`; restart |
| Works in dev, blank in prod build | base path, missing env at build time | `npm run build`, serve with `npm run preview`, compare |
| Login loop or 401 | cookie blocked (http vs https, different host) | use `localhost` consistently; clear site cookies |
| Page shows but no Thai text / boxes | font files not bundled | confirm fonts are self-hosted and loaded (Network tab) |
| Hard refresh fixes it | browser cache / service worker | DevTools > Application > Clear storage |

## 7. Stop / reset
```powershell
# Ctrl+C in each terminal
npm run <db:down>                # stop DB, keep data
npm run <db:reset>               # wipe local DB (dev data only!)
```

## 8. Still stuck
Collect: `node -v`, `docker info` (first lines), last 30 lines of API/web terminal, browser Console error. Put in a GitHub Issue or BACKLOG.md. Do not paste secrets or real data.
