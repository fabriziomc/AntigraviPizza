# Install Turso CLI on Windows
$tursoVersion = "v1.0.15"
$downloadUrl = "https://github.com/tursodatabase/turso-cli/releases/download/$tursoVersion/turso-cli_Linux_x86_64.tar.gz"
$tempDir = "$env:TEMP\turso"
$installDir = "$env:LOCALAPPDATA\turso"

Write-Host "Downloading Turso CLI $tursoVersion..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

# Download
$archivePath = "$tempDir\turso.tar.gz"
Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath

Write-Host "Download completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: This is a Linux binary. You'll need WSL or Git Bash to run it." -ForegroundColor Yellow
Write-Host ""
Write-Host "Alternative: Install via Scoop (Windows package manager)" -ForegroundColor Cyan
Write-Host "  1. Install Scoop: https://scoop.sh" -ForegroundColor White
Write-Host "  2. Run: scoop install turso" -ForegroundColor White
