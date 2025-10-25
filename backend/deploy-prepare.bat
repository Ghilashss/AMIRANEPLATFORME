@echo off
echo ========================================
echo   DEPLOIEMENT BACKEND - RENDER.COM
echo ========================================
echo.

REM Vérifier si Git est installé
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Git n'est pas installe!
    echo Telechargez Git depuis: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/6] Initialisation du repository Git...
if not exist ".git" (
    git init
    echo Repository Git initialise avec succes!
) else (
    echo Repository Git deja initialise.
)

echo.
echo [2/6] Ajout des fichiers...
git add .

echo.
echo [3/6] Commit des changements...
git commit -m "Backend avec nouveau systeme de caisse - Pret pour deploiement"

echo.
echo [4/6] Configuration de la branche main...
git branch -M main

echo.
echo ========================================
echo   PROCHAINES ETAPES:
echo ========================================
echo.
echo 1. Creer un repository sur GitHub:
echo    https://github.com/new
echo    Nom suggere: platforme-livraison-backend
echo.
echo 2. Ajouter le remote:
echo    git remote add origin https://github.com/VOTRE_USERNAME/platforme-livraison-backend.git
echo.
echo 3. Pousser le code:
echo    git push -u origin main
echo.
echo 4. Deployer sur Render.com:
echo    - Aller sur https://render.com
echo    - New + Web Service
echo    - Connecter le repository GitHub
echo    - Suivre le guide: DEPLOIEMENT_RENDER.md
echo.
echo ========================================
echo.
echo Voulez-vous ouvrir le guide de deploiement? (O/N)
set /p OPEN_GUIDE=

if /i "%OPEN_GUIDE%"=="O" (
    start DEPLOIEMENT_RENDER.md
)

echo.
echo [OK] Backend pret pour le deploiement!
echo.
pause
