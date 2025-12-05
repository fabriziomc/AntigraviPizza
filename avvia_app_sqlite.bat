@echo off
echo ========================================
echo   AntigraviPizza - Modalita SQLite
echo ========================================
echo.
echo Avvio dell'applicazione con database SQLite locale...
echo.

set DB_TYPE=sqlite
set PORT=3000

npm run dev:sql
