@echo off
REM Find the zenRmouse repo and run start.bat
set "FOUND="

REM Check common locations
for %%d in (C D E F) do (
    if exist "%%d:\WiiCtl\start.bat" ( set "FOUND=%%d:\WiiCtl" & goto :run )
    if exist "%%d:\zenRmouse\start.bat" ( set "FOUND=%%d:\zenRmouse" & goto :run )
    if exist "%%d:\Projects\WiiCtl\start.bat" ( set "FOUND=%%d:\Projects\WiiCtl" & goto :run )
    if exist "%%d:\Projects\zenRmouse\start.bat" ( set "FOUND=%%d:\Projects\zenRmouse" & goto :run )
)

REM Search in user directories
for /d %%u in (%USERPROFILE%\*) do (
    if exist "%%u\WiiCtl\start.bat" ( set "FOUND=%%u\WiiCtl" & goto :run )
    if exist "%%u\zenRmouse\start.bat" ( set "FOUND=%%u\zenRmouse" & goto :run )
    if exist "%%u\Desktop\WiiCtl\start.bat" ( set "FOUND=%%u\Desktop\WiiCtl" & goto :run )
    if exist "%%u\Desktop\zenRmouse\start.bat" ( set "FOUND=%%u\Desktop\zenRmouse" & goto :run )
)

echo [!] zenRmouse repo not found!
echo     Place the repo folder in your home directory or Desktop.
pause
exit /b 1

:run
echo Found at: %FOUND%
call "%FOUND%\start.bat"
