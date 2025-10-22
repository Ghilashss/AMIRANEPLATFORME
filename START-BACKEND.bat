@echo off
title BACKEND API - Port 1000
color 0A
cd /d "%~dp0backend"
echo.
echo ========================================
echo    BACKEND API DEMARRE
echo    Port: 1000
echo    MongoDB: localhost:27017
echo ========================================
echo.
node server.js
pause
