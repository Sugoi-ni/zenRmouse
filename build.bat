@echo off
echo ===================================
echo  ZenRmouse - Build ^& Install
echo ===================================

set "ROOT=%~dp0"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"

REM Auto-detect a JDK 17 (JDK 21+ causes Gradle "restricted method" errors)
set "JAVA_HOME="
if exist "%USERPROFILE%\jdk17\jdk-17.0.13+11" set "JAVA_HOME=%USERPROFILE%\jdk17\jdk-17.0.13+11"
if not defined JAVA_HOME if exist "C:\Program Files\Java\jdk-17*" for /d %%j in ("C:\Program Files\Java\jdk-17*") do set "JAVA_HOME=%%j"
if not defined JAVA_HOME echo [!] JDK 17 not found - trying system Java & echo     (if it fails, install JDK 17 or set JAVA_HOME manually)

echo [*] Building release APK (embedded bundle - no Metro needed)...
cd /d "%ROOT%mobile\android"
call gradlew.bat assembleRelease --no-daemon

if %errorlevel% neq 0 (
    echo [!] Build failed!
    pause
    exit /b 1
)

echo [*] Installing to phone...
if exist "%ADB%" (
    "%ADB%" install -r app\build\outputs\apk\release\app-release.apk
    echo [*] Restarting app...
    "%ADB%" shell am force-stop com.zenrmouse.app
    timeout /t 2 /nobreak >nul
    "%ADB%" shell am start -n com.zenrmouse.app/.MainActivity
) else (
    echo [!] ADB not found at %ADB%
)

echo ===================================
echo  Done! App works without USB/Metro.
echo ===================================
pause