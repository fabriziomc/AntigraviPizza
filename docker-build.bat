@echo off
echo ========================================
echo   AntigraviPizza - Docker Build
echo ========================================
echo.
echo Building Docker image...
echo.

docker compose build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Build completato con successo!
    echo ========================================
    echo.
    echo Per avviare il container, esegui:
    echo   docker-run.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   Errore durante il build!
    echo ========================================
    echo.
)

pause
