---
name: windows-launch-automation
description: >
  Guidelines, templates, and procedures for creating, maintaining, and executing
  automated Windows batch scripts (`launch.bat`) for zero-configuration local
  startup, dependency installation, environment setup, and browser auto-launch.
---

# Windows Launch Script Automation Skill (`launch.bat`)

This skill defines the enterprise standard for creating and maintaining standalone Windows batch launcher scripts (`launch.bat`) for Node.js / React / TypeScript web applications.

## Purpose & Scope
When users download, clone, or air-gap an application to run on Windows machines without manual terminal configuration, `launch.bat` provides a single-click initialization workflow that:
1. Validates the host runtime environment (`node`, `npm`, PATH variables).
2. Automates configuration bootstrapping (`.env.example` -> `.env`).
3. Manages dependency lifecycles (`npm install` when `node_modules` is missing).
4. Launches the local development server (port 3000) and automatically opens the user's default browser.

---

## Canonical Script Structure (`launch.bat`)

```bat
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
echo   STARTING QUANTRISKSCALE DEVELOPMENT SERVER (PORT 3000)
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
```

---

## Best Practices & Guidelines

### 1. Robust Path and Binary Detection
- Always use `where <command> >nul 2>nul` to check for CLI utilities in Windows.
- Provide explicit remediation URLs (`https://nodejs.org/`) and `pause` on errors so the console window does not close immediately before the user can read the error message.

### 2. Environment Variables & Safety
- Check for `.env` existence before creating one; never overwrite an existing `.env` file that may contain user credentials or custom keys.
- Fallback gracefully to generating a default `.env` if `.env.example` is missing.

### 3. Non-Blocking Browser Launch
- Use `start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"` to asynchronously delay browser launch until Vite/Express finishes binding to port 3000.

### 4. Port Conflict Handling
- If port 3000 is occupied, users can configure `PORT` or modify `server.ts`.
