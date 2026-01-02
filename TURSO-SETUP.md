# Setup Turso - Database SQLite Cloud GRATUITO

## Cos'è Turso?

**Turso** è un database SQLite distribuito, serverless e edge. Perfetto per sostituire il database locale e mantenere i dati persistenti anche quando aggiorni l'app su Render!

## ✅ FREE Tier (Generoso!)

- 📊 500 database
- 💾 5 GB di storage
- 📖 500 milioni reads/mese
- ✍️ 10 milioni writes/mese
- ⚡ No cold starts
- 💾 Backup automatici
- 🌍 Edge replication

## 🚀 Setup Veloce (10 minuti)

### 1️⃣ Installa Turso CLI

**Windows (PowerShell)**:
```powershell
iwr https://get.tur.so/install.ps1 -useb | iex
```

**macOS/Linux**:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2️⃣ Registrati e Login

```bash
# Signup (gratis)
turso auth signup

# Verrà aperto il browser per registrazione
# Conferma email e torna al terminale
```

### 3️⃣ Crea Database

```bash
# Crea database
turso db create antigravipizza

# Output: Database antigravipizza created in... (location)
```

### 4️⃣ Ottieni Credenziali

```bash
# Mostra dettagli database
turso db show antigravipizza

# Output:
# Name:   antigravipizza
# URL:    libsql://antigravipizza-[username].turso.io
# ...

# Crea auth token
turso db tokens create antigravipizza

# Output: eyJhbGciOiJFZERTQSIsInR5cCI6... (COPIALO!)
```

**SALVA**:
- URL: `libsql://antigravipizza-xxxxx.turso.io`
- Token: `eyJhbGc...` (lungo, copialo tutto)

### 5️⃣ Migra Dati Attuali

Se hai già dati nel database locale:

```bash
# Esporta database locale
sqlite3 antigravipizza.db .dump > dump.sql

# Importa su Turso
turso db shell antigravipizza < dump.sql

# Verifica import
turso db shell antigravipizza

# Dentro la shell:
SELECT COUNT(*) FROM Recipes;
SELECT COUNT(*) FROM Ingredients;
.exit
```

### 6️⃣ Configura App

#### Installa dipendenza

```bash
npm install @libsql/client
```

#### Aggiungi env vars

Crea/modifica `.env`:
```bash
DB_TYPE=turso
TURSO_DATABASE_URL=libsql://antigravipizza-[tuo-username].turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

#### Configura Render

1. Vai su Render Dashboard
2. Seleziona il tuo servizio
3. Environment → Add Environment Variables:
   - `DB_TYPE` = `turso`
   - `TURSO_DATABASE_URL` = `libsql://antigravipizza-xxxxx.turso.io`
   - `TURSO_AUTH_TOKEN` = `eyJhbGc...`
4. Salva (Render farà redeploy automatico)

### 7️⃣ Test

```bash
# Test locale
npm start

# Verifica nel browser che funzioni
# I dati sono ora su Turso, non più in locale!
```

## 📋 Comandi Utili

```bash
# Lista tutti i database
turso db list

# Accedi alla shell SQL
turso db shell antigravipizza

# Vedi URL e info
turso db show antigravipizza

# Crea nuovo token (se serve)
turso db tokens create antigravipizza

# Elimina database (ATTENZIONE!)
turso db destroy antigravipizza
```

## 🔄 Backup e Restore

### Backup
```bash
# Export completo
turso db shell antigravipizza .dump > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
# Da file backup
turso db shell antigravipizza < backup_20241219.sql
```

## 🌍 Dashboard Web

Puoi anche gestire tutto dalla dashboard web:
https://turso.tech/app

## ⚡ Vantaggi vs Database Locale su Render

| Feature | Locale (Render) | Turso |
|---------|----------------|-------|
| Persistenza | ❌ Persa a ogni deploy | ✅ Sempre persistente |
| Backup | ❌ Manuale | ✅ Automatico |
| Scalabilità | ❌ Single instance | ✅ Edge distributed |
| Latenza | ⚡ Locale | ⚡⚡ Edge (più veloce) |
| Costo | ✅ Free | ✅ Free (5GB) |
| Setup | ✅ Zero | ⚙️ 10 minuti |

## 🆘 Troubleshooting

### Errore: `command not found: turso`
Riavvia il terminale dopo installazione.

### Errore: `TURSO_AUTH_TOKEN invalid`
Rigenera token: `turso db tokens create antigravipizza`

### Import fallisce
Verifica sintassi SQL:
```bash
# Test su database vuoto
turso db create test-import
turso db shell test-import < dump.sql
```

## 📚 Documentazione

- Docs: https://docs.turso.tech/
- CLI Reference: https://docs.turso.tech/reference/turso-cli
- LibSQL Client: https://github.com/tursodatabase/libsql-client-ts

## 🎯 Next Steps

Dopo aver completato il setup:
1. ✅ Test locale con Turso
2. ✅ Deploy su Render con env vars
3. ✅ Verifica app funziona
4. ✅ Fai un deploy di prova per verificare persistenza
5. 🎉 Database persistente per sempre!
