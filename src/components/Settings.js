// ============================================
// SETTINGS COMPONENT
// ============================================

import { exportData, importData, clearAllData } from '../modules/database.js';
import { showToast } from '../utils/helpers.js';

/**
 * Render Settings view
 */
export async function renderSettings() {
    const settingsView = document.getElementById('settings-view');

    settingsView.innerHTML = `
    <div class="settings-container fade-in">
      <div class="page-header">
        <h1 class="page-title">Impostazioni</h1>
        <p class="page-description">Gestisci i tuoi dati e le preferenze dell'applicazione</p>
      </div>

      <div class="settings-grid">
        <!-- Data Management Section -->
        <section class="settings-card">
          <div class="card-header">
            <span class="card-icon">💾</span>
            <h2>Gestione Dati</h2>
          </div>
          <div class="card-body">
            <p class="card-description">
              Esporta i tuoi dati per backup o importali su un altro dispositivo.
            </p>
            
            <div class="action-group">
              <button id="btnExport" class="btn btn-primary">
                <span class="icon">⬇️</span>
                Download Backup
              </button>
              <p class="action-help">Scarica tutte le ricette e le serate pizza in un file JSON.</p>
            </div>

            <div class="action-group">
              <input type="file" id="fileImport" accept=".json" style="display: none;">
              <button id="btnImport" class="btn btn-secondary">
                <span class="icon">⬆️</span>
                Carica Backup
              </button>
              <p class="action-help">Ripristina i dati da un file di backup precedente.</p>
            </div>
          </div>
        </section>

        <!-- Danger Zone Section -->
        <section class="settings-card danger-zone">
          <div class="card-header">
            <span class="card-icon">⚠️</span>
            <h2>Zona Pericolosa</h2>
          </div>
          <div class="card-body">
            <p class="card-description">
              Queste azioni sono distruttive e non possono essere annullate.
            </p>
            
            <div class="action-group">
              <button id="btnDeleteAll" class="btn btn-danger">
                <span class="icon">🗑️</span>
                Elimina Tutto
              </button>
              <p class="action-help">Cancella permanentemente tutte le ricette e i dati.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

    setupEventListeners();
}

/**
 * Setup event listeners for Settings view
 */
function setupEventListeners() {
    // Export Data
    document.getElementById('btnExport').addEventListener('click', async () => {
        try {
            const data = await exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `antigravipizza-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('✅ Backup scaricato con successo!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            showToast('❌ Errore durante il download del backup', 'error');
        }
    });

    // Import Data Trigger
    const fileInput = document.getElementById('fileImport');
    document.getElementById('btnImport').addEventListener('click', () => {
        fileInput.click();
    });

    // Import Data Action
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const result = await importData(data);

                    let message = `Importazione completata: ${result.recipesImported} ricette`;
                    if (result.pizzaNightsImported > 0) {
                        message += `, ${result.pizzaNightsImported} serate`;
                    }

                    if (result.errors.length > 0) {
                        console.warn('Import errors:', result.errors);
                        message += `. ${result.errors.length} errori (vedi console)`;
                        showToast(`⚠️ ${message}`, 'warning');
                    } else {
                        showToast(`✅ ${message}`, 'success');
                    }

                    // Refresh app data
                    if (window.refreshData) {
                        await window.refreshData();
                    }
                } catch (err) {
                    console.error('Import parse error:', err);
                    showToast('❌ File di backup non valido', 'error');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Import failed:', error);
            showToast('❌ Errore durante il caricamento del backup', 'error');
        }

        // Reset input
        fileInput.value = '';
    });

    // Delete All Data
    document.getElementById('btnDeleteAll').addEventListener('click', async () => {
        const confirmed = confirm(
            '⚠️ SEI SICURO?\n\n' +
            'Questa azione cancellerà TUTTE le ricette e le serate pizza.\n' +
            'Non può essere annullata.\n\n' +
            'Premi OK per confermare.'
        );

        if (confirmed) {
            try {
                await clearAllData();

                // Also clear the seed data flag so it can be reloaded
                localStorage.removeItem('seedDataLoaded');

                showToast('✅ Tutti i dati sono stati eliminati', 'success');

                // Refresh app data
                if (window.refreshData) {
                    await window.refreshData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                showToast('❌ Errore durante l\'eliminazione dei dati', 'error');
            }
        }
    });
}
