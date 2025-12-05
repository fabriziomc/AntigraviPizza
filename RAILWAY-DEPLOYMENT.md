# 🚂 Deploy AntigraviPizza su Railway.app

## Perché Railway?
- ✅ **$5 credito gratuito/mese** (sufficiente per app personale)
- ✅ **Database persistente INCLUSO** (nessun costo extra)
- ✅ **Supporto Docker nativo**
- ✅ **Deploy automatico da GitHub**
- ✅ **Più semplice di Render**

**Costo stimato**: ~$2-3/mese = **GRATIS** con il credito!

---

## 📋 Prerequisiti

- ✅ Account GitHub (già hai)
- ✅ Codice su GitHub (già fatto)
- ⏳ Account Railway.app (da creare)

---

## 🚀 Passo 1: Crea Account Railway

1. Vai su https://railway.app
2. Clicca **"Start a New Project"** o **"Login"**
3. Scegli **"Login with GitHub"** (più semplice)
4. Autorizza Railway ad accedere ai tuoi repository
5. **Verifica email** se richiesto

### Credito Gratuito
- Railway ti dà **$5/mese gratis**
- Nessuna carta di credito richiesta inizialmente
- Puoi monitorare l'uso nel dashboard

---

## 🎯 Passo 2: Deploy dell'Applicazione

### Opzione A: Deploy da Dashboard (Consigliato)

1. Nel dashboard Railway, clicca **"New Project"**
2. Scegli **"Deploy from GitHub repo"**
3. Seleziona il repository **"AntigraviPizza"**
4. Railway rileverà automaticamente il **Dockerfile** ✅
5. Clicca **"Deploy Now"**

### Opzione B: Deploy con Railway CLI

```bash
# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link al progetto
railway link

# Deploy
railway up
```

---

## ⚙️ Passo 3: Configura Environment Variables

Railway dovrebbe rilevare automaticamente le variabili, ma verifica:

1. Nel progetto Railway, vai su **"Variables"**
2. Aggiungi/Verifica queste variabili:

```
DB_TYPE=sqlite
SQLITE_DB_PATH=/app/data/antigravipizza.db
NODE_ENV=production
PORT=3000
```

3. Clicca **"Save"**

---

## 💾 Passo 4: Configura Volume Persistente

**IMPORTANTE**: Railway supporta volumi persistenti nel free tier!

### Metodo 1: Dalla Dashboard

1. Nel tuo servizio, vai su **"Settings"**
2. Cerca la sezione **"Volumes"** o **"Storage"**
3. Clicca **"Add Volume"**
4. Configura:
   - **Mount Path**: `/app/data`
   - **Size**: Lascia default (Railway gestisce automaticamente)
5. Clicca **"Add"**
6. Railway farà un **redeploy automatico**

### Metodo 2: Variabile d'Ambiente (Alternativa)

Se non vedi l'opzione Volumes:
1. Railway potrebbe gestire automaticamente la persistenza
2. Il database in `/app/data` dovrebbe persistere tra i deploy
3. Testa creando dati e facendo redeploy

---

## ⏳ Passo 5: Attendi il Build

Il primo build richiede **2-4 minuti**:
- Railway scarica il codice da GitHub
- Costruisce l'immagine Docker
- Avvia il container
- Assegna un URL pubblico

**Monitoraggio**:
- Segui i log in tempo reale nel dashboard
- Cerca il messaggio: `Server is running on http://localhost:3000`

---

## ✅ Passo 6: Ottieni l'URL Pubblico

Railway ti fornirà automaticamente un URL tipo:
```
https://antigravipizza-production.up.railway.app
```

Oppure puoi configurare un dominio custom (opzionale):
1. Vai su **"Settings"** → **"Domains"**
2. Clicca **"Generate Domain"**
3. Usa il dominio fornito da Railway

---

## 🧪 Passo 7: Testa l'Applicazione

### Test 1: Verifica Caricamento
1. Apri l'URL Railway nel browser
2. L'app dovrebbe caricarsi correttamente ✅
3. Verifica che non ci siano errori

### Test 2: Genera Pizze (Test Duplicati)
1. Vai alla sezione "Genera Ricette"
2. Genera **10 pizze** in una volta
3. **Verifica**: Tutti i nomi devono essere diversi ✅

### Test 3: Persistenza Database
1. Genera 2-3 pizze
2. Annota i nomi
3. Vai su Railway → **"Deployments"** → **"Redeploy"**
4. Aspetta che completi
5. Riapri l'app
6. **Verifica**: Le pizze devono essere ancora lì! ✅

---

## 📱 Passo 8: Usa da Smartphone

### Aggiungi alla Home Screen

**iPhone**:
1. Apri l'URL in Safari
2. Tocca "Condividi"
3. "Aggiungi a Home"

**Android**:
1. Apri l'URL in Chrome
2. Menu → "Aggiungi a schermata Home"

---

## 🔄 Deploy Automatico

Railway è configurato per **auto-deploy**:
- Ogni `git push` su GitHub
- Railway rileva il cambiamento
- Fa automaticamente rebuild e redeploy
- **Nessuna azione richiesta!** 🎉

---

## 💰 Monitoraggio Costi

### Dashboard Railway
1. Vai su **"Usage"** nel dashboard
2. Monitora:
   - **Compute**: Tempo di esecuzione
   - **Network**: Traffico dati
   - **Storage**: Spazio database

### Stima Mensile
Per un'app personale come AntigraviPizza:
- **Compute**: ~$1.50/mese
- **Network**: ~$0.50/mese
- **Storage**: ~$0.10/mese
- **TOTALE**: ~$2-3/mese
- **Credito gratuito**: $5/mese
- **Risultato**: **GRATIS!** 🎉

---

## 🔧 Troubleshooting

### Build Fallito
**Controlla i log** nel dashboard Railway:
- Errori di dipendenze → verifica `package.json`
- Errori Docker → verifica `Dockerfile`

### App Non Risponde
1. Controlla i **Logs** nel dashboard
2. Verifica le **Environment Variables**
3. Controlla che la porta sia `3000`

### Database Vuoto dopo Restart
1. Verifica che il **Volume** sia configurato su `/app/data`
2. Controlla i logs per errori di permessi
3. Verifica `SQLITE_DB_PATH=/app/data/antigravipizza.db`

### Credito Esaurito
Se superi i $5/mese:
- Railway ti avviserà via email
- Puoi aggiungere una carta di credito
- Oppure ottimizzare l'uso (es. mettere in pausa quando non usi)

---

## 📊 Confronto Render vs Railway

| Feature | Render Free | Railway Free |
|---------|-------------|--------------|
| **Costo** | $0 | $5 credito/mese |
| **Persistent Disk** | ❌ No | ✅ Sì |
| **Sleep** | Dopo 15 min | No sleep |
| **Build Time** | 3-5 min | 2-4 min |
| **Auto Deploy** | ✅ Sì | ✅ Sì |
| **Docker Support** | ✅ Sì | ✅ Sì |

**Vincitore**: Railway per database persistente! 🏆

---

## 🎯 Checklist Completa

- [ ] Account Railway creato
- [ ] Repository GitHub connesso
- [ ] Deploy completato
- [ ] Environment variables configurate
- [ ] Volume persistente configurato
- [ ] URL pubblico ottenuto
- [ ] Test caricamento app ✅
- [ ] Test nomi unici ✅
- [ ] Test persistenza database ✅
- [ ] App aggiunta a home smartphone ✅

---

## 📚 Risorse Utili

- **Dashboard Railway**: https://railway.app/dashboard
- **Documentazione**: https://docs.railway.app
- **Community**: https://discord.gg/railway
- **Status**: https://status.railway.app

---

## 🎉 Prossimi Passi

1. ✅ **Completa il deploy** seguendo questa guida
2. 📱 **Testa da smartphone**
3. 🍕 **Inizia a usare AntigraviPizza ovunque!**
4. 📊 **Monitora l'uso** nel dashboard Railway

---

**Buon deploy su Railway! 🚂**

Se hai problemi, fammi sapere e ti aiuto! 🚀
