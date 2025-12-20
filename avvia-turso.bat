@echo off
echo ========================================
echo  🚀 AntigraviPizza - Turso Cloud
echo ========================================
echo.
echo Configurazione: Database Turso (Cloud)
echo Database: antigravipizza-fabriziomc.turso.io
echo.

REM Backup .env corrente
if exist .env copy /Y .env .env.backup > nul

REM Crea .env per Turso
(
echo # Turso Database Configuration
echo DB_TYPE=turso
echo TURSO_DATABASE_URL=libsql://antigravipizza-fabriziomc.aws-eu-west-1.turso.io
echo TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjYyMTY2MjAsImlkIjoiNGY1MTQ3YWEtM2UxMi00MTQ2LWE2ZTUtMzAyZDk5MjQ4ODBmIiwicmlkIjoiMzYxNGFkZjQtOWEyYS00ZmFmLThlZGYtMjExMmYwODEyM2QyIn0.0zGVAYtzri2Lo3c2qwR6g6wwlBJzSMlcaVHye1bEo2X-YJDXSKLUAgE4Rfwn74HTnpQIb95sxrBigpWL7dt6DQ
echo PORT=3001
) > .env

echo ✅ Configurazione Turso attivata
echo.
echo 🔄 Avvio server...
echo.

npm start

REM Ripristina .env originale alla chiusura
if exist .env.backup (
    copy /Y .env.backup .env > nul
    del .env.backup
)
