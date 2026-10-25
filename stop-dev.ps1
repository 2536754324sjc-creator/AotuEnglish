# 停止本项目所有 next dev 进程并释放端口
# 用法：.\stop-dev.ps1
$ports = @(3000, 3001, 3002, 3003)
$killed = @()

foreach ($p in $ports) {
  $conns = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $procId = $c.OwningProcess
    if ($procId -and $killed -notcontains $procId) {
      try {
        Stop-Process -Id $procId -Force -ErrorAction Stop
        $killed += $procId
        Write-Host "已停止 PID $procId (端口 $p)"
      } catch {
        Write-Host "无法停止 PID $procId：$($_.Exception.Message)"
      }
    }
  }
}

Start-Sleep -Seconds 2

$still = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
if ($still) {
  Write-Host "仍有端口被占用："
  $still | Select-Object LocalPort, OwningProcess | Format-Table -AutoSize
} else {
  Write-Host "所有端口已释放"
}
