@echo off
echo ======================================
echo  Demarrage du Backend
echo ======================================
echo.

REM Vérifier si node_modules existe
if not exist "node_modules" (
    echo [ERREUR] Les dependances ne sont pas installees!
    echo Executez d'abord: install.bat
    pause
    exit /b 1
)

REM Vérifier si .env existe
if not exist ".env" (
    echo [ERREUR] Fichier .env manquant!
    echo Copiez .env.example vers .env et configurez-le
    pause
    exit /b 1
)

echo Demarrage du serveur en mode developpement...
echo.
echo Le serveur demarrera sur: http://localhost:5000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

npm run dev
