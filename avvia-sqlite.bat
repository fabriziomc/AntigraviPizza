@echo off
echo ========================================
echo  🚀 AntigraviPizza - SQLite Locale
echo ========================================
echo.
echo Configurazione: Database SQLite locale
echo Database: antigravipizza.db
echo.

REM Backup .env corrente
if exist .env copy /Y .env .env.backup > nul

REM Crea .env per SQLite
(
echo # SQLite Local Configuration
echo DB_TYPE=sqlite
echo PORT=3001
) > .env

echo ✅ Configurazione SQLite attivata
echo.
echo 🔄 Avvio server...
echo.

npm start

REM Ripristina .env originale alla chiusura
if exist .env.backup (
    copy /Y .env.backup .env > nul
    del .env.backup
)
