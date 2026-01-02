# 🔐 GitHub Push - Risoluzione Errore 403

## Problema
Il push su GitHub ha fallito con errore **403 Permission Denied**.

## Causa
GitHub richiede autenticazione. Ci sono diverse soluzioni:

---

## ✅ Soluzione 1: GitHub Desktop (Più Semplice)

### Passo 1: Scarica GitHub Desktop
1. Vai su https://desktop.github.com
2. Scarica e installa GitHub Desktop
3. Accedi con il tuo account GitHub aziendale

### Passo 2: Apri il Repository
1. In GitHub Desktop: **File** → **Add Local Repository**
2. Seleziona la cartella: `C:\Users\FABRIZIO\.gemini\antigravity\ManagerAgente\AntigraviPizza`
3. Clicca **Add Repository**

### Passo 3: Push
1. Vedrai i commit pronti per il push
2. Clicca **Push origin**
3. ✅ Fatto!

---

## ✅ Soluzione 2: Personal Access Token (PAT)

### Passo 1: Crea un Token
1. Vai su https://github.com/settings/tokens
2. Clicca **Generate new token** → **Generate new token (classic)**
3. Nome: `AntigraviPizza Deploy`
4. Scadenza: **90 days** (o personalizzata)
5. Seleziona scope: **repo** (tutti i permessi repository)
6. Clicca **Generate token**
7. **COPIA IL TOKEN** (lo vedrai solo una volta!)

### Passo 2: Usa il Token per il Push
```powershell
# Nel terminale, esegui:
git push
```

Quando richiesto:
- **Username**: il tuo username GitHub
- **Password**: incolla il **Personal Access Token** (non la password!)

---

## ✅ Soluzione 3: SSH Key (Più Sicura)

### Passo 1: Genera SSH Key
```powershell
ssh-keygen -t ed25519 -C "tua-email@azienda.com"
```
Premi Enter per accettare il percorso predefinito.

### Passo 2: Copia la Chiave Pubblica
```powershell
cat ~/.ssh/id_ed25519.pub
```
Copia tutto l'output.

### Passo 3: Aggiungi a GitHub
1. Vai su https://github.com/settings/keys
2. Clicca **New SSH key**
3. Titolo: `PC Fabrizio`
4. Incolla la chiave pubblica
5. Clicca **Add SSH key**

### Passo 4: Cambia Remote URL
```powershell
cd C:\Users\FABRIZIO\.gemini\antigravity\ManagerAgente\AntigraviPizza
git remote set-url origin git@github.com:fabriziomc/AntigraviPizza.git
git push
```

---

## 🚀 Dopo il Push Riuscito

Una volta che il push è completato:

1. ✅ Verifica su GitHub che i file siano stati caricati
2. 🌐 Vai su https://render.com
3. 📱 Segui la guida in `RENDER-DEPLOYMENT.md`

---

## 💡 Quale Soluzione Scegliere?

- **GitHub Desktop**: La più semplice, interfaccia grafica
- **Personal Access Token**: Veloce, usa la linea di comando
- **SSH Key**: La più sicura, configurazione una tantum

**Consiglio**: Usa **GitHub Desktop** se preferisci un'interfaccia grafica, altrimenti **Personal Access Token** per una soluzione rapida.

---

**Prossimo passo**: Scegli una soluzione, completa il push, poi procediamo con Render! 🚀
