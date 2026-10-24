@echo off
chcp 65001 >nul
setlocal

title AotuEnglish 开发服务器

cd /d "F:\AotuEnglish\web"

echo ============================================
echo   AotuEnglish 开发服务器
echo ============================================
echo.

rem ---- 检查端口 3000 是否已被占用 ----
netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul 2>nul
if %errorlevel%==0 (
    echo [提示] 端口 3000 已被占用，可能服务器已经在运行。
    echo        直接打开 http://localhost:3000 看看。
    echo.
    echo        如果想重启，先关掉占用端口的那个窗口。
    echo.
    pause
    start "" http://localhost:3000
    exit /b 0
)

echo [1/2] 启动中，首次编译约需 15 秒...
echo.

rem ---- 3 秒后自动打开浏览器 ----
start "" cmd /c "timeout /t 12 /nobreak >nul && start http://localhost:3000"

echo [2/2] 浏览器将在编译完成后自动打开
echo.
echo   地址: http://localhost:3000
echo   登录: 任意邮箱 + 8 位以上密码（如 mia@example.com / password123）
echo.
echo   关闭服务器: 按 Ctrl+C，或直接关掉这个窗口
echo ============================================
echo.

call npm run dev

rem 服务器退出后停留，避免窗口一闪而过看不到报错
echo.
echo 服务器已停止。按任意键关闭窗口。
pause >nul
