# 🐳 Docker Desktop - Prossimi Passi

## Situazione
Docker Desktop è installato ma non ancora accessibile dal terminale corrente.

## Soluzione Rapida

### Opzione 1: Riavvia il Terminale (Più Veloce)
1. Chiudi questo terminale/PowerShell
2. Apri un nuovo terminale
3. Vai nella cartella del progetto:
   ```powershell
   cd c:\Users\FABRIZIO\.gemini\antigravity\ManagerAgente\AntigraviPizza
   ```
4. Verifica Docker:
   ```powershell
   docker --version
   ```
5. Se funziona, procedi con il build:
   ```batch
   docker-build.bat
   ```

### Opzione 2: Usa Docker Desktop GUI
1. Apri Docker Desktop
2. Aspetta che si avvii completamente (icona verde)
3. Poi riprova dal terminale

## Test Docker

Dopo aver riavviato il terminale, esegui:

```batch
# Verifica installazione
docker --version
docker compose version

# Build dell'immagine
docker-build.bat

# Avvio del container
docker-run.bat
```

## Comandi Manuali (se preferisci)

```powershell
# Build
docker compose build

# Run
docker compose up -d

# Verifica
docker ps

# Logs
docker compose logs -f

# Stop
docker compose down
```

## URL dell'Applicazione

Quando il container sarà avviato:
- **Applicazione**: http://localhost:3000
- **Database**: `./data/antigravipizza.db` (creato automaticamente)

## Troubleshooting

### Docker non trovato dopo riavvio terminale
- Verifica che Docker Desktop sia avviato
- Controlla l'icona nella system tray (deve essere verde)

### Errore "daemon not running"
- Apri Docker Desktop
- Aspetta che si avvii completamente

### Porta 3000 occupata
- Ferma altri servizi sulla porta 3000
- Oppure modifica la porta in `docker-compose.yml`

---

**Prossimo passo:** Riavvia il terminale e esegui `docker-build.bat`
