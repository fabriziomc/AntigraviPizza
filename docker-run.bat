@echo off
echo ========================================
echo   AntigraviPizza - Docker Run
echo ========================================
echo.
echo Avvio del container Docker...
echo.

docker compose up -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Container avviato con successo!
    echo ========================================
    echo.
    echo L'applicazione e disponibile su:
    echo   http://localhost:3000
    echo.
    echo Per vedere i logs:
    echo   docker-compose logs -f
    echo.
    echo Per fermare il container:
    echo   docker-stop.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   Errore durante l'avvio!
    echo ========================================
    echo.
)

pause
