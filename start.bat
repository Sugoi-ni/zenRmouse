@echo off
echo ===================================
echo  ZenRmouse - Start All
echo ===================================

set ANDROID_HOME=C:\Users\Arif\AppData\Local\Android\Sdk

REM 1. Start Node.js server
echo [*] Starting server...
cd /d C:\Users\Arif\WiiCtl\server
start "Server" cmd /k "node src/index.js"

REM 2. Start Metro bundler
echo [*] Starting Metro bundler...
cd /d C:\Users\Arif\WiiCtl\mobile
start "Metro" cmd /k "npx expo start --dev-client"

REM 3. Wait for Metro to be ready
echo [*] Waiting for Metro to start (15 seconds)...
timeout /t 15 /nobreak >nul

REM 4. Set ADB reverse
echo [*] Setting ADB reverse...
%ANDROID_HOME%\platform-tools\adb.exe reverse tcp:8081 tcp:8081

REM 5. Open QR page in browser
echo [*] Opening QR code page...
start http://localhost:8320

echo ===================================
echo  Server:  ws://YOUR_IP:8321
echo  QR Code: http://YOUR_IP:8320
echo  Metro:   Running
echo  ADB:     Reverse set
echo ===================================
echo  Open ZenRmouse on your phone!
echo ===================================
pause
