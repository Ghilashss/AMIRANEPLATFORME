# Génération d'un JWT Secret sécurisé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GENERATION JWT SECRET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Générer un secret fort de 64 bytes
$bytes = New-Object byte[] 64
$rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)

Write-Host "JWT_SECRET genere avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Copiez cette valeur dans Render.com:" -ForegroundColor Yellow
Write-Host ""
Write-Host $jwtSecret -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Copier dans le presse-papier
$jwtSecret | Set-Clipboard
Write-Host "[OK] Secret copie dans le presse-papier!" -ForegroundColor Green
Write-Host "     Vous pouvez le coller directement dans Render.com" -ForegroundColor Gray
Write-Host ""

pause
