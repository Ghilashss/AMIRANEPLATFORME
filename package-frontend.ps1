# Script PowerShell pour packager le frontend en zip prêt à uploader sur Hostinger
# Usage: .\package-frontend.ps1 -Output archive-frontend.zip
param(
    [string]$Output = "frontend-package.zip",
    [string]$Source = "dashboards"
)

Write-Host "Packaging frontend..." -ForegroundColor Cyan
if (Test-Path $Output) { Remove-Item $Output -Force }

Compress-Archive -Path "$Source\*" -DestinationPath $Output -Force

if (Test-Path $Output) {
    Write-Host "✅ Archive créée: $Output" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de la création de l'archive" -ForegroundColor Red
}
