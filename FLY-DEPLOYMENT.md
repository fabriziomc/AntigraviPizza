# 🚀 Deploy AntigraviPizza su Fly.io

## Perché Fly.io?

✅ **3 VM gratuite** (shared-cpu-1x)
✅ **3GB storage persistente GRATIS**
✅ **Database garantito persistente**
✅ **HTTPS automatico**
✅ **Nessuna carta di credito richiesta** (opzionale)

**Costo**: **$0/mese** per uso personale! 🎉

---

## 📋 Prerequisiti

- ✅ Account GitHub (già hai)
- ✅ Codice su GitHub (già fatto)
- ⏳ Account Fly.io (da creare)
- ⏳ Fly CLI installato

---

## 🔧 Passo 1: Installa Fly CLI

### Windows (PowerShell)

```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Verifica Installazione

```bash
fly version
```

Dovresti vedere qualcosa tipo: `flyctl v0.x.x`

---

## 🌐 Passo 2: Crea Account Fly.io

### Opzione A: Via CLI (Consigliato)

```bash
fly auth signup
```

Si aprirà il browser per registrarti.

### Opzione B: Via Web

1. Vai su https://fly.io/app/sign-up
2. Registrati con email o GitHub
3. Verifica email
4. Torna al terminale e fai login:

```bash
fly auth login
```

---

## 🚀 Passo 3: Deploy Applicazione

### 3.1 Vai nella Directory del Progetto

```bash
cd C:\Users\FABRIZIO\.gemini\antigravity\ManagerAgente\AntigraviPizza
```

### 3.2 Crea App su Fly.io

```bash
fly apps create antigravipizza
```

**Nota**: Se il nome è già preso, prova:
- `antigravipizza-fabrizio`
- `my-antigravipizza`
- Fly ti suggerirà alternative

### 3.3 Crea Volume Persistente

**IMPORTANTE**: Questo garantisce che il database NON si cancelli!

```bash
fly volumes create antigravipizza_data --region ams --size 1
```

**Parametri**:
- `antigravipizza_data` = nome volume (deve corrispondere a `fly.toml`)
- `--region ams` = Amsterdam (vicino all'Italia)
- `--size 1` = 1GB (gratis)

### 3.4 Deploy!

```bash
fly deploy
```

**Cosa fa**:
1. Legge `fly.toml`
2. Builda Docker image
3. Pusha su Fly.io
4. Avvia l'app
5. Monta il volume su `/app/data`

**Tempo**: 2-4 minuti

---

## ✅ Passo 4: Verifica Deploy

### 4.1 Controlla Status

```bash
fly status
```

Dovresti vedere:
```
Machines
  ID      STATE   REGION  HEALTH
  xxx     started ams     healthy
```

### 4.2 Apri l'App

```bash
fly open
```

Si aprirà il browser con l'URL tipo:
```
https://antigravipizza.fly.dev
```

### 4.3 Controlla Logs (se serve)

```bash
fly logs
```

---

## 🧪 Passo 5: Test Persistenza Database

### Test Completo

1. **Genera 3 pizze** nell'app
2. **Annota i nomi**
3. **Redeploy**:
   ```bash
   fly deploy
   ```
4. **Riapri l'app**
5. **Le pizze devono essere ancora lì!** ✅

Se le pizze ci sono → **Persistenza funziona!** 🎉

---

## 🔧 Comandi Utili

### Vedere Logs in Tempo Reale

```bash
fly logs -f
```

### SSH nella Macchina

```bash
fly ssh console
```

Poi puoi verificare il database:
```bash
ls -la /app/data
```

### Riavviare l'App

```bash
fly apps restart antigravipizza
```

### Vedere Info Volume

```bash
fly volumes list
```

### Scalare (se serve più risorse)

```bash
fly scale memory 512  # 512MB invece di 256MB
```

---

## 💰 Monitoraggio Costi

### Dashboard

```bash
fly dashboard
```

Si apre il browser con:
- Uso risorse
- Costi (dovrebbe essere $0)
- Metriche

### Limiti Free Tier

- ✅ **3 VM shared-cpu-1x** (256MB RAM)
- ✅ **3GB storage persistente**
- ✅ **160GB traffico/mese**
- ✅ **HTTPS incluso**

**Per app personale**: Sempre gratis! 🎉

---

## 🔄 Deploy Automatico da GitHub

### Setup (Opzionale)

1. Vai su https://fly.io/dashboard
2. Apri la tua app
3. Settings → GitHub Integration
4. Connetti repository
5. Ogni `git push` → deploy automatico!

---

## 🆘 Troubleshooting

### Build Fallito

```bash
fly logs
```

Cerca errori nel build.

### App Non Risponde

```bash
fly status
fly logs
```

Verifica che lo stato sia "healthy".

### Volume Non Montato

```bash
fly ssh console
ls -la /app/data
```

Deve esistere la directory.

### Database Vuoto

Verifica che `SQLITE_DB_PATH` sia corretto:
```bash
fly ssh console
echo $SQLITE_DB_PATH
# Deve mostrare: /app/data/antigravipizza.db
```

---

## 📊 Confronto Railway vs Fly.io

| Feature | Railway Free | Fly.io Free |
|---------|--------------|-------------|
| **VM** | 1 (512MB) | 3 (256MB) |
| **Storage Persistente** | ❌ No | ✅ 3GB |
| **Database Persiste** | ❌ No | ✅ Sì |
| **Credito** | $5/mese | N/A |
| **Costo Reale** | $2-3/mese | $0 |
| **HTTPS** | ✅ Sì | ✅ Sì |
| **Auto Sleep** | No | Sì (ma risveglio veloce) |

**Vincitore**: Fly.io per database persistente! 🏆

---

## 🎯 Checklist Completa

- [ ] Fly CLI installato
- [ ] Account Fly.io creato
- [ ] App creata (`fly apps create`)
- [ ] Volume creato (`fly volumes create`)
- [ ] Deploy completato (`fly deploy`)
- [ ] App aperta e funzionante
- [ ] Test persistenza superato
- [ ] URL salvato per accesso futuro

---

## 📱 Accesso da Smartphone

L'URL Fly.io funziona da qualsiasi dispositivo:
```
https://antigravipizza.fly.dev
```

**Aggiungi alla Home**:
- **iPhone**: Safari → Condividi → Aggiungi a Home
- **Android**: Chrome → Menu → Aggiungi a Home

---

## 🔄 Aggiornamenti Futuri

Quando modifichi il codice:

```bash
git add .
git commit -m "Descrizione modifiche"
git push

# Poi deploy su Fly.io
fly deploy
```

**Il database persisterà!** ✅

---

**Sei pronto! Segui i passi e in 10 minuti sei online con database persistente! 🚀**
