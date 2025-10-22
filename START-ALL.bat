@echo off
chcp 65001 > nul
cls

echo ================================================================
echo   DÉMARRAGE COMPLET DE LA PLATEFORME
echo ================================================================
echo.

:: Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé !
    echo    Téléchargez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté
node --version
echo.

:: Vérifier si MongoDB est démarré
echo 🔍 Vérification de MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB est déjà démarré
) else (
    echo ⚠️  MongoDB n'est pas démarré
    echo    Démarrage automatique de MongoDB...
    start "MongoDB" mongod --dbpath="C:\data\db"
    timeout /t 3 >nul
)
echo.

:: Démarrer le Backend sur port 1000
echo ================================================================
echo   1️⃣  DÉMARRAGE DU BACKEND (Port 1000)
echo ================================================================
cd backend
start "🔧 Backend API - Port 1000" cmd /k "node server.js"
cd ..
echo ✅ Backend démarré en arrière-plan
timeout /t 2 >nul
echo.

:: Démarrer le Frontend sur port 9000
echo ================================================================
echo   2️⃣  DÉMARRAGE DU FRONTEND (Port 9000)
echo ================================================================
start "🌐 Frontend Server - Port 9000" cmd /k "node server-frontend.js"
echo ✅ Frontend démarré en arrière-plan
timeout /t 2 >nul
echo.

:: Attendre que les serveurs démarrent
echo ⏳ Attente du démarrage complet des serveurs...
timeout /t 3 >nul
echo.

echo ================================================================
echo   ✅ TOUS LES SERVEURS SONT DÉMARRÉS
echo ================================================================
echo.
echo 📍 URLs disponibles:
echo    🔧 Backend API:  http://localhost:1000/api
echo    🌐 Frontend:     http://localhost:9000
echo.
echo 📌 Pages Dashboard:
echo    👨‍💼 Admin:    http://localhost:9000/dashboards/admin/admin-dashboard.html
echo    🚚 Agent:    http://localhost:9000/dashboards/agent/agent-dashboard.html
echo    🏪 Agence:   http://localhost:9000/dashboards/agence/agence-dashboard.html
echo    🛍️  Commercant: http://localhost:9000/dashboards/commercant/commercant-dashboard.html
echo.
echo ⚠️  Pour arrêter les serveurs:
echo    - Fermez les fenêtres cmd du Backend et Frontend
echo    - Ou appuyez sur Ctrl+C dans chaque fenêtre
echo.
echo 💡 Ce script va maintenant ouvrir le Dashboard Admin dans votre navigateur...
timeout /t 3 >nul

:: Ouvrir le navigateur sur le Dashboard Admin
start http://localhost:9000/dashboards/admin/admin-dashboard.html

echo.
echo ✅ Navigateur ouvert sur le Dashboard Admin
echo.
echo ================================================================
echo   Appuyez sur une touche pour fermer cette fenêtre
echo   (Les serveurs continueront de tourner en arrière-plan)
echo ================================================================
pause >nul
