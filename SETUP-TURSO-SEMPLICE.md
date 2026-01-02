# 🚀 Setup Turso per AntigraviPizza (Metodo Semplificato)

Grazie per aver installato il package `@libsql/client`! Ora completiamo il setup **senza bisogno di CLI**.

---

## ✅ Passo 1: Crea Account Turso

1. Vai su: **https://app.turso.tech/signup**
2. Registrati con **GitHub** (più veloce) o Google/Email
3. Conferma l'account

---

## ✅ Passo 2: Crea il Database

Una volta dentro la Dashboard:

1. Clicca **"Create Database"** (o "New Database")
2. **Nome database**: `antigravipizza`
3. **Location**: Scegli la più vicina (es. `fra` per Frankfurt)
4. Clicca **"Create"**

---

## ✅ Passo 3: Ottieni le Credenziali

Nella pagina del database che hai appena creato troverai:

### A) Database URL
```
libsql://antigravipizza-[tuo-username].turso.io
```
📋 **Copialo** (c'è un bottone "Copy" accanto)

### B) Auth Token

1. Cerca la sezione **"Tokens"** o **"Create Token"**
2. Clicca su **"Create Token"** o **"Generate New Token"**
3. (Opzionale) Dai un nome: `antigravipizza-token`
4. 📋 **COPIA IL TOKEN SUBITO** - inizia con `eyJ...`

⚠️ **IMPORTANTE**: Una volta chiusa la finestra, non potrai più vedere il token!

---

## ✅ Passo 4: Configura l'App

Crea (o modifica) il file `.env` nella root del progetto:

```env
DB_TYPE=turso
TURSO_DATABASE_URL=libsql://antigravipizza-[tuo-username].turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-long-token-here...
```

Sostituisci:
- `[tuo-username]` con il tuo username Turso
- `eyJhbGc...` con il token che hai copiato

---

## ✅ Passo 5: Test Locale

```bash
npm start
```

Apri **http://localhost:3001** e verifica che l'app funzioni!

Il database partirà vuoto, ma l'app dovrebbe:
- Connettersi correttamente
- Creare le tabelle automaticamente
- Permetterti di aggiungere ingredienti e ricette

---

## ✅ Passo 6: Deploy su Render

1. Vai sulla **Dashboard di Render**
2. Seleziona la tua app **AntigraviPizza**
3. Vai su **"Environment"** → **"Environment Variables"**
4. Aggiungi/Modifica:
   - `DB_TYPE` = `turso`
   - `TURSO_DATABASE_URL` = (il tuo URL)
   - `TURSO_AUTH_TOKEN` = (il tuo token)
5. **Salva** → Render farà il redeploy automatico

---

## 📊 Migrazione Dati (Opzionale)

Se vuoi copiare i dati attuali da SQLite a Turso:

1. Nella Dashboard Turso, apri il tuo database
2. Clicca su **"SQL Console"** o **"Shell"**
3. Puoi eseguire query SQL direttamente

Oppure, più semplice:
- Fai partire l'app con Turso (database vuoto)
- Usa la funzione "Upload ricette" che hai nell'app
- Importa le ricette che avevi esportato da SQLite

---

## 🆘 Problemi?

**Errore di connessione?**
- Verifica che `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` siano corretti
- Controlla che non ci siano spazi extra nel file `.env`

**Database vuoto?**
- Normale! L'app creerà le tabelle al primo avvio
- Puoi popolare i dati manualmente o importarli

**Altro?**
- Scrivimi e ti aiuto! 🚀
