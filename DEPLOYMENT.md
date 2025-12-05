# AntigraviPizza - Guida Deployment

## 🎯 Configurazioni Disponibili

L'applicazione supporta **3 modalità di deployment**:

1. **SQL Server** - Database aziendale centralizzato
2. **SQLite Locale** - Database locale per sviluppo
3. **Docker** - Container con SQLite per deployment portatile

---

## 📋 Modalità 1: SQL Server (Aziendale)

### Quando Usare
- ✅ Ambiente aziendale multi-utente
- ✅ Database centralizzato
- ✅ Backup automatici aziendali

### Avvio
```batch
avvia_app_server.bat
```

### Configurazione
File: `.env.mssql`
```env
DB_TYPE=mssql
DB_SERVER=10.1.1.140
DB_USER=sa
DB_PASSWORD='pass#123'
DB_DATABASE=AntigraviPizza
PORT=3000
```

### URL
- Frontend: http://localhost:5173
- API: http://localhost:3000

---

## 📋 Modalità 2: SQLite Locale

### Quando Usare
- ✅ Sviluppo locale
- ✅ Test senza SQL Server
- ✅ Demo offline

### Avvio
```batch
avvia_app_sqlite.bat
```

### Configurazione
File: `.env.sqlite`
```env
DB_TYPE=sqlite
PORT=3000
```

### Database
- File: `antigravipizza.db` (creato automaticamente)
- Posizione: root del progetto

### URL
- Frontend: http://localhost:5173
- API: http://localhost:3000

---

## 📋 Modalità 3: Docker (Containerizzato)

### Quando Usare
- ✅ Deployment su server
- ✅ Distribuzione portatile
- ✅ Ambiente isolato
- ✅ Demo/produzione

### Prerequisiti
- Docker Desktop installato
- Docker Compose disponibile

### Build
```batch
docker-build.bat
```

Oppure manualmente:
```bash
docker-compose build
```

### Avvio
```batch
docker-run.bat
```

Oppure manualmente:
```bash
docker-compose up -d
```

### Stop
```batch
docker-stop.bat
```

Oppure manualmente:
```bash
docker-compose down
```

### URL
- Applicazione: http://localhost:3000

### Persistenza Dati
I dati sono salvati in: `./data/antigravipizza.db`

Questo file persiste anche quando il container viene fermato/riavviato.

### Logs
```bash
docker-compose logs -f
```

### Riavvio
```bash
docker-compose restart
```

---

## 🔄 Switch tra Modalità

### Da SQL Server a SQLite
1. Ferma l'app SQL Server (Ctrl+C)
2. Esegui `avvia_app_sqlite.bat`

### Da SQLite a SQL Server
1. Ferma l'app SQLite (Ctrl+C)
2. Esegui `avvia_app_server.bat`

### Da Locale a Docker
1. Ferma l'app locale (Ctrl+C)
2. Esegui `docker-build.bat` (prima volta)
3. Esegui `docker-run.bat`

---

## 📁 Struttura File

```
AntigraviPizza/
├── .env.mssql              # Config SQL Server
├── .env.sqlite             # Config SQLite
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker orchestration
├── .dockerignore          # Files to exclude from image
│
├── avvia_app_server.bat   # Start with SQL Server
├── avvia_app_sqlite.bat   # Start with SQLite
├── docker-build.bat       # Build Docker image
├── docker-run.bat         # Run Docker container
├── docker-stop.bat        # Stop Docker container
│
├── data/                  # SQLite database (auto-created)
│   └── antigravipizza.db
│
└── server/
    ├── db.js              # Database switch logic
    ├── db-adapter.js      # Unified database API
    └── db-mssql.js        # SQL Server connector
```

---

## 🐛 Troubleshooting

### SQL Server non si connette
1. Verifica che SQL Server sia raggiungibile
2. Controlla credenziali in `.env.mssql`
3. Verifica firewall/rete

### SQLite: errore permessi
1. Verifica permessi scrittura nella cartella
2. Controlla che `data/` esista

### Docker: build fallisce
1. Verifica che Docker Desktop sia avviato
2. Controlla spazio disco disponibile
3. Prova: `docker system prune`

### Docker: porta 3000 occupata
1. Ferma altri servizi sulla porta 3000
2. Oppure modifica porta in `docker-compose.yml`

---

## 📊 Confronto Modalità

| Caratteristica | SQL Server | SQLite Locale | Docker |
|----------------|------------|---------------|--------|
| **Multi-utente** | ✅ Sì | ❌ No | ❌ No |
| **Portabilità** | ❌ No | ⚠️ Parziale | ✅ Sì |
| **Setup** | Complesso | Semplice | Medio |
| **Backup** | Aziendale | Manuale | File singolo |
| **Performance** | Alta | Media | Media |
| **Uso consigliato** | Produzione | Sviluppo | Demo/Deploy |

---

## 🚀 Quick Start

### Per Sviluppo
```batch
avvia_app_sqlite.bat
```

### Per Produzione Aziendale
```batch
avvia_app_server.bat
```

### Per Deploy/Demo
```batch
docker-build.bat
docker-run.bat
```

---

## 📝 Note Importanti

> **SQL Server**: Password con `#` deve essere tra apici in `.env.mssql`

> **SQLite**: Database creato automaticamente al primo avvio

> **Docker**: Volume `./data` persiste i dati tra restart

> **Frontend**: Configurare `USE_SQL_BACKEND` in `src/config.js`:
> - `true` = usa backend API
> - `false` = usa IndexedDB browser
