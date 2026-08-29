@echo off
title ZenRmouse
echo ===================================
echo  ZenRmouse - Starting...
echo ===================================

set ANDROID_HOME=C:\Users\Arif\AppData\Local\Android\Sdk

REM Start server in background
echo [*] Starting server...
cd /d C:\Users\Arif\WiiCtl\server
start /b cmd /c "node src/index.js > nul 2>&1"

REM Start Metro
echo [*] Starting Metro bundler...
cd /d C:\Users\Arif\WiiCtl\mobile
call npx expo start --dev-client

REM After Metro stops, set ADB reverse
echo.
echo [*] Setting ADB reverse...
%ANDROID_HOME%\platform-tools\adb.exe reverse tcp:8081 tcp:8081

REM Open QR page
echo [*] Opening QR code page...
start http://localhost:8320

echo.
echo ===================================
echo  Done! App is running on phone.
echo ===================================
pause
