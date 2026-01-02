# Script to save clipboard content to seed-data.json
$clipboardContent = Get-Clipboard -Raw
$outputPath = "public\seed-data.json"

# Save to file
$clipboardContent | Out-File -FilePath $outputPath -Encoding UTF8 -NoNewline

Write-Host "✅ Dati salvati in $outputPath" -ForegroundColor Green
Write-Host ""
Write-Host "Contenuto salvato:" -ForegroundColor Cyan
$data = $clipboardContent | ConvertFrom-Json
Write-Host "  - Ricette: $($data.recipes.Count)" -ForegroundColor Yellow
Write-Host "  - Pizza Nights: $($data.pizzaNights.Count)" -ForegroundColor Yellow
Write-Host "  - Data export: $(Get-Date -Date ([DateTimeOffset]::FromUnixTimeMilliseconds($data.exportDate)) -Format 'dd/MM/yyyy HH:mm')" -ForegroundColor Yellow
