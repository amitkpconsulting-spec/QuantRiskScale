# QUANTRISKSCALE - Local Launch Guide & Best Practice Prompts

This document provides recommended operational steps, system requirements, troubleshooting commands, and ready-to-use guidance prompts for running `launch.bat`.

---

## 1. Quick Start Guide (Windows)

To launch **QUANTRISKSCALE** on any Windows workstation:

1. **Extract/Clone** the repository to your local drive (e.g., `C:\Projects\quantriskscale`).
2. **Double-click** `launch.bat` (or execute `launch.bat` inside PowerShell/Command Prompt).
3. The script will automatically:
   - Check for **Node.js** (v18+ recommended) and **npm**.
   - Create your local `.env` configuration file from `.env.example` if it doesn't already exist.
   - Run `npm install` if `node_modules` is not yet installed.
   - Launch the local full-stack server on `http://localhost:3000`.
   - Open your default web browser automatically to the dashboard.

---

## 2. Pre-Requisites Checklist

Before running `launch.bat`, ensure:
- [x] **Operating System:** Windows 10 / Windows 11 / Windows Server 2019+
- [x] **Node.js Runtime:** Node.js version 18.0.0 or higher installed from [nodejs.org](https://nodejs.org/).
- [x] **Network / Firewall:** Local port `3000` available for the internal server.

---

## 3. Best Practice Prompt Templates

Use these copy-paste prompt templates when asking an AI assistant or technical operator to customize, debug, or extend the launch script:

### Prompt A: Verification & Health Check
```markdown
Please inspect the local QUANTRISKSCALE environment:
1. Verify that `launch.bat` adheres to zero-configuration best practices (Node check, .env initialization, npm install check, and background browser launch).
2. Check that the port in `server.ts` matches the launch script port (3000).
3. Ensure no hardcoded secret keys are committed in `.env.example` or `launch.bat`.
```

### Prompt B: Offline / Air-Gapped Bundle Optimization
```markdown
We are preparing QUANTRISKSCALE for a strictly air-gapped / offline environment:
1. Configure `launch.bat` to detect offline mode and alert if dependencies are missing rather than attempting an online npm install.
2. Ensure all fonts, local SQLite engines, and D3 visualization scripts load from local bundle assets without external CDN requests.
```

### Prompt C: Custom Port & Browser Configuration
```markdown
I need to run multiple instances of QUANTRISKSCALE or run on a custom port (e.g., port 8080):
1. Update `launch.bat` and `.env` to support a customizable `PORT` parameter.
2. Update the auto-launch URL in `launch.bat` to dynamically target `http://localhost:%PORT%`.
```

---

## 4. Troubleshooting Reference

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `[ERROR] Node.js is not installed` | Node.js not found in system `PATH` | Download and install Node.js (LTS) from [nodejs.org](https://nodejs.org/), then reopen the command prompt. |
| `EADDRINUSE: address already in use :::3000` | Another process is using port 3000 | Run `netstat -ano \| findstr :3000` and kill the PID with `taskkill /PID <PID> /F`, or close the previous server window. |
| Browser opens before server is ready | System disk/CPU lag on first build | The launch script includes a 3-second delay (`timeout /t 3`). If your machine is slower on cold start, refresh the browser page once Vite completes. |
| `npm install` network timeout | Proxy or restricted corporate network | Configure corporate proxy via `npm config set proxy http://proxy:8080` or pre-install dependencies on an open connection. |
