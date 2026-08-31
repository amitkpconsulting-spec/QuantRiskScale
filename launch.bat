@echo off
setlocal enabledelayedexpansion
title QUANTRISKSCALE - Open FAIR Risk Quantitative Analysis Suite

:: ============================================================================
:: QUANTRISKSCALE - Automatic Windows Setup & Launch Script
:: ============================================================================

echo.
echo ============================================================================
echo   QUANTRISKSCALE - QUANTITATIVE RISK ANALYSIS SUITE
echo   Air-Gapped & Local-First Monte Carlo Risk Modeler
echo ============================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js 18+ from https://nodejs.org/ and rerun this script.
    echo.
    pause
    exit /b 1
)

:: 2. Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not found in system PATH.
    echo Please check your Node.js installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo [OK] Node.js !NODE_VERSION! detected.
echo [OK] npm v!NPM_VERSION! detected.
echo.

:: 3. Setup .env file if missing
if not exist ".env" (
    echo [*] .env file not found. Initializing from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Created .env from template.
    ) else (
        echo # Open FAIR Risk Analyzer Environment > .env
        echo GEMINI_API_KEY=MY_GEMINI_API_KEY>> .env
        echo APP_URL=http://localhost:3000>> .env
        echo [OK] Created default .env configuration.
    )
) else (
    echo [OK] .env configuration detected.
)

:: 4. Verify & install npm dependencies
if not exist "node_modules" (
    echo.
    echo [*] node_modules not found. Installing project dependencies...
    echo     (This may take a minute on first run)
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install npm dependencies. Please check internet connection.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
) else (
    echo [OK] node_modules already present.
)

echo.
echo ============================================================================
echo   STARTING OPEN FAIR DEVELOPMENT SERVER (PORT 3000)
echo ============================================================================
echo.
echo [*] Launching local dev server...
echo [*] Opening application in your default web browser (http://localhost:3000)...
echo [*] Press Ctrl+C in this terminal window to stop the server at any time.
echo.

:: Launch browser in background after short delay
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Start the dev server
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Dev server stopped or encountered an error.
    pause
)
