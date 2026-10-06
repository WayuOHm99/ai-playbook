#requires -Version 7.0
# Repository-only checks. Sync suites supply synthetic homes and stub Git/Node.
param([string]$Base = $env:CI_BASE_SHA)
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$RepoRoot = Split-Path $PSScriptRoot -Parent

function Invoke-Checked([string]$Program, [string[]]$Arguments) {
  & $Program @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Command failed ($LASTEXITCODE): $Program $($Arguments -join ' ')" }
}

Push-Location -LiteralPath $RepoRoot
try {
  if (-not $IsWindows) { throw 'These checks require Windows for robocopy and junction coverage.' }
  Invoke-Checked 'node' @('--version')
  Invoke-Checked 'git' @('--version')
  Invoke-Checked 'node' @('scripts/lint-skills.mjs', '--strict', '--repo-only')
  Invoke-Checked 'node' @('scripts/check-matt-snapshot.mjs')

  # Search only maintained test roots; ignored .scratch projects cannot join this suite.
  $TestFiles = @(Get-ChildItem -LiteralPath @('scripts', 'guardrails') -Recurse -File -Filter '*.test.mjs' |
    Sort-Object FullName | ForEach-Object { $_.FullName })
  if ($TestFiles.Count -eq 0) { throw 'No Node test files found.' }
  $TapLines = @(& node --test --test-reporter=tap @TestFiles 2>&1)
  $TestExit = $LASTEXITCODE
  $TapLines | Write-Output
  if ($TestExit -ne 0) { throw "Node tests failed ($TestExit)." }
  $Tap = $TapLines -join "`n"
  $Counts = @{}
  foreach ($Name in @('tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo')) {
    $MatchesForCount = [regex]::Matches($Tap, "(?m)^# $Name ([0-9]+)\r?$")
    if ($MatchesForCount.Count -ne 1) { throw "Missing or ambiguous Node test summary: $Name" }
    $Counts[$Name] = [int]$MatchesForCount[0].Groups[1].Value
  }
  if ($Counts.tests -le 0 -or $Counts.pass -ne $Counts.tests -or
      $Counts.fail -ne 0 -or $Counts.cancelled -ne 0 -or $Counts.skipped -ne 0 -or $Counts.todo -ne 0) {
    throw 'Node tests must all run and pass: skips, TODOs, cancellations and empty suites are not success.'
  }

  Invoke-Checked 'powershell.exe' @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/sync.test.ps1')
  Invoke-Checked 'powershell.exe' @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/sync-catalog.test.ps1')
  # Check pending edits locally and the committed event range on a clean runner.
  Invoke-Checked 'git' @('diff', '--check')
  Invoke-Checked 'git' @('diff', '--cached', '--check')
  if ($Base -and $Base -notmatch '^0+$') {
    if ($Base -notmatch '^[0-9a-fA-F]{40}$') { throw 'Whitespace-check base must be a full Git SHA.' }
    Invoke-Checked 'git' @('diff', '--check', $Base, 'HEAD', '--')
  } else {
    Invoke-Checked 'git' @('show', '--format=', '--check', 'HEAD', '--')
  }
  $Summary = "Repository checks PASS: $($Counts.pass)/$($Counts.tests) Node entries, zero skips; both synthetic Windows sync suites passed."
  Write-Output $Summary
  if ($env:GITHUB_STEP_SUMMARY) { Add-Content -LiteralPath $env:GITHUB_STEP_SUMMARY -Value $Summary }
} finally {
  Pop-Location
}
