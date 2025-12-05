# 🐳 AntigraviPizza - Comandi Docker Rapidi

## Avvio Applicazione

```bash
docker compose up -d
```
L'applicazione sarà disponibile su: **http://localhost:3000**

## Arresto Applicazione

```bash
docker compose down
```

## Visualizza Log

```bash
# Log in tempo reale
docker compose logs -f

# Ultimi 50 log
docker compose logs --tail=50
```

## Ricostruzione dopo Modifiche

```bash
docker compose down
docker compose build
docker compose up -d
```

## Verifica Stato

```bash
# Vedi container in esecuzione
docker ps

# Vedi tutti i container (anche fermati)
docker ps -a
```

## Database

Il database SQLite è salvato in:
- **Percorso locale**: `./data/antigravipizza.db`
- **Percorso container**: `/app/data/antigravipizza.db`

I dati persistono anche quando il container viene fermato o rimosso.

## Risoluzione Problemi

### Container non si avvia
```bash
# Vedi i log per errori
docker compose logs

# Ricostruisci senza cache
docker compose build --no-cache
```

### Porta 3000 occupata
Modifica la porta in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Cambia 3001 con la porta che preferisci
```

### Reset completo
```bash
# Ferma e rimuovi tutto
docker compose down -v

# Ricostruisci da zero
docker compose build --no-cache
docker compose up -d
```

---

**Nota**: Docker Desktop deve essere avviato prima di eseguire questi comandi.
