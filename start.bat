@echo off
title ZenRmouse
color 0D
cls
echo ===================================
echo  ZenRmouse - Starting...
echo ===================================

set ANDROID_HOME=C:\Users\Arif\AppData\Local\Android\Sdk
set WS_PID=

REM Start server
echo [*] Starting server...
cd /d C:\Users\Arif\WiiCtl\server
start "" /B node src/index.js
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo list ^| findstr PID') do set WS_PID=%%a

REM Start Metro
echo [*] Starting Metro bundler...
cd /d C:\Users\Arif\WiiCtl\mobile
npx expo start --dev-client

REM When Metro stops, cleanup
echo.
echo [*] Stopping server...
if defined WS_PID taskkill /PID %WS_PID% /F >nul 2>&1

echo [*] Setting ADB reverse...
%ANDROID_HOME%\platform-tools\adb.exe reverse tcp:8081 tcp:8081

echo [*] Opening QR code page...
start http://localhost:8320

echo.
echo ===================================
echo  Done! App is running on phone.
echo ===================================
pause
