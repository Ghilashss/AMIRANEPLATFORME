@echo off
title FRONTEND SERVER - Port 9000
color 0B
cd /d "%~dp0"
echo.
echo ========================================
echo    FRONTEND SERVER DEMARRE
echo    Port: 9000
echo    URL: http://localhost:9000
echo ========================================
echo.
node server-frontend.js
pause
