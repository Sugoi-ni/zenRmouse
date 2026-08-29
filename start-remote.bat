@echo off
echo ===================================
echo  ZenRmouse - Remote Access Setup
echo ===================================

REM Check if Tailscale is installed
where tailscale >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Tailscale not found! Opening download page...
    start https://tailscale.com/download
    echo.
    echo ===================================
    echo  1. Download and install Tailscale
    echo  2. Login with Google/Microsoft/GitHub
    echo  3. Run this script again
    echo ===================================
    pause
    exit /b 1
)

REM Get Tailscale IP
echo [*] Getting Tailscale IP...
for /f "tokens=*" %%i in ('tailscale ip -4') do set TAILSCALE_IP=%%i

echo ===================================
echo  Tailscale is ready!
echo ===================================
echo  Your Tailscale IP: %TAILSCALE_IP%
echo.
echo  Now install Tailscale on your phone:
echo  1. Download: https://tailscale.com/download
echo  2. Login with same account
echo  3. Connect
echo.
echo  Then the app will work from anywhere!
echo ===================================

REM Update server to use Tailscale IP
echo [*] Starting server with Tailscale IP...
cd /d C:\Users\Arif\WiiCtl\server
set WS_HOST=%TAILSCALE_IP%
start "Server" cmd /k "set WS_HOST=%TAILSCALE_IP% && node src/index.js"

REM Start Metro
echo [*] Starting Metro bundler...
cd /d C:\Users\Arif\WiiCtl\mobile
start "Metro" cmd /k "npx expo start --dev-client"

REM Wait and set ADB
timeout /t 15 /nobreak >nul
C:\Users\Arif\AppData\Local\Android\Sdk\platform-tools\adb.exe reverse tcp:8081 tcp:8081

REM Open QR page
start http://%TAILSCALE_IP%:8320

echo ===================================
echo  Server IP: %TAILSCALE_IP%:8321
echo  QR Page: http://%TAILSCALE_IP%:8320
echo ===================================
pause
