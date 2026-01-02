@echo off
echo ========================================
echo  🛑 Ferma Server AntigraviPizza
echo ========================================
echo.
echo Ricerca processi Node.js in esecuzione...
echo.

taskkill /F /IM node.exe 2>nul

if %errorlevel% == 0 (
    echo.
    echo ✅ Server fermato con successo!
) else (
    echo.
    echo ⚠️ Nessun server Node.js attivo trovato
)

echo.
echo ========================================
pause
