# Stop all dev/start servers for this project and free the ports.
#
# Why: a stale server keeps port 3000 occupied, so a new instance starts on
# 3001/3002 and automated tests silently hit the OLD code. That has caused
# wrong conclusions more than once.
#
# Also: `next dev` spawns a child server (start-server.js). Killing only the
# child leaves the parent alive, and the parent immediately restarts it.
# So we kill the whole process tree by parent, not just the port owner.
#
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\stop-dev.ps1
# Note: this machine has no pwsh, only Windows PowerShell 5.1.
# Keep this file ASCII-only: PS 5.1 reads scripts as ANSI, and non-ASCII
# characters in comments have broken the parser before.

$ports = @(3000, 3001, 3002, 3003)
$targets = @()

# 1) Any node process of this repo running next dev / next start / start-server
$all = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue
foreach ($p in $all) {
  $cmd = [string]$p.CommandLine
  if ($cmd -match 'AotuEnglish' -and $cmd -match 'next') {
    if ($targets -notcontains $p.ProcessId) { $targets += $p.ProcessId }
  }
}

# 2) Whatever currently listens on our ports (and its parent)
foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $procId = $c.OwningProcess
    if ($procId -and ($targets -notcontains $procId)) {
      $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $procId" -ErrorAction SilentlyContinue
      $cmd = ''
      if ($proc) { $cmd = [string]$proc.CommandLine }
      if ($cmd -match 'node') {
        $targets += $procId
        if ($proc -and $proc.ParentProcessId -and ($targets -notcontains $proc.ParentProcessId)) {
          $targets += $proc.ParentProcessId
        }
      }
    }
  }
}

if ($targets.Count -eq 0) {
  Write-Output 'no node servers found'
} else {
  # NOTE: do not name a loop variable $id (reserved/automatic in PowerShell).
  foreach ($pidToKill in $targets) {
    try {
      Stop-Process -Id $pidToKill -Force -ErrorAction Stop
      Write-Output "stopped pid $pidToKill"
    } catch {
      Write-Output "FAILED pid $pidToKill : $($_.Exception.Message)"
    }
  }
}

Start-Sleep -Seconds 2

$still = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
if ($still) {
  Write-Output 'STILL_BUSY'
  $still | Select-Object LocalPort, OwningProcess | Format-Table -AutoSize | Out-String
  exit 1
}

Write-Output 'ALL_FREE'
exit 0
