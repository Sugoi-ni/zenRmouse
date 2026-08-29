@echo off
title ZenRmouse
color 0D
cls
echo ===================================
echo  ZenRmouse - Starting...
echo ===================================

set ANDROID_HOME=C:\Users\Arif\AppData\Local\Android\Sdk

REM Start server silently
echo [*] Starting server...
cd /d C:\Users\Arif\WiiCtl\server
start "" /min node src/index.js

REM Wait for server
timeout /t 3 /nobreak >nul

REM Start Metro in this window
echo [*] Starting Metro bundler...
cd /d C:\Users\Arif\WiiCtl\mobile
npx expo start --dev-client

REM When Metro exits, do cleanup
echo.
echo [*] Setting ADB reverse...
%ANDROID_HOME%\platform-tools\adb.exe reverse tcp:8081 tcp:8081

echo [*] Opening QR code page...
start http://localhost:8320

echo.
echo ===================================
echo  Done!
echo ===================================
pause
