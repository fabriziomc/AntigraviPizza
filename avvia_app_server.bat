@echo off
echo ========================================
echo   AntigraviPizza - Modalita SERVER
echo   Database: SQL Server (10.1.1.140)
echo ========================================
echo.

REM Copia la configurazione per SQL Server
copy /Y .env.mssql .env > nul
echo [OK] Configurazione SQL Server caricata

echo.
echo Avvio applicazione (Backend + Frontend)...
echo.

REM Avvia backend e frontend insieme
npm run dev:sql
