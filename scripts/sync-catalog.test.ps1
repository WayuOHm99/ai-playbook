# Recursive catalogue regressions with synthetic vaults/homes only.
# Git and Node are stubbed; no installed environment or global configuration is touched.
$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$RunRoot = Join-Path $RepoRoot ('.scratch\sync-catalog-tests\run-' + [Guid]::NewGuid().ToString('N'))
$SyncSource = Join-Path $PSScriptRoot 'sync.ps1'
$Passed = 0
$Failed = 0

function Write-FixtureFile($path, $content) {
  $full = [IO.Path]::GetFullPath($path)
  $root = [IO.Path]::GetFullPath($RunRoot).TrimEnd('\') + '\'
  if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) { throw 'Fixture path outside generated run' }
  New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
  [IO.File]::WriteAllText($path, $content)
}
function Assert-True($condition, $message) { if (-not $condition) { throw $message } }
function New-Fixture($name) {
  $root = Join-Path $RunRoot $name
  $vault = Join-Path $root 'vault space'
  $profile = Join-Path $root ('home ' + [char]0x0E44)
  $scriptPath = Join-Path $vault 'scripts\sync.ps1'
  Write-FixtureFile $scriptPath ([IO.File]::ReadAllText($SyncSource))
  foreach ($dir in @('agents\claude', 'agents\codex', 'skills')) {
    New-Item -ItemType Directory -Force -Path (Join-Path $vault $dir) | Out-Null
  }
  New-Item -ItemType Directory -Force -Path (Join-Path $profile '.agents\skills') | Out-Null
  [pscustomobject]@{ Root=$root; Vault=$vault; Home=$profile; Script=$scriptPath }
}
function Invoke-FixtureSync($fixture) {
  $savedProfile = $env:USERPROFILE
  $savedExitCode = $global:LASTEXITCODE
  function git { $global:LASTEXITCODE = 0; 'true' }
  function node { $global:LASTEXITCODE = 0 }
  try {
    $env:USERPROFILE = $fixture.Home
    & $fixture.Script *>&1 | Out-Null
  } finally {
    $env:USERPROFILE = $savedProfile
    $global:LASTEXITCODE = $savedExitCode
  }
}
function Test-Case($name, [scriptblock]$body) {
  try { & $body; $script:Passed++; Write-Output "PASS $name" }
  catch { $script:Failed++; Write-Output "FAIL ${name}: $($_.Exception.Message)" }
}

# Retain fixtures for inspection. Never recursively delete or move a generated tree.
New-Item -ItemType Directory -Force -Path $RunRoot | Out-Null
Write-Output "Fixture run: $RunRoot"
Test-Case 'installs nested and flat leaf skills by name and excludes reference/archive source' {
  $f = New-Fixture 'nested'
  Write-FixtureFile (Join-Path $f.Vault 'skills\engineering\nested\SKILL.md') 'nested skill'
  Write-FixtureFile (Join-Path $f.Vault 'skills\engineering\nested\references\guide.md') 'nested support'
  Write-FixtureFile (Join-Path $f.Vault 'skills\productivity\other\SKILL.md') 'other skill'
  Write-FixtureFile (Join-Path $f.Vault 'skills\flat\SKILL.md') 'flat skill'
  Write-FixtureFile (Join-Path $f.Vault 'upstream\source\misc\reference\SKILL.md') 'reference only'
  Write-FixtureFile (Join-Path $f.Vault 'archive\old\SKILL.md') 'archived only'
  Invoke-FixtureSync $f
  foreach ($name in @('nested', 'other', 'flat')) {
    $copy = Join-Path $f.Home ".claude\skills\$name\SKILL.md"
    Assert-True (Test-Path -LiteralPath $copy -PathType Leaf) "Missing named skill $name"
    $link = Get-Item -LiteralPath (Join-Path $f.Home ".agents\skills\$name") -Force
    Assert-True ($link.LinkType -eq 'Junction') "No Codex junction for $name"
    Assert-True (Test-Path -LiteralPath (Join-Path $link.FullName 'SKILL.md') -PathType Leaf) "Wrong junction root for $name"
  }
  Assert-True ([IO.File]::ReadAllText((Join-Path $f.Home '.claude\skills\nested\references\guide.md')) -ceq 'nested support') 'Support file was not copied'
  foreach ($name in @('engineering', 'productivity', 'reference', 'old')) {
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $f.Home ".claude\skills\$name"))) "Installed non-skill $name"
  }
}
Test-Case 'rejects duplicate names before copying any skill' {
  $f = New-Fixture 'duplicates'
  Write-FixtureFile (Join-Path $f.Vault 'skills\engineering\demo\SKILL.md') 'engineering copy'
  Write-FixtureFile (Join-Path $f.Vault 'skills\productivity\demo\SKILL.md') 'productivity copy'
  $message = $null
  try { Invoke-FixtureSync $f } catch { $message = $_.Exception.Message }
  Assert-True ($message -like 'Duplicate skill name in catalogue: demo') 'Missing duplicate catalogue failure'
  Assert-True (-not (Test-Path -LiteralPath (Join-Path $f.Home '.claude\skills'))) 'Destination changed before duplicate failure'
}
Test-Case 'rejects a linked category before reading or installing its target' {
  $f = New-Fixture 'linked-source'
  $target = Join-Path $f.Root 'outside catalogue'
  Write-FixtureFile (Join-Path $target 'demo\SKILL.md') 'linked skill'
  New-Item -ItemType Junction -Path (Join-Path $f.Vault 'skills\engineering') -Target $target | Out-Null
  $message = $null
  try { Invoke-FixtureSync $f } catch { $message = $_.Exception.Message }
  Assert-True ($message -like 'Skill source directory must not be a link:*') 'Missing linked-source failure'
  Assert-True (-not (Test-Path -LiteralPath (Join-Path $f.Home '.claude\skills'))) 'Linked source was installed'
  Assert-True ([IO.File]::ReadAllText((Join-Path $target 'demo\SKILL.md')) -ceq 'linked skill') 'Linked source target changed'
}
Write-Output "Results: $Passed passed, $Failed failed"
if ($Failed -gt 0) { exit 1 }
exit 0
