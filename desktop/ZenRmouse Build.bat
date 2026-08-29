@echo off
REM Find the zenRmouse repo and run build.bat
set "FOUND="

REM Check common locations
for %%d in (C D E F) do (
    if exist "%%d:\WiiCtl\build.bat" ( set "FOUND=%%d:\WiiCtl" & goto :run )
    if exist "%%d:\zenRmouse\build.bat" ( set "FOUND=%%d:\zenRmouse" & goto :run )
    if exist "%%d:\Projects\WiiCtl\build.bat" ( set "FOUND=%%d:\Projects\WiiCtl" & goto :run )
    if exist "%%d:\Projects\zenRmouse\build.bat" ( set "FOUND=%%d:\Projects\zenRmouse" & goto :run )
)

REM Search in user home directories
for /d %%u in (%USERPROFILE%\*) do (
    if exist "%%u\WiiCtl\build.bat" ( set "FOUND=%%u\WiiCtl" & goto :run )
    if exist "%%u\zenRmouse\build.bat" ( set "FOUND=%%u\zenRmouse" & goto :run )
)

REM Search on Desktop
if exist "%USERPROFILE%\Desktop\WiiCtl\build.bat" ( set "FOUND=%USERPROFILE%\Desktop\WiiCtl" & goto :run )
if exist "%USERPROFILE%\Desktop\zenRmouse\build.bat" ( set "FOUND=%USERPROFILE%\Desktop\zenRmouse" & goto :run )

REM Direct path fallback
if exist "%USERPROFILE%\WiiCtl\build.bat" ( set "FOUND=%USERPROFILE%\WiiCtl" & goto :run )
if exist "%USERPROFILE%\zenRmouse\build.bat" ( set "FOUND=%USERPROFILE%\zenRmouse" & goto :run )

echo [!] zenRmouse repo not found!
echo     Place the repo folder in your home directory or Desktop.
pause
exit /b 1

:run
echo Found at: %FOUND%
call "%FOUND%\build.bat"
