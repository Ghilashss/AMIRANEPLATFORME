@echo off
echo.
echo ========================================
echo   REDEMARRAGE COMPLET AVEC PROXY
echo ========================================
echo.

REM Tuer tous les processus Node
echo [1/4] Arret de tous les processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 5 /nobreak >nul

echo [2/4] Verification...
tasklist | findstr "node.exe" >nul
if %errorlevel% equ 0 (
    echo ^> Attention: Des processus Node tournent encore
    tasklist | findstr "node.exe"
    echo ^> Nouvelle tentative...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    echo ^> OK: Tous les processus Node arretes
)

echo.
echo [3/4] Demarrage du BACKEND (port 1000)...
cd /d "%~dp0backend"
start "BACKEND - Port 1000" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo [4/4] Demarrage du FRONTEND avec PROXY (port 9000)...
cd /d "%~dp0"
start "FRONTEND AVEC PROXY - Port 9000" cmd /k "node server-frontend.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   SERVEURS DEMARRES AVEC PROXY
echo ========================================
echo.
echo Backend:  http://localhost:1000
echo Frontend: http://localhost:9000 (AVEC PROXY)
echo.
echo Le frontend redirige /api/* vers le backend!
echo.
echo Agent:    http://localhost:9000/dashboards/agent/agent-dashboard.html
echo.
echo.
echo TESTEZ MAINTENANT:
echo 1. F5 pour rafraichir la page
echo 2. Cliquer sur le bouton Marquer comme traite
echo 3. Verifier la console (F12)
echo.
pause
