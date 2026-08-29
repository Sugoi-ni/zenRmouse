@echo off
echo ===================================
echo  ZenRmouse - Build ^& Install
echo ===================================

set "ROOT=%~dp0"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"

REM Clear invalid JAVA_HOME - let Gradle find Java itself
set "JAVA_HOME="

echo [*] Building APK...
cd /d "%ROOT%mobile\android"
call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo [!] Build failed!
    pause
    exit /b 1
)

echo [*] Installing to phone...
if exist "%ADB%" (
    "%ADB%" install -r app\build\outputs\apk\debug\app-debug.apk
    echo [*] Setting ADB reverse...
    "%ADB%" reverse tcp:8081 tcp:8081
    echo [*] Restarting app...
    "%ADB%" shell am force-stop com.zenrmouse.app
    timeout /t 2 /nobreak >nul
    "%ADB%" shell am start -n com.zenrmouse.app/.MainActivity
) else (
    echo [!] ADB not found at %ADB%
)

echo ===================================
echo  Done!
echo ===================================
pause
