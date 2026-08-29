@echo off
echo ===================================
echo  ZenRmouse - Build ^& Install
echo ===================================

REM Auto-detect paths relative to this script
set "ROOT=%~dp0"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"

REM Auto-detect JAVA_HOME
if not defined JAVA_HOME (
    REM Try to find javac.exe (real JDK, not just JRE symlink)
    for /f "tokens=*" %%i in ('where javac 2^>nul') do (
        set "JAVA_HOME=%%~dpi.."
        goto :java_found
    )
    REM Check common JDK locations
    for %%v in ("17" "21" "22" "23") do (
        for %%d in ("%USERPROFILE%\jdk%%~v\*" "C:\Program Files\Java\jdk-%%~v*" "C:\Program Files\Eclipse Adoptium\*") do (
            for /d %%j in (%%d) do (
                if exist "%%j\bin\javac.exe" ( set "JAVA_HOME=%%j" & goto :java_found )
            )
        )
    )
    echo [!] JAVA_HOME not found!
    echo     Install JDK 17 and set JAVA_HOME or add javac to PATH.
    pause
    exit /b 1
)
:java_found

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
    echo     Install Android SDK or set ANDROID_HOME.
)

echo ===================================
echo  Done! App is running on phone.
echo ===================================
pause
