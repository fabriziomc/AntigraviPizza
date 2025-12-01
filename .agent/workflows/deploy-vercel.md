---
description: Deploy AntigraviPizza to Vercel
---

# Deploy su Vercel - Guida Completa

Questa guida ti mostrerà come fare il deploy di AntigraviPizza su Vercel per renderlo accessibile da qualsiasi dispositivo connesso a Internet.

## Prerequisiti

- Account GitHub (gratuito): https://github.com/signup
- Account Vercel (gratuito): https://vercel.com/signup

## Passo 1: Creare Repository GitHub

1. Vai su https://github.com/new
2. Compila i campi:
   - **Repository name**: `AntigraviPizza` (o il nome che preferisci)
   - **Description**: "Gourmet Pizza Recipe Application"
   - **Visibility**: Scegli **Public** o **Private** (entrambi funzionano con Vercel gratuito)
   - **NON** selezionare "Add a README file" (già presente nel progetto)
3. Clicca su **Create repository**
4. **Copia l'URL del repository** che appare (es. `https://github.com/tuousername/AntigraviPizza.git`)

## Passo 2: Collegare il Progetto Locale a GitHub

// turbo
Esegui questi comandi nella directory del progetto:

```bash
git add .
git commit -m "Initial commit - AntigraviPizza app"
git branch -M main
git remote add origin https://github.com/TUOUSERNAME/AntigraviPizza.git
git push -u origin main
```

**IMPORTANTE**: Sostituisci `TUOUSERNAME` con il tuo username GitHub nell'URL!

## Passo 3: Deploy su Vercel

1. Vai su https://vercel.com/signup e crea un account (puoi usare il tuo account GitHub per il login)
2. Una volta loggato, clicca su **"Add New..."** → **"Project"**
3. Clicca su **"Import Git Repository"**
4. Autorizza Vercel ad accedere ai tuoi repository GitHub
5. Seleziona il repository **AntigraviPizza**
6. Vercel rileverà automaticamente che è un progetto Vite
7. Verifica le impostazioni (dovrebbero essere corrette di default):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
8. Clicca su **"Deploy"**

## Passo 4: Attendere il Deploy

Vercel inizierà a:
1. Installare le dipendenze (`npm install`)
2. Costruire il progetto (`npm run build`)
3. Pubblicare l'app

Questo processo richiede circa 1-2 minuti.

## Passo 5: Ottenere l'URL

Una volta completato il deploy:
1. Vercel ti mostrerà un messaggio di successo 🎉
2. Vedrai l'URL della tua app (es. `https://antigravipizza.vercel.app`)
3. Clicca sull'URL per visitare la tua app online!

## Passo 6: Testare da Smartphone

1. Apri il browser sul tuo smartphone
2. Visita l'URL fornito da Vercel
3. L'app dovrebbe funzionare perfettamente!

## Deploy Automatici Futuri

Ogni volta che farai un `git push` su GitHub, Vercel farà automaticamente il deploy della nuova versione! 🚀

Per aggiornare l'app in futuro:
```bash
git add .
git commit -m "Descrizione delle modifiche"
git push
```

## Troubleshooting

### Se il deploy fallisce:
- Controlla i log di build su Vercel
- Verifica che `npm run build` funzioni localmente
- Assicurati che tutte le dipendenze siano in `package.json`

### Se l'app non funziona:
- Apri la console del browser (F12) per vedere eventuali errori
- Verifica che i percorsi delle risorse siano corretti (usa percorsi relativi)

## Note Importanti

- L'URL Vercel è **permanente** e non cambia
- Puoi avere più progetti su Vercel gratuitamente
- Il piano gratuito include 100GB di bandwidth al mese
- HTTPS è incluso automaticamente
