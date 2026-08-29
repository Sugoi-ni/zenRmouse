@echo off
echo ===================================
echo  ZenRmouse - Mobile Data Mode
echo ===================================

set ANDROID_HOME=C:\Users\Arif\AppData\Local\Android\Sdk

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] ngrok not found! Download from https://ngrok.com/download
    echo [*] Or run: choco install ngrok
    pause
    exit /b 1
)

REM 1. Start Node.js server with external URL support
echo [*] Starting server...
cd /d C:\Users\Arif\WiiCtl\server
start "Server" cmd /k "set EXTERNAL_WS=tcp://0.tcp.ngrok.io:14368 && node src/index.js"

REM 2. Start ngrok for WebSocket
echo [*] Starting ngrok TCP tunnel for WebSocket...
cd /d C:\Users\Arif\WiiCtl
start "Ngrok-WS" cmd /k "ngrok tcp 8321 --log=stdout"

REM 3. Wait for ngrok to be ready
echo [*] Waiting for ngrok to start (10 seconds)...
timeout /t 10 /nobreak >nul

REM 4. Get ngrok URL and restart server with it
echo [*] Getting ngrok URL...
for /f "tokens=*" %%i in ('powershell -Command "((Invoke-WebRequest -Uri 'http://localhost:4040/api/tunnels' -UseBasicParsing).Content | ConvertFrom-Json).tunnels[0].public_url"') do set NGROK_URL=%%i
echo [*] ngrok URL: %NGROK_URL%

REM 5. Restart server with ngrok URL
echo [*] Restarting server with ngrok URL...
taskkill /FI "WINDOWTITLE eq Server*" /F >nul 2>&1
cd /d C:\Users\Arif\WiiCtl\server
set EXTERNAL_WS=%NGROK_URL%
start "Server" cmd /k "set EXTERNAL_WS=%NGROK_URL% && node src/index.js"

REM 6. Open QR page
echo [*] Opening QR code page...
timeout /t 3 /nobreak >nul
start http://localhost:8320

echo ===================================
echo  MOBILE DATA MODE ACTIVE!
echo ===================================
echo  ngrok WebSocket: %NGROK_URL%
echo  QR Page: http://localhost:8320
echo ===================================
echo  1. Open phone app
echo  2. Scan QR code
echo  3. Connect!
echo ===================================
pause
