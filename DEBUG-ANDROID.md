# 🐛 Debug: Errore Android "Inizializzazione App"

## Problema
- ✅ **PC**: Funziona (con autorizzazione rete locale)
- ❌ **Android**: Errore "errore nell'inizializzazione dell'app"

## Possibili Cause

### 1. Problema CORS (Più Probabile)
L'app frontend non riesce a comunicare con l'API backend.

### 2. API Non Raggiungibile
L'endpoint `/api/recipes` potrebbe non rispondere correttamente.

### 3. HTTPS Mixed Content
Il browser Android potrebbe bloccare richieste non sicure.

---

## 🔍 Diagnostica Rapida

### Test 1: Verifica API da Smartphone
Apri sul tuo smartphone Android (nel browser):
```
https://TUO-URL.onrender.com/api/recipes
```

**Risultato atteso**: Dovresti vedere un JSON (anche se vuoto: `[]`)

**Se vedi errore**: L'API non funziona correttamente

### Test 2: Controlla Console Browser
Sul PC, apri la console del browser (F12) e guarda gli errori.

**Cerca errori tipo**:
- `CORS policy`
- `Failed to fetch`
- `Network error`

### Test 3: Verifica Logs Render
1. Vai su https://dashboard.render.com
2. Apri il tuo servizio "antigravipizza"
3. Vai su **Logs**
4. Cerca errori recenti

---

## 🔧 Possibili Soluzioni

### Soluzione 1: Verifica URL API nel Frontend

Il frontend potrebbe usare `localhost` invece dell'URL Render.

**Controlla**: `src/lib/db.js` o file simile

**Dovrebbe usare**:
- In produzione: URL relativo `/api/recipes` (non `http://localhost:3000/api/recipes`)
- O variabile d'ambiente

### Soluzione 2: CORS Configuration

Il server potrebbe bloccare richieste cross-origin.

**Verifica**: `server/index.js` ha `app.use(cors())`

### Soluzione 3: Environment Variables

Render potrebbe non avere le variabili d'ambiente corrette.

**Verifica nel dashboard Render**:
- `DB_TYPE=sqlite`
- `SQLITE_DB_PATH=/app/data/antigravipizza.db`
- `NODE_ENV=production`

---

## 📋 Informazioni Necessarie

Per aiutarti meglio, ho bisogno di sapere:

1. **Qual è l'URL Render della tua app?**
   (es. `https://antigravipizza.onrender.com`)

2. **Cosa vedi quando apri `/api/recipes` sul telefono?**
   (Apri `https://TUO-URL.onrender.com/api/recipes` nel browser Android)

3. **Ci sono errori nei log di Render?**
   (Dashboard Render → Logs)

4. **Quale errore esatto vedi nella console del browser PC?**
   (F12 → Console)

---

## 🚀 Prossimi Passi

Una volta che mi dai queste informazioni, posso:
1. Identificare il problema esatto
2. Correggere il codice se necessario
3. Fare un nuovo push su GitHub
4. Render farà automaticamente il redeploy
5. Testare di nuovo da Android

---

**Inviami le informazioni sopra e risolviamo il problema! 🔧**
