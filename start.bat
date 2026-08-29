@echo off
title ZenRmouse
color 0D
cls
echo ===================================
echo  ZenRmouse - Starting...
echo ===================================

REM Auto-detect paths relative to this script
set "ROOT=%~dp0"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"

REM Start server silently
echo [*] Starting server...
cd /d "%ROOT%server"
start "" /min node src/index.js

REM Wait for server to start
timeout /t 3 /nobreak >nul

REM Open QR page immediately
echo [*] Opening QR code page...
start http://localhost:8320

REM Start Metro in this window
echo [*] Starting Metro bundler...
cd /d "%ROOT%mobile"
npx expo start --dev-client

REM When Metro exits, set ADB reverse
echo.
echo [*] Setting ADB reverse...
if exist "%ADB%" "%ADB%" reverse tcp:8081 tcp:8081

echo.
echo ===================================
echo  Done!
echo ===================================
pause
