@echo off
echo.
echo ========================================
echo   DEMARRAGE DES SERVEURS
echo ========================================
echo.
echo  Demarrage Backend (port 1000)...
start "BACKEND API - Port 1000" cmd /k "cd /d "%~dp0" && START-BACKEND.bat"

timeout /t 3 /nobreak >nul

echo  Demarrage Frontend (port 9000)...
start "FRONTEND - Port 9000" cmd /k "cd /d "%~dp0" && START-FRONTEND.bat"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   SERVEURS DEMARRES!
echo ========================================
echo.
echo   Backend:  http://localhost:1000
echo   Frontend: http://localhost:9000
echo.
echo   Page de connexion:
echo   http://localhost:9000/login-new.html
echo.
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause >nul
