@echo off
title MIN-MAXXED Standalone Client Launcher
color 0B
echo ========================================================
echo       MIN-MAXXED: STANDALONE DESKTOP GAME CLIENT
echo ========================================================
echo.

:: 1. Ask user if they want to update the game to match the main branch
echo Do you want to check for and apply updates from the main branch?
set /p choice="Enter [Y] to update, or any other key to skip: "

if /i "%choice%"=="Y" (
    echo.
    echo [INFO] checking for updates from main branch...

    :: Check if git command exists
    where git >nul 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] Git is not installed or not in PATH! Skipping git update.
    ) else (
        echo [INFO] Running Git Pull...
        git fetch origin
        git pull origin main
        if %errorlevel% neq 0 (
            echo [WARNING] Git pull failed. Continuing with local files...
        ) else (
            echo [SUCCESS] Pulled latest changes from main branch!
        )
    )

    echo.
    echo [INFO] Checking dependencies (npm install)...
    call npm install

    echo.
    echo [INFO] Compiling game client (npm run build)...
    call npm run build
) else (
    echo.
    echo [INFO] Skipping updates. Preparing local game client...
)

:: 2. Check if game is built
if not exist "dist\index.html" (
    echo.
    echo [INFO] First-time build required...
    echo [INFO] Compiling game client (npm run build)...
    call npm run build
)

echo.
echo [INFO] Launching standalone desktop client...
call npm run electron:start

exit
