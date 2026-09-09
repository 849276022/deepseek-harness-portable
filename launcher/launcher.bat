@echo off
chcp 65001 >nul
title DeepSeek Harness Portable

cd /d "%~dp0"

set "NODE_EXE=%~dp0node\node.exe"
set "NPM_EXE=%~dp0node\npm.cmd"
set "PATH=%~dp0node;%PATH%"
set "DSH_HOME=%~dp0data\.dsh"
set "DSH_AGENTS_HOME=%~dp0data\.agents"
set "QQ_ENV=%~dp0data\qqbot.env"

if not exist "%NODE_EXE%" (
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
    echo [First Run] Installing pnpm...
    "%NPM_EXE%" install -g pnpm
    if errorlevel 1 (
        echo [ERROR] Failed to install pnpm!
        pause
        exit /b 1
    )
)

if not exist "src\node_modules" (
    echo [First Run] Installing dependencies, this takes a few minutes...
    cd src
    pnpm install --shamefully-hoist --frozen-lockfile
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Dependencies installed
)

:MENU
cls
echo ========================================
echo   DeepSeek Harness Portable
echo ========================================
echo.
echo   [1] Web UI          - browser at 127.0.0.1:3000
echo   [2] QQ Bot          - chat with the agent on QQ
echo   [3] Set QQ creds    - enter AppID / AppSecret
echo   [4] Web UI + QQ Bot - run both at once
echo   [0] Exit
echo.
set "CHOICE="
set /p "CHOICE=Select [1]: "
if "%CHOICE%"=="" set "CHOICE=1"

if "%CHOICE%"=="1" goto WEB
if "%CHOICE%"=="2" goto QQBOT
if "%CHOICE%"=="3" goto SETCRED
if "%CHOICE%"=="4" goto BOTH
if "%CHOICE%"=="0" exit /b 0
echo Invalid choice.
timeout /t 2 >nul
goto MENU

:WEB
echo.
echo   Look for the "dsh web: http://...?token=..." line below and open it.
echo   The browser opens automatically; that URL carries the login token.
echo   Press Ctrl+C to stop
echo.
cd src
"%NODE_EXE%" apps\cli\lib\bin.js web --port 3000
cd ..
pause
goto MENU

:SETCRED
echo.
echo ========================================
echo   QQ Bot credentials
echo ========================================
echo.
echo Get them at https://q.qq.com  ^(Bot -^> Development -^> Settings^)
echo.
set "IN_APPID="
set "IN_SECRET="
set /p "IN_APPID=AppID: "
set /p "IN_SECRET=AppSecret: "
if "%IN_APPID%"=="" (
    echo [ERROR] AppID cannot be empty.
    pause
    goto MENU
)
if "%IN_SECRET%"=="" (
    echo [ERROR] AppSecret cannot be empty.
    pause
    goto MENU
)
if not exist "%~dp0data" mkdir "%~dp0data"
> "%QQ_ENV%" echo QQBOT_APPID=%IN_APPID%
>> "%QQ_ENV%" echo QQBOT_SECRET=%IN_SECRET%
echo.
echo [OK] Saved to data\qqbot.env
pause
goto MENU

:QQBOT
set "ALSO_WEB="
goto QQ_PREP

:BOTH
set "ALSO_WEB=1"
goto QQ_PREP

:QQ_PREP
echo.
if not exist "%QQ_ENV%" (
    echo [!] QQ credentials not set yet.
    echo.
    set "GO="
    set /p "GO=Set them now? [Y/n]: "
    if /i not "%GO%"=="n" goto SETCRED
    goto MENU
)

REM Load credentials from data\qqbot.env
for /f "usebackq tokens=1,* delims==" %%A in ("%QQ_ENV%") do (
    if /i "%%A"=="QQBOT_APPID" set "QQBOT_APPID=%%B"
    if /i "%%A"=="QQBOT_SECRET" set "QQBOT_SECRET=%%B"
)

if "%QQBOT_APPID%"=="" (
    echo [ERROR] data\qqbot.env is malformed. Re-enter credentials.
    pause
    goto SETCRED
)

REM Install the official Tencent QQ Bot plugin on first use.
REM install-qqbot.mjs is pure Node + bundled pnpm: it never relies on a
REM system pnpm and never pre-writes an empty "dependencies" object
REM (pnpm would report "Already up to date" and install nothing).
if not exist "%~dp0data\.dsh\profiles\qqbot\node_modules\@tencent-connect\dsh-qqbot\package.json" (
    echo [First Run] Installing official QQ Bot plugin...
    "%NODE_EXE%" "%~dp0scripts\install-qqbot.mjs" "%~dp0."
    if errorlevel 1 (
        echo [ERROR] QQ Bot plugin install failed.
        pause
        goto MENU
    )
)

REM Option [4]: start the Web UI in its own window first, then fall through
REM to the QQ Bot in this window. Two separate dsh processes are required --
REM one process serves one profile.
if defined ALSO_WEB (
    echo [*] Starting Web UI in a separate window...
    start "DSH Web UI" /D "%~dp0src" "%NODE_EXE%" apps\cli\lib\bin.js web --port 3000
    echo     Its window prints the http://...?token=... login URL.
    echo.
    timeout /t 3 >nul
)

echo ========================================
echo   QQ Bot running - AppID: %QQBOT_APPID%
echo ========================================
echo.
echo   Mention the bot in a group, or DM it directly.
echo   A model API key must be set in the Web UI first.
echo   Press Ctrl+C to stop.
echo.
cd src
"%NODE_EXE%" apps\cli\lib\bin.js --profile qqbot
cd ..
pause
goto MENU
