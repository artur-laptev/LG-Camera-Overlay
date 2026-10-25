@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS 22 or newer, then open this file again.
  pause
  exit /b 1
)
if not exist node_modules\ssh2\package.json (
  call npm.cmd ci --omit=dev --ignore-scripts
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open the local address printed below in your browser. Leave this window open during setup.
node setup/server.cjs
pause
