# 🚀 Deploy AntigraviPizza su Render.com

Guida completa per pubblicare la tua app Docker su Render.com e renderla accessibile da smartphone.

## 📋 Prerequisiti

- ✅ Docker funzionante localmente (già fatto!)
- ✅ Account GitHub (gratuito)
- ✅ Account Render.com (gratuito)

---

## 🔧 Passo 1: Preparare il Repository GitHub

### 1.1 Verifica Git
```bash
git status
```

### 1.2 Commit delle modifiche
```bash
git add .
git commit -m "Prepare for Render deployment"
```

### 1.3 Push su GitHub

**Se NON hai ancora un repository GitHub:**
1. Vai su https://github.com/new
2. Crea un nuovo repository (es. `AntigraviPizza`)
3. Scegli **Public** o **Private** (entrambi funzionano con Render)
4. **NON** inizializzare con README (hai già i file)

**Poi esegui:**
```bash
# Sostituisci TUO-USERNAME con il tuo username GitHub
git remote add origin https://github.com/TUO-USERNAME/AntigraviPizza.git
git branch -M main
git push -u origin main
```

**Se hai già un repository GitHub:**
```bash
git push
```

---

## 🌐 Passo 2: Creare Account Render

1. Vai su https://render.com
2. Clicca **"Get Started"**
3. Scegli **"Sign up with GitHub"** (più semplice)
4. Autorizza Render ad accedere ai tuoi repository

---

## 🚀 Passo 3: Deploy dell'Applicazione

### Opzione A: Deploy Automatico (Consigliato)

1. Nel dashboard Render, clicca **"New +"** → **"Web Service"**
2. Connetti il tuo repository GitHub `AntigraviPizza`
3. Render rileverà automaticamente il file `render.yaml`
4. Clicca **"Apply"** per usare la configurazione automatica
5. Clicca **"Create Web Service"**

### Opzione B: Configurazione Manuale

Se Render non rileva `render.yaml`:

1. **Name**: `antigravipizza`
2. **Runtime**: `Docker`
3. **Plan**: `Free`
4. **Docker Command**: (lascia vuoto, usa il CMD dal Dockerfile)

**Environment Variables:**
```
DB_TYPE=sqlite
SQLITE_DB_PATH=/app/data/antigravipizza.db
NODE_ENV=production
PORT=3000
```

**Persistent Disk:**
- Name: `antigravipizza-data`
- Mount Path: `/app/data`
- Size: `1 GB`

5. Clicca **"Create Web Service"**

---

## ⏳ Passo 4: Attendere il Build

Il primo build richiede **3-5 minuti**:
- Render scarica il codice da GitHub
- Costruisce l'immagine Docker
- Avvia il container
- Esegue l'health check

**Monitoraggio:**
- Segui i log in tempo reale nel dashboard
- Cerca il messaggio: `Server is running on http://localhost:3000`

---

## ✅ Passo 5: Verifica Deployment

### 5.1 URL dell'Applicazione

Render ti fornirà un URL tipo:
```
https://antigravipizza.onrender.com
```

### 5.2 Test da Desktop
1. Apri l'URL nel browser
2. Verifica che l'app si carichi correttamente
3. Prova a creare una ricetta di test

### 5.3 Test da Smartphone
1. Apri l'URL sul tuo smartphone
2. Aggiungi ai preferiti per accesso rapido
3. Verifica che tutto funzioni

### 5.4 Test API
Apri nel browser:
```
https://antigravipizza.onrender.com/api/recipes
```
Dovresti vedere una risposta JSON.

---

## 📱 Usare l'App da Smartphone

### Aggiungere alla Home Screen (PWA-like)

**Su iPhone:**
1. Apri l'URL in Safari
2. Tocca l'icona "Condividi"
3. Seleziona "Aggiungi a Home"

**Su Android:**
1. Apri l'URL in Chrome
2. Tocca i tre puntini
3. Seleziona "Aggiungi a schermata Home"

---

## ⚠️ Limitazioni Free Tier

### Sleep dopo Inattività
- L'app va in "sleep" dopo **15 minuti** senza richieste
- Si risveglia in **~30 secondi** alla prima richiesta
- Questo è normale per il piano gratuito

### Come Gestire lo Sleep
- Primo accesso della giornata: aspetta 30 secondi
- Per evitare sleep: usa un servizio di "ping" (es. UptimeRobot)
- O passa al piano Starter ($7/mese) per evitare sleep

---

## 🔄 Aggiornamenti Futuri

### Deploy Automatico
Render è configurato per **auto-deploy**:
1. Fai modifiche al codice localmente
2. Commit e push su GitHub:
   ```bash
   git add .
   git commit -m "Descrizione modifiche"
   git push
   ```
3. Render rileva il push e fa il deploy automaticamente

### Deploy Manuale
Nel dashboard Render:
1. Vai al tuo servizio
2. Clicca **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🐛 Troubleshooting

### Build Fallito
**Controlla i log** nel dashboard Render:
- Errori di dipendenze → verifica `package.json`
- Errori Docker → verifica `Dockerfile`
- Out of memory → il free tier ha limiti di RAM

### App Non Risponde
1. Controlla i **Logs** nel dashboard
2. Verifica che l'health check passi
3. Controlla le **Environment Variables**

### Database Vuoto dopo Restart
- Verifica che il **Persistent Disk** sia configurato
- Mount path deve essere `/app/data`
- Il database si trova in `/app/data/antigravipizza.db`

### Porta Sbagliata
Render usa la variabile `PORT` automaticamente:
- Assicurati che il server usi `process.env.PORT`
- Valore predefinito: `3000`

---

## 💰 Costi

### Free Tier (Attuale)
- ✅ **Costo**: $0/mese
- ✅ **Ore**: 750 ore/mese (più che sufficienti)
- ✅ **Storage**: 1GB per database
- ⚠️ **Sleep**: dopo 15 minuti di inattività

### Upgrade Opzionale
Se vuoi evitare lo sleep:
- **Starter Plan**: $7/mese
- Nessun sleep
- Più risorse

---

## 🎯 Prossimi Passi

1. ✅ Completa il deploy su Render
2. 📱 Testa dall'app dallo smartphone
3. 🔖 Aggiungi alla home screen del telefono
4. 🍕 Inizia a usare AntigraviPizza ovunque!

---

## 📚 Risorse Utili

- **Dashboard Render**: https://dashboard.render.com
- **Documentazione Render**: https://render.com/docs
- **Status Page**: https://status.render.com
- **Support**: https://render.com/support

---

**Buon deployment! 🚀**
