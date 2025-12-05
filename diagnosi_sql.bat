@echo off
echo ========================================
echo   DIAGNOSI SQL SERVER
echo ========================================
echo.

echo Verifica configurazione SQL Server...
echo.

echo 1. Test connessione porta 1433...
powershell -Command "Test-NetConnection -ComputerName 10.1.1.140 -Port 1433 -InformationLevel Detailed"

echo.
echo 2. Test con sqlcmd...
sqlcmd -S 10.1.1.140 -U sa -P "pass#123" -Q "SELECT @@VERSION, SERVERPROPERTY('IsIntegratedSecurityOnly') AS AuthMode"

echo.
echo ========================================
echo   RISULTATI
echo ========================================
echo.
echo Se sqlcmd funziona ma Node.js no, il problema e':
echo - SQL Server non configurato per autenticazione SQL
echo - TCP/IP non abilitato
echo - Firewall blocca connessioni non-Microsoft
echo.
echo Leggi GUIDA_SQL_SERVER.md per le soluzioni
echo.
pause
