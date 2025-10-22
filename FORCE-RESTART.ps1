# Force restart all servers with proxy
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  FORCE RESTART WITH PROXY" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Tuer tous les processus Node avec force maximale
Write-Host "Arret forcé de tous les processus Node..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Arret PID: $($_.Id)" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Tuer aussi via taskkill
taskkill /F /IM node.exe /T 2>&1 | Out-Null

Write-Host "Attente 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Vérifier si tout est arrêté
$remainingProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    Write-Host ""
    Write-Host "PROCESSUS RESTANTS DETECTES:" -ForegroundColor Red
    $remainingProcesses | ForEach-Object {
        Write-Host "  PID $($_.Id) - Tentative wmic..." -ForegroundColor Red
        wmic process where "ProcessId=$($_.Id)" delete 2>&1 | Out-Null
    }
    Start-Sleep -Seconds 2
}

# Vérifier une dernière fois
$stillRunning = Get-Process -Name node -ErrorAction SilentlyContinue
if ($stillRunning) {
    Write-Host ""
    Write-Host "ERREUR: Certains processus Node ne peuvent pas etre arretes:" -ForegroundColor Red
    $stillRunning | Select-Object Id,ProcessName,StartTime
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "  1. Ouvrez le Gestionnaire des taches (Ctrl+Shift+Esc)" -ForegroundColor White
    Write-Host "  2. Onglet 'Details'" -ForegroundColor White
    Write-Host "  3. Terminez tous les 'node.exe'" -ForegroundColor White
    Write-Host "  4. Relancez ce script" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "Tous les processus Node arretes!" -ForegroundColor Green
Write-Host ""

# Démarrer le backend
Write-Host "Demarrage du BACKEND (port 1000)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process -WindowStyle Normal -FilePath "cmd" -ArgumentList "/k", "cd /d `"$backendPath`" && node server.js"
Start-Sleep -Seconds 3

# Démarrer le frontend avec proxy
Write-Host "Demarrage du FRONTEND avec PROXY (port 9000)..." -ForegroundColor Cyan
Start-Process -WindowStyle Normal -FilePath "cmd" -ArgumentList "/k", "cd /d `"$PSScriptRoot`" && node server-frontend.js"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "  SERVEURS DEMARRES AVEC PROXY" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:1000" -ForegroundColor White
Write-Host "Frontend: http://localhost:9000 (AVEC PROXY API)" -ForegroundColor White
Write-Host ""
Write-Host "Agent: http://localhost:9000/dashboards/agent/agent-dashboard.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Le frontend redirige maintenant /api/* vers le backend!" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
pause | Out-Null
