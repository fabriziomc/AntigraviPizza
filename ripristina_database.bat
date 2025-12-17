@echo off
echo ========================================
echo RIPRISTINO DATABASE COMPLETO
echo ========================================
echo.

echo [1/8] Fermando server...
call ferma_server.bat
timeout /t 2 /nobreak >nul

echo.
echo [2/8] Eliminando database esistente...
del antigravipizza.db 2>nul

echo.
echo [3/8] Inizializzando schema database...
node server/init-schema.js

echo.
echo [4/8] Creando categorie...
node server/create-categories.js

echo.
echo [5/8] Ripristinando ingredienti da backup...
node server/restore-ingredients-from-backup.js

echo.
echo [6/8] Ripristinando preparazioni da backup...
node server/restore-preparations.js

echo.
echo [7/8] Migrando preparazioni (ingredientId)...
node server/migrate-preparations.js

echo.
echo [8/8] Esportando seed aggiornati...
node server/export-ingredients-seed.js
node server/export-preparations-seed.js

echo.
echo ========================================
echo RIPRISTINO COMPLETATO!
echo ========================================
echo.
echo Database ripristinato con:
echo - 10 Categorie
echo - ~244 Ingredienti (con categorie corrette)
echo - ~64 Preparazioni
echo.
echo Seed files aggiornati per future installazioni.
echo.
echo Ora riavvia il server con: avvia_app_sqlite.bat
echo.
pause
