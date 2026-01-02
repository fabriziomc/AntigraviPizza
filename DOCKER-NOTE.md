# ⚠️ Nota: Docker non installato

## Situazione

Docker non è attualmente installato su questo sistema. Per testare la modalità Docker, è necessario:

1. **Installare Docker Desktop per Windows**
   - Download: https://www.docker.com/products/docker-desktop/
   - Installare e riavviare il PC
   - Avviare Docker Desktop

2. **Verificare l'installazione**
   ```powershell
   docker --version
   docker compose version
   ```

## Alternativa: SQLite Locale

Nel frattempo, puoi usare la modalità SQLite locale che funziona **esattamente** come Docker ma senza container:

```batch
avvia_app_sqlite.bat
```

Questa modalità:
- ✅ Usa lo stesso database SQLite
- ✅ Stessa configurazione
- ✅ Stesso comportamento
- ❌ Non è containerizzata

## Quando Docker sarà installato

Dopo aver installato Docker Desktop:

```batch
# Build dell'immagine
docker-build.bat

# Avvio del container
docker-run.bat

# L'app sarà disponibile su http://localhost:3000
```

## Test Immediato

Per testare subito la funzionalità SQLite (senza Docker):

1. Assicurati che non ci siano altri server in esecuzione sulla porta 3000
2. Esegui:
   ```batch
   avvia_app_sqlite.bat
   ```
3. Apri http://localhost:5173 (frontend) o http://localhost:3000 (API)

Il database SQLite verrà creato automaticamente in `antigravipizza.db`.
