@echo off
echo ========================================
echo    DEMARRAGE DE LA PLATEFORME
echo ========================================
echo.

echo Etape 1: Verification de MongoDB...
sc query MongoDB | find "RUNNING" >nul
if errorlevel 1 (
    echo MongoDB n'est pas demarre. Demarrage...
    net start MongoDB
) else (
    echo MongoDB est deja actif.
)

echo.
echo Etape 2: Demarrage du Backend (port 5000)...
start "Backend API" cmd /k "cd /d "%~dp0backend" && node server.js"

echo.
echo Attente de 3 secondes pour le backend...
timeout /t 3 /nobreak >nul

echo.
echo Etape 3: Demarrage du Frontend (port 8080)...
start "Frontend Server" cmd /k "cd /d "%~dp0" && node server-frontend.js"

echo.
echo Attente de 2 secondes pour le frontend...
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    PLATEFORME DEMARREE !
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Login:    http://localhost:8080/login.html
echo.
echo Identifiants Admin:
echo   Email:    admin@platforme.com
echo   Password: admin123
echo.
echo Appuyez sur une touche pour ouvrir la plateforme dans le navigateur...
pause >nul

start http://localhost:8080/index.html

echo.
echo La plateforme est maintenant ouverte dans votre navigateur.
echo.
echo IMPORTANT: Ne fermez pas les fenetres "Backend API" et "Frontend Server"
echo            tant que vous utilisez la plateforme !
echo.
pause
