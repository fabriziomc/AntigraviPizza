# 🔧 Fix Database Persistence su Render

## Problema
Il database viene sovrascritto ad ogni nuovo deploy, perdendo tutti i dati.

## Causa
Il persistent disk potrebbe non essere configurato correttamente su Render, anche se è specificato nel `render.yaml`.

---

## ✅ Soluzione: Configurare Persistent Disk Manualmente

### Passo 1: Accedi al Dashboard Render
1. Vai su https://dashboard.render.com
2. Apri il tuo servizio **"antigravipizza"**

### Passo 2: Verifica se il Disco Esiste
1. Nella sidebar, cerca la sezione **"Disks"** o **"Storage"**
2. Controlla se esiste un disco chiamato **"antigravipizza-data"**

#### Se il Disco NON Esiste:

1. Clicca su **"Add Disk"** o **"Create Disk"**
2. Compila i campi:
   - **Name**: `antigravipizza-data`
   - **Mount Path**: `/app/data`
   - **Size**: `1 GB` (sufficiente per SQLite)
3. Clicca **"Save"** o **"Create"**
4. **Importante**: Render farà un redeploy automatico

#### Se il Disco Esiste:

1. Verifica che il **Mount Path** sia `/app/data`
2. Se è diverso, modificalo a `/app/data`
3. Salva le modifiche

### Passo 3: Verifica le Environment Variables

Nella sezione **"Environment"** del servizio, verifica che ci siano:

```
DB_TYPE=sqlite
SQLITE_DB_PATH=/app/data/antigravipizza.db
NODE_ENV=production
PORT=3000
```

Se manca qualcuna, aggiungila.

### Passo 4: Forza un Redeploy

1. Vai alla sezione **"Manual Deploy"**
2. Clicca **"Deploy latest commit"**
3. Aspetta che il deploy completi (3-5 minuti)

---

## 🧪 Test della Persistenza

### Test 1: Crea Dati
1. Apri l'app: `https://TUO-URL.onrender.com`
2. Genera 2-3 pizze
3. Annota i nomi delle pizze

### Test 2: Forza Redeploy
1. Torna al dashboard Render
2. Fai un **Manual Deploy**
3. Aspetta che completi

### Test 3: Verifica Persistenza
1. Riapri l'app
2. **Le pizze create prima dovrebbero essere ancora lì!** ✅

Se le pizze ci sono ancora, la persistenza funziona! 🎉

---

## 🔍 Troubleshooting

### Il disco non appare nelle opzioni
- Render Free tier potrebbe avere limitazioni
- Prova a creare il disco manualmente dalla dashboard
- Contatta il support Render se necessario

### Il database è ancora vuoto dopo il deploy
1. Controlla i **Logs** in Render
2. Cerca errori tipo:
   - `ENOENT: no such file or directory`
   - `Permission denied`
3. Verifica che il path sia esattamente `/app/data`

### Come verificare il mount path nei logs
Nei logs di Render, cerca:
```
Dist path: /app/dist
Index.html exists: true
```

Dovrebbe anche mostrare il path del database.

---

## 📝 Note Importanti

### Backup Manuale (Consigliato)
Usa la funzione **"Download Ricette"** nell'app per fare backup periodici:
1. Vai su "Utilità" nell'app
2. Clicca "Download Ricette"
3. Salva il file JSON sul tuo PC

### Restore da Backup
Se perdi i dati:
1. Vai su "Utilità"
2. Clicca "Upload Ricette"
3. Seleziona il file JSON di backup

---

## 🎯 Checklist Configurazione

- [ ] Disco "antigravipizza-data" creato
- [ ] Mount path impostato a `/app/data`
- [ ] Environment variable `SQLITE_DB_PATH=/app/data/antigravipizza.db`
- [ ] Redeploy completato
- [ ] Test persistenza superato
- [ ] Backup manuale creato

---

**Una volta configurato, il database persisterà attraverso tutti i deploy futuri!** 🎉
