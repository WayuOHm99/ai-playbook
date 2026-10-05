# Real sync/robocopy regression tests using synthetic vaults and homes only.
# Git and Node are stubbed: no global configuration or installed skills are touched.
$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ScratchParent = Join-Path $RepoRoot '.scratch\sync-tests'
$RunRoot = Join-Path $ScratchParent ('run-' + [Guid]::NewGuid().ToString('N'))
$SyncSource = Join-Path $PSScriptRoot 'sync.ps1'
$Passed = 0
$Failed = 0

function Assert-WithinRun($path) {
  $full = [IO.Path]::GetFullPath($path)
  $root = [IO.Path]::GetFullPath($RunRoot).TrimEnd('\') + '\'
  if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Fixture path outside generated run: $full"
  }
}

function Write-FixtureFile($path, $content) {
  Assert-WithinRun $path
  New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
  [IO.File]::WriteAllText($path, $content)
}

function Assert-True($condition, $message) {
  if (-not $condition) { throw $message }
}

function Assert-Content($path, $expected) {
  Assert-True (Test-Path -LiteralPath $path -PathType Leaf) "Missing file: $path"
  Assert-True ([IO.File]::ReadAllText($path) -ceq $expected) "Changed content: $path"
}

function New-Fixture($name) {
  $root = Join-Path $RunRoot $name
  $vault = Join-Path $root 'vault space'
  $profile = Join-Path $root ('home ' + [char]0x0E44)
  $source = Join-Path $vault 'skills\demo'
  $dest = Join-Path $profile '.claude\skills\demo'
  $scriptPath = Join-Path $vault 'scripts\sync.ps1'
  Write-FixtureFile $scriptPath ([IO.File]::ReadAllText($SyncSource))
  Write-FixtureFile (Join-Path $source 'SKILL.md') 'source version one'
  Write-FixtureFile (Join-Path $source 'references\guide.md') 'nested source'
  New-Item -ItemType Directory -Force -Path (Join-Path $source 'empty') | Out-Null
  Write-FixtureFile (Join-Path $vault 'agents\claude\demo.md') 'claude agent'
  Write-FixtureFile (Join-Path $vault 'agents\codex\demo.toml') 'codex agent'
  New-Item -ItemType Directory -Force -Path (Join-Path $profile '.agents\skills') | Out-Null
  [pscustomobject]@{ Root=$root; Vault=$vault; Home=$profile; Source=$source; Dest=$dest; Script=$scriptPath }
}

function Invoke-FixtureSync($fixture, $mockExitCode = $null) {
  Assert-WithinRun $fixture.Vault
  Assert-WithinRun $fixture.Home
  $savedProfile = $env:USERPROFILE
  $savedExitCode = $global:LASTEXITCODE
  # Functions in this scope are inherited by the child script, including its global-config calls.
  function git { $global:LASTEXITCODE = 0; 'true' }
  function node { $global:LASTEXITCODE = 0 }
  if ($null -ne $mockExitCode) {
    function robocopy { $global:LASTEXITCODE = $mockExitCode }
  }
  try {
    $env:USERPROFILE = $fixture.Home
    & $fixture.Script *>&1 | Out-Null
  } finally {
    $env:USERPROFILE = $savedProfile
    $global:LASTEXITCODE = $savedExitCode
  }
}

function Test-Case($name, [scriptblock]$body) {
  try {
    & $body
    $script:Passed++
    Write-Output "PASS $name"
  } catch {
    $script:Failed++
    Write-Output "FAIL ${name}: $($_.Exception.Message)"
  }
}

# Fixtures are retained for inspection; the suite never recursively deletes a directory.
New-Item -ItemType Directory -Force -Path $RunRoot | Out-Null
Write-Output "Fixture run: $RunRoot"

Test-Case 'fresh install copies nested/empty folders, agents and creates the Codex junction' {
  $f = New-Fixture 'fresh'
  Invoke-FixtureSync $f
  Assert-Content (Join-Path $f.Dest 'SKILL.md') 'source version one'
  Assert-Content (Join-Path $f.Dest 'references\guide.md') 'nested source'
  Assert-True (Test-Path -LiteralPath (Join-Path $f.Dest 'empty') -PathType Container) 'Empty source directory was not copied'
  Assert-Content (Join-Path $f.Home '.claude\agents\demo.md') 'claude agent'
  Assert-Content (Join-Path $f.Home '.codex\agents\demo.toml') 'codex agent'
  $link = Get-Item -LiteralPath (Join-Path $f.Home '.agents\skills\demo') -Force
  Assert-True ($link.LinkType -eq 'Junction') 'Codex skill is not a junction'
  Assert-Content (Join-Path $link.FullName 'SKILL.md') 'source version one'
}

Test-Case 'preserves destination-only files and nested/empty directories' {
  $f = New-Fixture 'extras'
  $note = Join-Path $f.Dest ('local-' + [char]0x0E44 + '.txt')
  Write-FixtureFile $note 'user note'
  Write-FixtureFile (Join-Path $f.Dest 'local folder\notes.md') 'nested user note'
  New-Item -ItemType Directory -Force -Path (Join-Path $f.Dest 'local empty') | Out-Null
  Invoke-FixtureSync $f
  Assert-Content $note 'user note'
  Assert-Content (Join-Path $f.Dest 'local folder\notes.md') 'nested user note'
  Assert-True (Test-Path -LiteralPath (Join-Path $f.Dest 'local empty') -PathType Container) 'Destination-only empty directory was deleted'
  Assert-Content (Join-Path $f.Dest 'SKILL.md') 'source version one'
}

Test-Case 'repeat sync updates same-name files but retains files removed upstream' {
  $f = New-Fixture 'repeat'
  $oldSource = Join-Path $f.Source 'retired.md'
  Write-FixtureFile $oldSource 'old upstream file'
  Invoke-FixtureSync $f
  Write-FixtureFile (Join-Path $f.Source 'SKILL.md') 'source version two with different length'
  Write-FixtureFile (Join-Path $f.Dest 'SKILL.md') 'local edit'
  Write-FixtureFile (Join-Path $f.Dest 'keep.txt') 'local file'
  Assert-WithinRun $oldSource
  Remove-Item -LiteralPath $oldSource
  Invoke-FixtureSync $f
  Assert-Content (Join-Path $f.Dest 'SKILL.md') 'source version two with different length'
  Assert-Content (Join-Path $f.Dest 'retired.md') 'old upstream file'
  Assert-Content (Join-Path $f.Dest 'keep.txt') 'local file'
  Assert-Content (Join-Path $f.Source 'SKILL.md') 'source version two with different length'
}

Test-Case 'replaces only a Claude destination junction and preserves its old target' {
  $f = New-Fixture 'junction'
  $target = Join-Path $f.Root 'old target'
  Write-FixtureFile (Join-Path $target 'SKILL.md') 'old target skill'
  Write-FixtureFile (Join-Path $target 'notes.md') 'old target note'
  Assert-WithinRun $f.Dest
  New-Item -ItemType Directory -Force -Path (Split-Path $f.Dest) | Out-Null
  New-Item -ItemType Junction -Path $f.Dest -Target $target | Out-Null
  Invoke-FixtureSync $f
  Assert-Content (Join-Path $target 'SKILL.md') 'old target skill'
  Assert-Content (Join-Path $target 'notes.md') 'old target note'
  Assert-Content (Join-Path $f.Dest 'SKILL.md') 'source version one'
  Assert-True (-not (Get-Item -LiteralPath $f.Dest -Force).LinkType) 'Claude destination is still a link'
}

foreach ($code in 0..7) {
  Test-Case "accepts non-failure robocopy exit code $code" {
    $f = New-Fixture "code-$code"
    Invoke-FixtureSync $f $code
    Assert-Content (Join-Path $f.Home '.claude\agents\demo.md') 'claude agent'
  }
}

foreach ($code in @(8, 16)) {
  Test-Case "stops on robocopy failure code $code" {
    $f = New-Fixture "code-$code"
    $message = $null
    try { Invoke-FixtureSync $f $code } catch { $message = $_.Exception.Message }
    Assert-True ($message -like "robocopy failed for * ($code)") "Missing failure for code $code"
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $f.Home '.claude\agents\demo.md'))) 'Sync continued after copy failure'
  }
}

Write-Output "Results: $Passed passed, $Failed failed"
if ($Failed -gt 0) { exit 1 }
exit 0
