# Come Testare il Sistema di Temi Dinamici

## Prerequisiti
1. Server avviato con `avvia-turso.bat` o `avvia-sqlite.bat`
2. Porta: 3001 (o quella configurata)

## Test Passo-Passo

### 1. Riavvia il Server
**IMPORTANTE**: Ferma il server corrente (Ctrl+C nella console) e riavvialo per caricare le nuove modifiche.

```bash
# Ferma con Ctrl+C, poi:
.\avvia-turso.bat
# oppure
.\avvia-sqlite.bat
```

### 2. Verifica che il Server Sia Attivo
Apri il browser e vai a: `http://localhost:3001`

Dovresti vedere l'applicazione AntigraviPizza.

### 3. Crea una Serata con Tema
1. Vai alla sezione "Pianifica"
2. Clicca "Nuova Serata"
3. Crea una serata con uno di questi nomi:ailed to load resource: the server responded with a status of 500 (Internal Server Error)Comprendi l'errore
guest.html:307 Error loading guest data: Error: Tema non trovato
    at loadGuestData (guest.html:264:27)
loadGuestData @ guest.html:307Comprendi l'erroreailed to load resource: the server responded with a status of 500 (Internal Server Error)Comprendi l'errore
guest.html:307 Error loading guest data: Error: Tema non trovato
    at loadGuestData (guest.html:264:27)
loadGuestData @ guest.html:307Comprendi l'errore
   - "Serata Pizza Estate"
   - "Compleanno Marco"

### 4. Aggiungi Ospiti e Pizze
1. Seleziona almeno un ospite
2. Seleziona almeno una pizza
3. Salva la serata

### 5. Genera QR Codes
1. Nella card della serata appena creata
2. Clicca il pulsante "🎫 QR Codes"
3. Vedrai i QR codes generati per ogni ospite

### 6. Testa la Pagina Guest
Clicca su un QR code oppure copia l'URL sotto il QR e aprilo in una nuova finestra.

**URL Format**: `http://localhost:3001/guest.html#guest/{pizzaNightId}/{guestId}`

### Cosa Dovresti Vedere
✅ Background con gradiente tematico
✅ Emoji del tema (🎄 per Natale, 🎃 per Halloween, etc.)
✅ Effetti animati (neve, pipistrelli, etc.)
✅ Immagine tematica (se disponibile)
✅ Messaggio personalizzato per l'ospite
✅ Decorazioni tematiche

## Troubleshooting

### Problema: Pagina guest.html non si carica
**Soluzione**: Verifica che il server sia stato riavviato dopo le modifiche a `server/index.js`

### Problema: Immagine non appare
**Soluzione**: Normale, abbiamo solo 4 immagini su 10. Il sistema funziona comunque.

### Problema: Tema non corretto
**Soluzione**: Controlla che il titolo della serata contenga le parole chiave (es. "natale", "halloween", "compleanno")

### Problema: Errore API
**Soluzione**: Apri la console del browser (F12) e controlla gli errori. Verifica che il server sia in esecuzione.

## Test Manuale Diretto

Se vuoi testare direttamente senza creare una serata:

1. Trova un ID di una serata esistente nel database
2. Trova un ID di un ospite
3. Apri: `http://localhost:3001/guest.html#guest/{ID-SERATA}/{ID-OSPITE}`

## Verifica Backend

Testa l'endpoint API direttamente:

```
http://localhost:3001/api/pizza-nights/{ID-SERATA}/theme
```

Dovresti ricevere un JSON con:
- `theme`: ID del tema rilevato
- `config`: Configurazione visiva
- `messages`: Array di messaggi
