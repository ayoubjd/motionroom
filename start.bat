@echo off
cd /d "%~dp0"
title Motionroom - Animation Studio
where node >nul 2>&1
if not errorlevel 1 (
  node start.cjs
  pause
  exit /b
)
where py >nul 2>&1
if not errorlevel 1 (
  start "" "http://127.0.0.1:8080"
  py -m http.server 8080 --bind 127.0.0.1 --directory dist
  pause
  exit /b
)
echo Install Node.js LTS or Python 3, then run start.bat again.
echo No npm installation is needed.
pause
