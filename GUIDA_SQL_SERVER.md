# Guida alla Risoluzione del Problema di Autenticazione SQL Server

## 🔍 Diagnosi del Problema

Sia l'autenticazione SQL che Windows Authentication hanno fallito con la libreria Node.js `mssql`, mentre `sqlcmd` funziona correttamente. Questo indica che il problema è nella **configurazione del SQL Server**, non nel codice.

## ✅ Cosa Funziona
- ✅ `sqlcmd` si connette correttamente
- ✅ Database e tabelle create
- ✅ Dati importati con successo

## ❌ Cosa NON Funziona
- ❌ Libreria Node.js `mssql` (errore ELOGIN)
- ❌ Tutte le configurazioni di connessione testate
- ❌ Sia SQL Auth che Windows Auth

## 🛠️ SOLUZIONI DA PROVARE

### Soluzione 1: Abilitare Autenticazione Mista (SQL Server and Windows)

1. Apri **SQL Server Management Studio (SSMS)**
2. Connettiti al server `10.1.1.140`
3. Click destro sul server → **Properties**
4. Vai su **Security**
5. Seleziona **"SQL Server and Windows Authentication mode"**
6. Click **OK**
7. **RIAVVIA il servizio SQL Server** (importante!)

```powershell
# Per riavviare SQL Server da PowerShell (esegui come amministratore)
Restart-Service MSSQLSERVER
```

### Soluzione 2: Verificare e Abilitare l'utente 'sa'

1. In SSMS, espandi **Security** → **Logins**
2. Trova l'utente **sa**
3. Click destro → **Properties**
4. Vai su **Status**
5. Assicurati che:
   - **Permission to connect to database engine**: **Grant**
   - **Login**: **Enabled**
6. Se necessario, cambia la password:
   - Vai su **General**
   - Imposta una nuova password (senza caratteri speciali come #)
   - Deseleziona "Enforce password policy" se necessario
7. Click **OK**

### Soluzione 3: Abilitare TCP/IP

1. Apri **SQL Server Configuration Manager**
2. Espandi **SQL Server Network Configuration**
3. Click su **Protocols for MSSQLSERVER** (o il tuo instance name)
4. Click destro su **TCP/IP** → **Enable**
5. Click destro su **TCP/IP** → **Properties**
6. Vai su **IP Addresses**
7. Scorri fino a **IPAll**
8. Assicurati che **TCP Port** sia **1433**
9. Click **OK**
10. **RIAVVIA il servizio SQL Server**

### Soluzione 4: Verificare Firewall

```powershell
# Verifica se la porta 1433 è aperta
Test-NetConnection -ComputerName 10.1.1.140 -Port 1433

# Se il test fallisce, aggiungi regola firewall (su SQL Server)
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

### Soluzione 5: Cambiare Password (senza caratteri speciali)

La password attuale `pass#123` contiene `#` che potrebbe causare problemi.

1. In SSMS, cambia la password di `sa` con una senza caratteri speciali
2. Esempio: `Pass123456`
3. Aggiorna il file `.env.mssql`:
   ```
   DB_PASSWORD=Pass123456
   ```

## 🧪 TEST DOPO OGNI MODIFICA

Dopo ogni modifica, testa la connessione:

```bash
# Copia la configurazione SQL Server
copy .env.mssql .env

# Testa la connessione
node server/test-connection.js
```

## 📋 CHECKLIST COMPLETA

- [ ] SQL Server in modalità "SQL Server and Windows Authentication"
- [ ] Servizio SQL Server riavviato dopo la modifica
- [ ] Utente 'sa' abilitato e con permessi
- [ ] Password senza caratteri speciali
- [ ] TCP/IP abilitato in SQL Server Configuration Manager
- [ ] Porta 1433 configurata correttamente
- [ ] Servizio SQL Server riavviato dopo modifica TCP/IP
- [ ] Firewall permette connessioni sulla porta 1433
- [ ] Test connessione con `node server/test-connection.js` riuscito

## 🎯 SOLUZIONE ALTERNATIVA IMMEDIATA

Se non puoi modificare la configurazione del SQL Server immediatamente, continua ad usare la modalità locale:

```bash
avvia_app_locale.bat
```

L'applicazione funziona perfettamente con IndexedDB locale. I dati sono già stati migrati su SQL Server e sono pronti per quando risolverai il problema di autenticazione.

## 📞 SUPPORTO

Se dopo aver provato tutte le soluzioni il problema persiste, potrebbe essere necessario:
1. Contattare l'amministratore del SQL Server
2. Verificare i log di SQL Server per errori specifici
3. Controllare le policy di sicurezza aziendali che potrebbero bloccare le connessioni
