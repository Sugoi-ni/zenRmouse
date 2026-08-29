@echo off
echo ===================================
echo  ZenRmouse - Build ^& Install
echo ===================================

set ANDROID_HOME=C:\Users\Arif\AppData\Local\Android\Sdk
set JAVA_HOME=C:\Users\Arif\jdk17\jdk-17.0.13+11

echo [*] Building APK...
cd /d C:\Users\Arif\WiiCtl\mobile\android
call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo [!] Build failed!
    pause
    exit /b 1
)

echo [*] Installing to phone...
%ANDROID_HOME%\platform-tools\adb.exe install -r app\build\outputs\apk\debug\app-debug.apk

echo [*] Setting ADB reverse...
%ANDROID_HOME%\platform-tools\adb.exe reverse tcp:8081 tcp:8081

echo [*] Restarting app...
%ANDROID_HOME%\platform-tools\adb.exe shell am force-stop com.zenrmouse.app
timeout /t 2 /nobreak >nul
%ANDROID_HOME%\platform-tools\adb.exe shell am start -n com.zenrmouse.app/.MainActivity

echo ===================================
echo  Done! App is running on phone.
echo ===================================
pause
