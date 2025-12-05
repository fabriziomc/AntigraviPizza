@echo off
echo ========================================
echo   AntigraviPizza - Docker Stop
echo ========================================
echo.
echo Arresto del container Docker...
echo.

docker compose down

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Container arrestato con successo!
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo   Errore durante l'arresto!
    echo ========================================
    echo.
)

pause
