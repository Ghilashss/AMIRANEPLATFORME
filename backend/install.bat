@echo off
echo ======================================
echo  Installation Backend - Plateforme
echo ======================================
echo.

REM Vérifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe!
    echo Telechargez Node.js depuis: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js est installe
echo.

REM Installer les dépendances
echo Installation des dependances NPM...
call npm install
if errorlevel 1 (
    echo [ERREUR] Echec de l'installation des dependances
    pause
    exit /b 1
)

echo.
echo [OK] Dependances installees avec succes!
echo.

REM Vérifier MongoDB
echo Verification de MongoDB...
mongo --version >nul 2>&1
if errorlevel 1 (
    echo [ATTENTION] MongoDB n'est pas installe localement
    echo Vous pouvez utiliser MongoDB Atlas (cloud)
    echo.
) else (
    echo [OK] MongoDB est installe
)

REM Copier .env si nécessaire
if not exist ".env" (
    echo Configuration de l'environnement...
    copy .env.example .env
    echo [OK] Fichier .env cree
    echo [IMPORTANT] Modifiez le fichier .env avec vos parametres
    echo.
)

echo ======================================
echo  Installation terminee avec succes!
echo ======================================
echo.
echo Prochaines etapes:
echo 1. Modifier le fichier .env si necessaire
echo 2. Demarrer MongoDB (si local)
echo 3. Executer: node seed.js
echo 4. Demarrer le serveur: npm run dev
echo.
pause
