# Script de packaging frontend CORRIGÉ pour Hostinger
# Crée un zip avec la bonne structure de dossiers

Write-Host "Packaging frontend (version corrigée)..." -ForegroundColor Yellow

# Créer un dossier temporaire
$tempDir = ".\temp-package"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copier tous les dossiers dashboards avec leur structure
Copy-Item ".\dashboards\*" -Destination $tempDir -Recurse -Force

# Créer l'archive ZIP
$zipPath = ".\frontend-package-fixed.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

# Nettoyer
Remove-Item $tempDir -Recurse -Force

Write-Host "✅ Archive créée: frontend-package-fixed.zip" -ForegroundColor Green
Write-Host ""
Write-Host "UPLOAD CE NOUVEAU FICHIER sur Hostinger:" -ForegroundColor Yellow
Write-Host "1. Supprime tout dans public_html/" -ForegroundColor White
Write-Host "2. Upload frontend-package-fixed.zip" -ForegroundColor White
Write-Host "3. Extract dans public_html/" -ForegroundColor White
Write-Host "4. Tu devrais voir: admin/, agent/, agence/, commercant/, config.js, .htaccess" -ForegroundColor Green
