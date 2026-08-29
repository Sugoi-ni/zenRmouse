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

REM Auto-detect WiFi IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "Wi-Fi"') do set "WIFI_LINE=%%a"
for /f "tokens=1" %%a in ('ipconfig ^| findstr /i "%WIFI_LINE%" -A 5 ^| findstr /i "IPv4"') do set "RAWIP=%%a"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "%WIFI_LINE%" -A 5 ^| findstr /i "IPv4"') do set "LAN_IP=%%a"
set "LAN_IP=%LAN_IP: =%"
echo [*] Detected WiFi IP: %LAN_IP%

REM Start server in background
echo [*] Starting server...
cd /d "%ROOT%server"
start /b node src/index.js
timeout /t 2 /nobreak >nul

REM Set ADB reverse (works for both USB and WiFi)
echo [*] Setting ADB reverse...
if exist "%ADB%" "%ADB%" reverse tcp:8081 tcp:8081 2>nul
if exist "%ADB%" "%ADB%" reverse tcp:8321 tcp:8321 2>nul

REM Open QR page
echo [*] Opening QR code page...
start http://localhost:8320

REM Set Metro to advertise LAN IP (USB-less support)
set "REACT_NATIVE_PACKAGER_HOSTNAME=%LAN_IP%"

REM Start Metro in this window (LAN mode - no USB needed)
echo [*] Starting Metro bundler...
cd /d "%ROOT%mobile"
npx expo start --dev-client --host lan

echo.
echo ===================================
echo  Done!
echo ===================================
pause
