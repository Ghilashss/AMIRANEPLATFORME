# Test API Agences - PowerShell

# 1. Se connecter et obtenir le token
$loginBody = @{
    email = "commercant@test.com"
    password = "123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

Write-Host "=== CONNEXION ===" -ForegroundColor Green
Write-Host "Token: $($loginResponse.token.Substring(0, 50))..."
Write-Host "User: $($loginResponse.user.email)"
Write-Host ""

# 2. Tester l'API agences avec le token
$token = $loginResponse.token
$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "=== TEST API AGENCES ===" -ForegroundColor Cyan
try {
    $agences = Invoke-RestMethod -Uri "http://localhost:5000/api/agences" -Method Get -Headers $headers
    Write-Host "Nombre d'agences: $($agences.Count)" -ForegroundColor Green
    Write-Host ""
    Write-Host "AGENCES:" -ForegroundColor Yellow
    $agences | ForEach-Object {
        Write-Host "  - $($_.nom) (Wilaya: $($_.wilayaText)) - ID: $($_._id)"
    }
} catch {
    Write-Host "ERREUR: $_" -ForegroundColor Red
}
