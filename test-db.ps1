$connString = "Driver={SQL Server};Server=10.1.1.140;Database=AntigraviPizza;Trusted_Connection=Yes;"
Write-Host "Testing connection with: $connString"

try {
    $conn = New-Object System.Data.Odbc.OdbcConnection($connString)
    $conn.Open()
    Write-Host "✅ Connected successfully!"
    $conn.Close()
} catch {
    Write-Host "❌ Connection failed:"
    Write-Host $_.Exception.Message
}
