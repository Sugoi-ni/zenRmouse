@echo off
title ZenRmouse Setup
color 0D
cls
echo ===================================
echo  ZenRmouse - First Time Setup
echo ===================================

set "ROOT=%~dp0"

echo [*] Creating desktop shortcuts...
copy /y "%ROOT%desktop\ZenRmouse Start.bat" "%USERPROFILE%\Desktop\ZenRmouse Start.bat" >nul 2>&1
copy /y "%ROOT%desktop\ZenRmouse Build.bat" "%USERPROFILE%\Desktop\ZenRmouse Build.bat" >nul 2>&1

echo [*] Setting up auto-start...
copy /y "%ROOT%setup\ZenRmouse.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ZenRmouse.vbs" >nul 2>&1

echo [*] Installing server dependencies...
cd /d "%ROOT%server"
call npm install

echo.
echo ===================================
echo  Setup complete!
echo ===================================
echo.
echo  Desktop shortcuts created:
echo    - ZenRmouse Start.bat
echo    - ZenRmouse Build.bat
echo.
echo  Auto-start enabled (server runs on boot)
echo.
echo  To start now, run: start.bat
echo ===================================
pause
