# 停止本项目所有 next dev 进程并释放端口
#
# 为什么需要：旧的 next dev 进程不退出会让新实例换到 3001/3002，
# 于是自动化测试打到的是旧代码，结论完全不可信（踩过好几次）。
#
# 用法：powershell -NoProfile -ExecutionPolicy Bypass -File .\stop-dev.ps1
# （这台机器没有 pwsh，只有 Windows PowerShell 5.1，所以用 powershell 调用）
$ports = @(3000, 3001, 3002, 3003)

# 1) 先结束所有指向本项目的 node 进程（按命令行匹配，避免误杀其它 node）
$procs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -and $_.CommandLine -match 'AotuEnglish' -and $_.CommandLine -match 'next' }

foreach ($p in $procs) {
  try {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
    Write-Output "stopped pid $($p.ProcessId)"
  } catch {
    Write-Output "failed pid $($p.ProcessId): $($_.Exception.Message)"
  }
}

# 2) 再兜底按端口清理
foreach ($port in $ports) {
  Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
    try {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop
      Write-Output "stopped pid $($_.OwningProcess) on port $port"
    } catch {
      Write-Output "failed port $port pid $($_.OwningProcess)"
    }
  }
}

Start-Sleep -Seconds 2

$still = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
if ($still) {
  Write-Output "STILL_BUSY"
  $still | Select-Object LocalPort, OwningProcess | Format-Table -AutoSize
} else {
  Write-Output "ALL_FREE"
}
