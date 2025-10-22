@echo off
echo ========================================
echo    INSTALLATION MONGODB
echo ========================================
echo.

echo Etape 1: Installation de MongoDB...
echo IMPORTANT: 
echo - Cliquez sur "Next"
echo - Acceptez les termes
echo - Choisissez "Complete"
echo - COCHEZ "Install MongoDB as a Service"
echo - Cliquez sur "Install"
echo.
pause

start /wait msiexec /i "%USERPROFILE%\Downloads\mongodb-windows-x86_64-8.2.1-signed.msi" /qb

echo.
echo Etape 2: Creation du dossier de donnees...
if not exist "C:\data\db" mkdir "C:\data\db"

echo.
echo Etape 3: Demarrage du service MongoDB...
net start MongoDB

echo.
echo Etape 4: Test de connexion...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    INSTALLATION TERMINEE !
echo ========================================
echo.
echo MongoDB est maintenant installe et demarre.
echo Vous pouvez maintenant lancer le backend.
echo.
pause
