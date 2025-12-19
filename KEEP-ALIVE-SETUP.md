# Keep-Alive Setup per Render

## Endpoint Implementato

Ho aggiunto 3 endpoint di health check in `server/routes.js`:

### 1. `/api/health` (raccomandato)
Risposta rapida per verificare che il servizio sia attivo.

### 2. `/api/keep-alive`
Stesso scopo, nome più esplicito.

### 3. `/api/status` 
Più dettagliato, include statistiche database.

## URL da Monitorare

Quando l'app è su Render:
```
https://tuo-app-name.onrender.com/api/health
```

## Servizi Gratuiti Raccomandati

### 🏆 SCELTA #1: UptimeRobot (MIGLIORE)
- **Sito**: https://uptimerobot.com
- **Piano Free**: 50 monitor, check ogni 5 minuti
- **Setup**:
  1. Registrati gratuitamente
  2. Add New Monitor
  3. Monitor Type: HTTP(s)
  4. URL: `https://tuo-app-name.onrender.com/api/health`
  5. Monitoring Interval: 5 minutes
  6. Alert Contacts: inserisci email
  
**Vantaggi**: 
- ✅ Più popolare e affidabile
- ✅ 50 monitor gratis (ne serve solo 1)
- ✅ Status page pubblico incluso
- ✅ Email/SMS alerts
- ✅ Multi-location checks

### 🥈 SCELTA #2: Freshping (ALTERNATIVA)
- **Sito**: https://www.freshping.io
- **Piano Free**: 50 siti, check ogni 1 minuto (meglio!)
- **Setup**: Similar a UptimeRobot
  
**Vantaggi**:
- ✅ Check ogni 1 minuto (VS 5 di UptimeRobot)
- ✅ 50 websites gratis
- ✅ Global checks
- ✅ Performance metrics

### 🥉 SCELTA #3: StatusCake
- **Sito**: https://www.statuscake.com
- **Piano Free**: 10 monitor, check ogni 5 minuti

## Come Configurare UptimeRobot (PASSO-PASSO)

1. **Vai su** https://uptimerobot.com
2. **Sign Up** (gratis, serve solo email)
3. **Conferma email** e accedi
4. **Dashboard** → Click **"+ Add New Monitor"**
5. **Compila il form**:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `AntigraviPizza`
   - URL: `https://tuo-app-name.onrender.com/api/health`
   - Monitoring Interval: `5 minutes`
6. **Alert Contacts**:
   - Add new alert contact (la tua email)
7. **Create Monitor**

✅ **FATTO!** Il servizio farà una chiamata GET ogni 5 minuti tenendo l'app sveglia su Render.

## Come Trovare l'URL Render

1. Accedi a https://dashboard.render.com
2. Clicca sul tuo servizio AntigraviPizza
3. L'URL è in alto, formato: `https://antigravipizza-xxxx.onrender.com`
4. Aggiungi `/api/health` alla fine

## Test Manuale

Prova l'endpoint localmente:
```bash
# Locale
curl http://localhost:3001/api/health

# Render (dopo deploy)
curl https://tuo-app-name.onrender.com/api/health
```

Risposta attesa:
```json
{
  "status": "ok",
  "timestamp": "2024-12-19T19:46:00.000Z",
  "uptime": 123.45,
  "service": "AntigraviPizza API"
}
```

## Note Render Free Tier

- Apps su Render free tier vanno in sleep dopo 15 minuti di inattività
- UptimeRobot ping ogni 5 minuti previene lo sleep
- L'app si riavvia in ~30 secondi alla prima richiesta dopo sleep
- Con UptimeRobot → **zero downtime** agli utenti! 🎉
