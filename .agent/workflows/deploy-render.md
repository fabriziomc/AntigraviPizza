---
description: Deploy AntigraviPizza to Render
---

# Deploy to Render.com

Guida completa per il deploy di AntigraviPizza su Render.com.

## Prerequisiti

- Account Render.com (gratuito): https://render.com/
- Repository GitHub con il codice

## Step 1: Crea Account Render

1. Vai su https://render.com/
2. Clicca "Get Started"
3. Registrati con GitHub (consigliato)

## Step 2: Nuovo Web Service

1. Nel Dashboard Render, clicca **"New +"** → **"Web Service"**
2. Connetti il tuo repository GitHub `fabriziomc/AntigraviPizza`
3. Render rileverà automaticamente il `render.yaml`

## Step 3: Configurazione Automatica

Render userà il file `render.yaml` che configura:
- ✅ Build: `npm install && npm run build`
- ✅ Start: `node server/index.js`
- ✅ Persistent Disk: 1GB montato su `/app/data`
- ✅ Environment: `NODE_ENV=production`, `DB_TYPE=sqlite`

## Step 4: Deploy

1. Clicca **"Create Web Service"**
2. Render inizierà il build automaticamente
3. Attendi 2-3 minuti

## Step 5: Seed Database (Prima volta)

Dopo il primo deploy, vai nel Dashboard → Service → **"Shell"**:

```bash
node server/seed-categories.js
node server/seed-ingredients.js
node server/seed-preparations.js
```

## Step 6: Ottieni URL

Il tuo URL sarà tipo:
```
https://antigravipizza.onrender.com
```

## Auto-Deploy

Ogni push su `main` triggera un deploy automatico! 🚀

## Free Tier Limits

- ✅ 750 ore/mese (gratis)
- ⚠️ Il servizio "dorme" dopo 15 min di inattività
- ⚠️ Primo accesso dopo sleep: ~30 secondi di attesa

## Troubleshooting

### Build fallisce
- Controlla i build logs nel Dashboard
- Verifica che `package.json` abbia tutte le dipendenze

### Database vuoto
- Esegui i seed scripts via Shell

### App non risponde
- Controlla che il server ascolti su `process.env.PORT`
- Verifica i logs nel Dashboard
