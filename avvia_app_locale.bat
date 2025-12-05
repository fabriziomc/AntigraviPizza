@echo off
echo ========================================
echo   AntigraviPizza - Modalita LOCALE
echo   Database: SQLite
echo ========================================
echo.

REM Copia la configurazione per SQLite
copy /Y .env.sqlite .env > nul
echo [OK] Configurazione SQLite caricata

echo.
echo Avvio applicazione...
echo.

REM Avvia l'applicazione frontend (Vite)
npm run dev
