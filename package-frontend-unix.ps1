# Script de packaging frontend pour serveurs Unix/Linux (Hostinger)
# Crée un zip avec des chemins Unix (/) au lieu de Windows (\)

Write-Host "Packaging frontend pour Hostinger (Unix paths)..." -ForegroundColor Yellow

$zipPath = ".\frontend-hostinger.zip"

# Supprimer l'ancien zip si existant
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Utiliser PowerShell 7+ ou .NET pour créer le zip avec les bons chemins
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Fonction récursive pour ajouter les fichiers
function Add-FilesToZip {
    param(
        [string]$SourceDir,
        [string]$ZipDir,
        [System.IO.Compression.ZipArchive]$ZipArchive
    )
    
    Get-ChildItem -Path $SourceDir -File | ForEach-Object {
        $relativePath = if ($ZipDir) { "$ZipDir/$($_.Name)" } else { $_.Name }
        $entry = $ZipArchive.CreateEntry($relativePath)
        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead($_.FullName)
        $fileStream.CopyTo($entryStream)
        $fileStream.Close()
        $entryStream.Close()
        Write-Host "  + $relativePath" -ForegroundColor Gray
    }
    
    Get-ChildItem -Path $SourceDir -Directory | ForEach-Object {
        $newZipDir = if ($ZipDir) { "$ZipDir/$($_.Name)" } else { $_.Name }
        Add-FilesToZip -SourceDir $_.FullName -ZipDir $newZipDir -ZipArchive $ZipArchive
    }
}

Write-Host "`nAjout des fichiers racine..." -ForegroundColor Cyan

# Fichiers racine à inclure
$rootFiles = @(
    "index.html",
    "login.html",
    "login-new.html",
    "style.css",
    "script.js",
    "logo.png",
    "config.js",
    "auth-service.js"
)

foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        $entry = $zip.CreateEntry($file)
        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead((Resolve-Path $file).Path)
        $fileStream.CopyTo($entryStream)
        $fileStream.Close()
        $entryStream.Close()
        Write-Host "  + $file" -ForegroundColor Gray
    }
}

Write-Host "`nAjout des dossiers..." -ForegroundColor Cyan
Add-FilesToZip -SourceDir ".\dashboards" -ZipDir "" -ZipArchive $zip

$zip.Dispose()

Write-Host "`n✅ Archive créée: frontend-hostinger.zip" -ForegroundColor Green
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   INSTRUCTIONS HOSTINGER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n1. SUPPRIME TOUT dans public_html/" -ForegroundColor White
Write-Host "2. Upload frontend-hostinger.zip" -ForegroundColor White
Write-Host "3. Extract avec nom de dossier = ." -ForegroundColor White
Write-Host "4. Vérifie que tu vois des DOSSIERS:" -ForegroundColor White
Write-Host "   - admin/" -ForegroundColor Green
Write-Host "   - agent/" -ForegroundColor Green
Write-Host "   - agence/" -ForegroundColor Green
Write-Host "   - commercant/" -ForegroundColor Green
Write-Host "`n========================================`n" -ForegroundColor Cyan
