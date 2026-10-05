# Install the vault's skills and sub-agents into Claude Code and Codex. Run by hand after editing a skill.
# It does not install global rules, scheduled tasks or auto-sync: nothing from the vault loads unless you type /<skill>.
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

# Claude Desktop's "/" menu omits junction-linked skills (anthropics/claude-code#68318, closed not planned),
# so Claude gets real copies. Re-run this script by hand after editing a skill.
function Ensure-Copy($dest, $src) {
  if (Test-Path -LiteralPath $dest) {
    $item = Get-Item -LiteralPath $dest -Force
    if ($item.LinkType -eq 'Junction') { $item.Delete(); Write-Host "  replaced junction $dest" }  # removes only the link
  }
  robocopy $src $dest /MIR /NJH /NJS /NFL /NDL /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed for $dest ($LASTEXITCODE)" }
  $global:LASTEXITCODE = 0
}

function Write-IfChanged($path, $content) {
  $old = if (Test-Path -LiteralPath $path) { Get-Content -LiteralPath $path -Raw -Encoding UTF8 } else { $null }
  if ($old -ne $content) {
    New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
    [IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "  wrote $path"
  }
}

# Global instructions are NOT installed: the vault is a library. Skills read instructions/core.md only when you invoke them.

Write-Host "2) Skills (copies into ~/.claude/skills, junctions into ~/.agents/skills for Codex)"
foreach ($s in Get-ChildItem -Directory "$Vault\skills") {
  Ensure-Copy "$HomeDir\.claude\skills\$($s.Name)" $s.FullName
  Ensure-Junction "$HomeDir\.agents\skills\$($s.Name)" $s.FullName
}

Write-Host "3) Sub-agents"
foreach ($a in Get-ChildItem "$Vault\agents\claude\*.md") {
  Write-IfChanged "$HomeDir\.claude\agents\$($a.Name)" (Get-Content -LiteralPath $a.FullName -Raw -Encoding UTF8)
}
foreach ($a in Get-ChildItem "$Vault\agents\codex\*.toml") {
  Write-IfChanged "$HomeDir\.codex\agents\$($a.Name)" (Get-Content -LiteralPath $a.FullName -Raw -Encoding UTF8)
}

# The guard hook is NOT installed (removed at the user's request on 2026-10-05). See guardrails/README.md to enable it by hand.

Write-Host "5) Git long paths"
if ((git config --global core.longpaths) -ne 'true') { git config --global core.longpaths true; Write-Host "  set core.longpaths=true" }

Write-Host "6) Skill lint + drift check (warn-only)"
node "$Vault\scripts\lint-skills.mjs"

Write-Host "Done."
