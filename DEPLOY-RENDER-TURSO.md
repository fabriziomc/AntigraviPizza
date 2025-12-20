# 🚀 Deploy AntigraviPizza a Render con Turso

## ✅ Prerequisiti Completati

- [x] Database Turso creato e funzionante
- [x] App testata localmente con Turso
- [x] Credenziali pronte (URL e Token)

---

## 📋 Passi per il Deploy

### 1. Accedi a Render Dashboard

Vai su: **https://dashboard.render.com/**

### 2. Trova la tua App

- Cerca **"AntigraviPizza"** nella lista dei tuoi servizi
- Clicca sul nome per aprire le impostazioni

### 3. Configura le Variabili d'Ambiente

1. Nel menu laterale, clicca su **"Environment"**
2. Clicca su **"Add Environment Variable"**
3. Aggiungi/Modifica queste variabili:

```
DB_TYPE = turso
TURSO_DATABASE_URL = libsql://antigravipizza-fabriziomc.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN = eyJhbGc....[il tuo token completo]
PORT = 3001
```

> **💡 Nota**: Usa il pulsante "Copy" per copiare le credenziali dal file `.env` locale per evitare errori di battitura.

### 4. Salva e Fai Redeploy

1. Clicca **"Save Changes"** in fondo alla pagina
2. Render farà automaticamente il **redeploy** dell'app
3. Attendi 2-3 minuti per il completamento

### 5. Verifica il Deploy

1. Una volta completato, clicca su **"Open"** (il link in alto a destra)
2. L'app si apre nel browser
3. Verifica che:
   - La dashboard mostri le ricette
   - Gli ingredienti si carichino
   - Tutto funzioni come in locale

---

## 🔧 Troubleshooting

### "Application Error" dopo il deploy

**Problema**: L'app non si avvia su Render  
**Soluzione**: 
- Verifica che tutte le variabili d'ambiente siano state salvate correttamente
- Controlla i **Logs** nella dashboard di Render per vedere errori specifici

### "Cannot connect to database"

**Problema**: Errore di connessione a Turso  
**Soluzione**:
- Verifica che `TURSO_DATABASE_URL` sia esattamente: `libsql://antigravipizza-fabriziomc.aws-eu-west-1.turso.io`
- Verifica che `TURSO_AUTH_TOKEN` sia il token completo (inizia con `eyJ...`)
- Non ci devono essere spazi prima o dopo i valori

### Database vuoto dopo il deploy

**Problema**: L'app funziona ma non ci sono dati  
**Soluzione**:
- **Normale!** Il database Turso è condiviso tra locale e produzione
- Se vedi le ricette in locale, le vedrai anche su Render
- Se hai dati solo nel vecchio SQLite locale, devi:
  1. Generare nuove ricette dalla app
  2. Oppure usare la funzione "Upload ricette" per importare

---

## 🎯 Vantaggi di Turso su Render

✅ **Database Persistente**: I dati non si perdono più ad ogni deploy  
✅ **Sincronizzazione**: Lo stesso database in locale e produzione  
✅ **Performance**: Turso è molto veloce (basato su SQLite)  
✅ **Scalabilità**: Puoi gestire molto traffico gratuitamente  
✅ **Backup**: Turso fa backup automatici

---

## 📊 Monitoraggio

### Dashboard Turso
- Vai su: **https://app.turso.tech/fabriziomc/databases/antigravipizza**
- Qui puoi vedere:
  - Statistiche di utilizzo (reads, writes)
  - Storage utilizzato
  - Eseguire query SQL direttamente

### Dashboard Render
- Vai su: **https://dashboard.render.com/**
- Monitora:
  - Deploy history
  - Logs in tempo reale
  - Performance dell'app

---

## ✅ Checklist Finale

Prima di considerare il deploy completo, verifica:

- [ ] App aperta e funzionante su Render
- [ ] Dashboard mostra le ricette
- [ ] Puoi generare nuove ricette
- [ ] Le ricette generate appaiono immediatamente
- [ ] Nessun errore nei logs di Render

---

## 🆘 Hai Bisogno di Aiuto?

Se qualcosa non funziona:
1. Controlla i **Logs** su Render Dashboard
2. Verifica le variabili d'ambiente
3. Fammi sapere l'errore specifico che vedi!
