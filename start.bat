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

REM Kill any previous server on ports 8320/8321
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8320 :8321" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
timeout /t 1 /nobreak >nul

REM Auto-detect WiFi IP using PowerShell (reliable)
for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object InterfaceAlias -match Wi-Fi | Select-Object -ExpandProperty IPAddress"') do set "LAN_IP=%%i"
if not defined LAN_IP (
    echo [!] WiFi IP not found! Make sure WiFi is connected.
    pause
    exit /b 1
)
echo [*] Detected WiFi IP: %LAN_IP%

REM Start server in background
echo [*] Starting server...
cd /d "%ROOT%server"
start /b node src/index.js
timeout /t 2 /nobreak >nul

REM Open QR page
echo [*] Opening QR code page...
start http://localhost:8320

echo.
echo ===================================
echo  Server started on %LAN_IP%:8321
echo  Open ZenRmouse app and enter:
echo  %LAN_IP%
echo ===================================
pause
