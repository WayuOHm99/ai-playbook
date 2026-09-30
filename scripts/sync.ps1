# Sync the playbook vault into Claude Code and Codex. Idempotent; safe to re-run after editing the vault.
# Never deletes: existing real folders/files with the same name are renamed to <name>.bak-<date>.
$ErrorActionPreference = 'Stop'
$Vault = Split-Path $PSScriptRoot -Parent
$HomeDir = $env:USERPROFILE
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

function Backup-IfReal($path) {
  if (Test-Path -LiteralPath $path) {
    $item = Get-Item -LiteralPath $path -Force
    if ($item.LinkType -eq 'Junction') { return $item.Target }
    # Move backups out of skill folders so a backed-up SKILL.md is never loaded as a duplicate skill.
    $backupDir = Join-Path $HomeDir ".ai-playbook-backups\$Stamp"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    Move-Item -LiteralPath $path -Destination (Join-Path $backupDir $item.Name)
    Write-Host "  backed up $path -> $backupDir"
  }
  return $null
}

function Ensure-Junction($link, $target) {
  $existing = Backup-IfReal $link
  if ($existing -and ($existing -eq $target -or $existing -contains $target)) { return }
  if ($existing) { (Get-Item -LiteralPath $link -Force).Delete() }  # removes only the junction, never the target
  New-Item -ItemType Junction -Path $link -Target $target | Out-Null
  Write-Host "  linked $link -> $target"
}

function Write-IfChanged($path, $content) {
  $old = if (Test-Path -LiteralPath $path) { Get-Content -LiteralPath $path -Raw -Encoding UTF8 } else { $null }
  if ($old -ne $content) {
    New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
    [IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "  wrote $path"
  }
}

Write-Host "1) Instructions"
$core = Get-Content -LiteralPath "$Vault\instructions\core.md" -Raw -Encoding UTF8
$claudeMd = "$HomeDir\.claude\CLAUDE.md"
$claudeImport = "@D:/ai-playbook/instructions/core.md`n"
if ((Test-Path $claudeMd) -and -not ((Get-Content $claudeMd -Raw -Encoding UTF8) -match 'ai-playbook')) { Backup-IfReal $claudeMd | Out-Null }
Write-IfChanged $claudeMd $claudeImport
$header = "<!-- GENERATED from D:\ai-playbook\instructions\core.md by scripts\sync.ps1. Edit the vault, not this file. -->`n`n"
Write-IfChanged "$HomeDir\.codex\AGENTS.md" ($header + $core)

Write-Host "2) Skills (junctions into ~/.claude/skills and ~/.agents/skills)"
foreach ($s in Get-ChildItem -Directory "$Vault\skills") {
  Ensure-Junction "$HomeDir\.claude\skills\$($s.Name)" $s.FullName
  Ensure-Junction "$HomeDir\.agents\skills\$($s.Name)" $s.FullName
}

Write-Host "3) Sub-agents"
foreach ($a in Get-ChildItem "$Vault\agents\claude\*.md") {
  Write-IfChanged "$HomeDir\.claude\agents\$($a.Name)" (Get-Content -LiteralPath $a.FullName -Raw -Encoding UTF8)
}
foreach ($a in Get-ChildItem "$Vault\agents\codex\*.toml") {
  Write-IfChanged "$HomeDir\.codex\agents\$($a.Name)" (Get-Content -LiteralPath $a.FullName -Raw -Encoding UTF8)
}

Write-Host "4) Codex guard hook"
$hooks = @'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^(Bash|shell|apply_patch|Edit|Write)$",
        "hooks": [
          {
            "type": "command",
            "command": "node D:/ai-playbook/guardrails/guard.mjs",
            "commandWindows": "node D:\\ai-playbook\\guardrails\\guard.mjs",
            "timeout": 10,
            "statusMessage": "Playbook guard"
          }
        ]
      }
    ]
  }
}
'@
$codexHooks = "$HomeDir\.codex\hooks.json"
if ((Test-Path $codexHooks) -and -not ((Get-Content $codexHooks -Raw -Encoding UTF8) -match 'ai-playbook')) {
  Write-Host "  ~/.codex/hooks.json exists with other hooks; merge the playbook guard by hand."
} else { Write-IfChanged $codexHooks $hooks }

Write-Host "5) Git long paths"
if ((git config --global core.longpaths) -ne 'true') { git config --global core.longpaths true; Write-Host "  set core.longpaths=true" }

Write-Host "Done. Claude settings (hooks, deny rules, auto mode) are merged by scripts\merge-claude-settings.mjs."
