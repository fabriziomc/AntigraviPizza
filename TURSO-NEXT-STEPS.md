# Turso Setup - Passi Rimanenti

## ✅ Fatto Finora

- [x] Installato `@libsql/client`
- [x] Aggiunto supporto Turso in `server/db.js`
- [x] Aperto pagina signup Turso

## 📋 Passi da Completare (solo per te)

### 1. Registrati su Turso (2 minuti)

La pagina di signup è già aperta nel browser! Puoi registrarti con:
- **GitHub** (raccomandato, più veloce)
- **Google**
- **Email**

### 2. Installa Turso CLI

Apri PowerShell e esegui:
```powershell
iwr https://get.tur.so/install.ps1 -useb | iex
```

Poi **riavvia il terminale**.

### 3. Login CLI

```bash
turso auth login
```

Si aprirà il browser per confermare - segui il processo.

### 4. Crea Database

```bash
# Crea database
turso db create antigravipizza

# Mostra URL
turso db show antigravipizza

# Genera token
turso db tokens create antigravipizza
```

**SALVA**:
- URL: `libsql://antigravipizza-[tuo-username].turso.io`
- Token: `eyJhbGc...` (molto lungo, copialo tutto!)

### 5. Migra Dati Attuali

```bash
# Export

 locale
sqlite3 antigravipizza.db .dump > dump.sql

# Import su Turso
turso db shell antigravipizza < dump.sql
```

### 6. Configura App

Crea/modifica `.env`:
```bash
DB_TYPE=turso
TURSO_DATABASE_URL=libsql://antigravipizza-[username].turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

### 7. Test Locale

```bash
npm start
```

Apri http://localhost:3001 e verifica che funzioni!

### 8. Deploy su Render

Render Dashboard → Environment Variables:
- `DB_TYPE` = `turso`
- `TURSO_DATABASE_URL` = (il tuo URL)
- `TURSO_AUTH_TOKEN` = (il tuo token)

Salva → Render farà redeploy automatico.

## 🆘 Se hai problemi

Scrivimi e ti aiuto! Per ogni passo che non riesci a fare, dimmi dove sei bloccato.
