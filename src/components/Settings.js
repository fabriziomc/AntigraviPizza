// ============================================
// SETTINGS COMPONENT
// ============================================

import { exportData, importData, clearAllData, getArchetypeWeights, updateArchetypeWeight, resetArchetypeWeights } from '../modules/database.js';
import { showToast } from '../utils/helpers.js';

/**
 * Render Settings view
 */
export async function renderSettings() {
  const settingsView = document.getElementById('settings-view');

  // Load saved oven temperature
  const savedOvenTemp = localStorage.getItem('maxOvenTemp') || '250';

  settingsView.innerHTML = `
    <div class="settings-container fade-in">
      <div class="page-header">
        <h1 class="page-title">Impostazioni</h1>
        <p class="page-description">Gestisci i tuoi dati e le preferenze dell'applicazione</p>
      </div>

      <div class="settings-grid">
        <!-- Oven Settings Section -->
        <section class="settings-card">
          <div class="card-header">
            <span class="card-icon">🔥</span>
            <h2>Impostazioni Forno</h2>
          </div>
          <div class="card-body">
            <p class="card-description">
              Indica la temperatura massima raggiungibile dal tuo forno per calcolare i tempi di cottura ottimali.
            </p>
            
            <div class="form-group">
              <label for="maxOvenTemp" class="form-label">Temperatura Massima (°C)</label>
              <input type="number" id="maxOvenTemp" class="form-input" 
                     min="200" max="500" step="10" value="${savedOvenTemp}">
              <small class="text-muted" style="display: block; margin-top: 0.5rem;">
                Tipiche: 250°C (domestico), 280°C (gas), 350°C (professionale), 450°C (legna)
              </small>
            </div>
            
            <button id="btnSaveOvenSettings" class="btn btn-primary">
              <span class="icon">💾</span>
              Salva Impostazioni Forno
            </button>
          </div>
        </section>

        <!-- Data Management Section -->
        <section class="settings-card">
          <div class="card-header">
            <span class="card-icon">💾</span>
            <h2>Gestione Dati</h2>
          </div>
          <div class="card-body">
            <p class="card-description">
              Esporta e importa il database completo (ricette, serate, ospiti).
            </p>
            
            <div class="action-group">
              <button id="btnExportDB" class="btn btn-primary">
                <span class="icon">⬇️</span>
                Esporta Database
              </button>
              <p class="action-help">Scarica un backup completo del database sul tuo PC. Fai questo PRIMA di ogni deploy per salvare i tuoi dati.</p>
            </div>

            <div class="action-group">
              <input type="file" id="fileImportDB" accept=".json" style="display: none;">
              <button id="btnImportDB" class="btn btn-secondary">
                <span class="icon">⬆️</span>
                Importa Database
              </button>
              <p class="action-help">Ripristina il database da un file di backup precedente. Sostituirà tutti i dati attuali.</p>
            </div>


          </div>
        </section>

        <!-- Archetype Weights Section -->
        <section class="settings-card">
          <div class="card-header">
            <span class="card-icon">⚖️</span>
            <h2>Pesi Archetipi Ricette</h2>
          </div>
          <div class="card-body">
            <p class="card-description">
              Controlla la frequenza con cui vengono generati i diversi tipi di pizza.
              I valori rappresentano la probabilità relativa (totale: 100%).
            </p>
            
            <div id="archetypeWeightsContainer" class="archetype-weights-grid">
              <!-- Will be populated by JavaScript -->
            </div>
            
            <div class="weight-total" id="weightTotal">
              Totale: <span id="totalValue">100</span>%
            </div>
            
            <div class="settings-actions">
              <button class="btn btn-secondary" id="resetWeightsBtn">
                🔄 Ripristina Default
              </button>
              <button class="btn btn-primary" id="saveWeightsBtn">
                💾 Salva Modifiche
              </button>
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
            
            <div class="danger-actions-grid">
              <div class="action-group">
                <button id="btnResetArchives" class="btn btn-danger">
                  <span class="icon">🔄</span>
                  Reset Archivi
                </button>
                <p class="action-help">Cancella tutte le ricette e serate pizza, poi ripopola ingredienti base (192) e preparazioni base (64).</p>
              </div>
              
              <div class="action-group">
                <button id="btnReseedDB" class="btn btn-danger">
                  <span class="icon">🌱</span>
                  Ripristina Dati Base
                </button>
                <p class="action-help">Ripopola il database con 192 ingredienti base e 64 preparazioni base. Utile dopo un deploy su Render.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  setupEventListeners();
  populateArchetypeWeights(); // Load and display archetype weights
}

/**
 * Setup event listeners for Settings view
 */
function setupEventListeners() {
  // Save Oven Settings
  document.getElementById('btnSaveOvenSettings').addEventListener('click', () => {
    const temp = document.getElementById('maxOvenTemp').value;
    const tempNum = parseInt(temp);

    if (tempNum < 200 || tempNum > 500) {
      showToast('⚠️ Temperatura deve essere tra 200°C e 500°C', 'warning');
      return;
    }

    localStorage.setItem('maxOvenTemp', temp);
    showToast('✅ Impostazioni forno salvate!', 'success');
  });

  // Export Database (download backup from server)
  document.getElementById('btnExportDB').addEventListener('click', async () => {
    try {
      showToast('💾 Creazione backup in corso...', 'info');

      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success && result.backup) {
        // Download the backup data
        const blob = new Blob([JSON.stringify(result.backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `antigravipizza-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`✅ Backup scaricato! ${result.counts.recipes} ricette, ${result.counts.pizzaNights} serate`, 'success');
      } else {
        throw new Error(result.error || 'Backup failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showToast('❌ Errore durante l\'export: ' + error.message, 'error');
    }
  });

  // Import Database (upload and restore)
  const fileInputDB = document.getElementById('fileImportDB');
  document.getElementById('btnImportDB').addEventListener('click', () => {
    fileInputDB.click();
  });

  fileInputDB.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmed = confirm(
      '⚠️ ATTENZIONE!\n\n' +
      'Questa operazione sostituirà TUTTI i dati attuali con quelli del backup.\n\n' +
      'Vuoi continuare?'
    );

    if (!confirmed) {
      fileInputDB.value = '';
      return;
    }

    try {
      showToast('📥 Caricamento backup in corso...', 'info');

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target.result);

          // Send backup data to server for restore
          const response = await fetch('/api/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backupData)
          });

          const result = await response.json();

          if (result.success) {
            showToast(`✅ Database ripristinato! ${result.counts.recipes} ricette, ${result.counts.pizzaNights} serate`, 'success');

            // Refresh app data
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            throw new Error(result.error || 'Restore failed');
          }
        } catch (err) {
          console.error('Import parse error:', err);
          showToast('❌ File di backup non valido o corrotto', 'error');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Import failed:', error);
      showToast('❌ Errore durante l\'import: ' + error.message, 'error');
    }

    // Reset input
    fileInputDB.value = '';
  });



  // Reset Archives (Recipes, Nights) and Reseed (Ingredients, Preparations)
  document.getElementById('btnResetArchives').addEventListener('click', async () => {
    const confirmed = confirm(
      '🔄 RESET ARCHIVI?\n\n' +
      'Questa azione:\n' +
      '• Cancellerà TUTTE le ricette\n' +
      '• Cancellerà TUTTE le serate pizza\n' +
      '• Ripopolerà gli ingredienti base (192)\n' +
      '• Ripopolerà le preparazioni base (64)\n' +
      '• Ripopolerà le categorie (10)\n\n' +
      'Non può essere annullata.\n\n' +
      'Premi OK per confermare.'
    );

    if (confirmed) {
      try {
        // Import database functions
        const { getAllRecipes, deleteRecipe, getAllPizzaNights, deletePizzaNight } = await import('../modules/database.js');

        // Get all recipes and pizza nights
        const recipes = await getAllRecipes();
        const nights = await getAllPizzaNights();

        // Delete all recipes
        for (const recipe of recipes) {
          await deleteRecipe(recipe.id);
        }

        // Delete all pizza nights
        for (const night of nights) {
          await deletePizzaNight(night.id);
        }

        showToast(`✅ Reset completato: ${recipes.length} ricette e ${nights.length} serate eliminate`, 'success');

        // Use unified seed endpoint
        showToast('🌱 Ripopolamento dati base in corso...', 'info');
        const response = await fetch('/api/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
          showToast(
            `✅ Dati base ripristinati! ${result.results.categories} categorie, ${result.results.ingredients} ingredienti, ${result.results.preparations} preparazioni`,
            'success'
          );

          // Refresh app data
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error(result.error || 'Seed failed');
        }
      } catch (error) {
        console.error('Reset failed:', error);
        showToast('❌ Errore durante il reset: ' + error.message, 'error');
      }
    }
  });

  // Reseed Database (restore base ingredients and preparations)
  document.getElementById('btnReseedDB').addEventListener('click', async () => {
    const confirmed = confirm(
      '🌱 RIPRISTINA DATI BASE?\n\n' +
      'Questa azione ripopolerà il database con:\n' +
      '• 192 ingredienti base\n' +
      '• 64 preparazioni base\n' +
      '• 10 categorie standard\n\n' +
      'I tuoi dati custom e ricette NON saranno toccati.\n\n' +
      'Vuoi continuare?'
    );

    if (!confirmed) return;

    try {
      showToast('🌱 Ripristino dati base in corso...', 'info');

      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `✅ Dati base ripristinati! ${result.results.categories} categorie, ${result.results.ingredients} ingredienti, ${result.results.preparations} preparazioni`,
          'success'
        );

        // Refresh app
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Reseed failed');
      }
    } catch (error) {
      console.error('Reseed failed:', error);
      showToast('❌ Errore durante il ripristino: ' + error.message, 'error');
    }
  });


}

// ============================================
// ARCHETYPE WEIGHTS FUNCTIONS
// ============================================

const ARCHETYPE_LABELS = {
  'combinazioni_db': '📚 Combinazioni Salvate',
  'classica': '🍕 Classica',
  'tradizionale': '👨‍🍳 Tradizionale',
  'terra_bosco': '🍄 Terra e Bosco',
  'fresca_estiva': '🌿 Fresca Estiva',
  'piccante_decisa': '🌶️ Piccante',
  'mare': '🐟 Mare',
  'vegana': '🌱 Vegana'
};

const ARCHETYPE_DESCRIPTIONS = {
  'combinazioni_db': 'Combinazioni salvate nel database',
  'classica': 'Margherita, Marinara style',
  'tradizionale': 'Prosciutto, Funghi, Capricciosa',
  'terra_bosco': 'Funghi porcini, tartufo',
  'fresca_estiva': 'Verdure, pomodorini',
  'piccante_decisa': 'Nduja, peperoncino',
  'mare': 'Pesce, frutti di mare',
  'vegana': 'Solo vegetali'
};

async function populateArchetypeWeights() {
  const container = document.getElementById('archetypeWeightsContainer');
  if (!container) return;

  try {
    const weights = await getArchetypeWeights('default');
    console.log('🔍 Archetype weights received:', weights);
    console.log('🔍 Weights length:', weights.length);

    if (!weights || weights.length === 0) {
      // Show initialization message and button
      container.innerHTML = `
        <div class="empty-state">
          <p class="info-message">⚠️ Nessun peso archetipo trovato nel database</p>
          <p class="help-text">Clicca il pulsante qui sotto per inizializzare i pesi con i valori predefiniti.</p>
          <button id="initWeightsBtn" class="btn btn-primary" style="margin-top: 1rem;">
            🌱 Inizializza Pesi Predefiniti
          </button>
        </div>
      `;

      // Setup initialization button
      const initBtn = document.getElementById('initWeightsBtn');
      if (initBtn) {
        initBtn.addEventListener('click', async () => {
          try {
            showToast('🌱 Inizializzazione pesi in corso...', 'info');

            // Call the reset endpoint which will create the default weights
            const result = await resetArchetypeWeights('default');
            console.log('📥 Init result:', result);

            showToast('✅ Pesi archetipi inizializzati!', 'success');

            // Reload the page to show the weights
            await populateArchetypeWeights();
          } catch (error) {
            console.error('❌ Error initializing weights:', error);
            showToast('❌ Errore durante l\'inizializzazione', 'error');
          }
        });
      }
      return;
    }

    container.innerHTML = weights.map(w => `
      <div class="weight-control">
        <div class="weight-header">
          <label class="weight-label">${ARCHETYPE_LABELS[w.archetype] || w.archetype}</label>
          <span class="weight-value" id="weight-value-${w.archetype}">${w.weight}%</span>
        </div>
        <input 
          type="range" 
          class="weight-slider" 
          id="weight-${w.archetype}"
          min="0" 
          max="50" 
          value="${w.weight}"
          data-archetype="${w.archetype}"
        >
        <p class="weight-description">${ARCHETYPE_DESCRIPTIONS[w.archetype] || w.description || ''}</p>
      </div>
    `).join('');

    console.log('✅ Rendered', weights.length, 'weight controls');

    // Setup slider event listeners
    setupArchetypeWeightsListeners();

    // Calculate initial total
    updateTotalWeight();
  } catch (error) {
    console.error('Error loading archetype weights:', error);
    container.innerHTML = '<p class="error-message">Errore nel caricamento dei pesi archetipi</p>';
  }
}

function setupArchetypeWeightsListeners() {
  // Update sliders
  document.querySelectorAll('.weight-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const archetype = e.target.dataset.archetype;
      const value = e.target.value;
      const valueDisplay = document.getElementById(`weight-value-${archetype}`);
      if (valueDisplay) {
        valueDisplay.textContent = `${value}%`;
      }
      updateTotalWeight();
    });
  });

  // Save button
  const saveBtn = document.getElementById('saveWeightsBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const sliders = document.querySelectorAll('.weight-slider');

      try {
        for (const slider of sliders) {
          const archetype = slider.dataset.archetype;
          const weight = parseInt(slider.value);
          await updateArchetypeWeight(archetype, weight, 'default');
        }

        showToast('✅ Pesi archetipi salvati con successo!', 'success');
      } catch (error) {
        console.error('Error saving weights:', error);
        showToast('❌ Errore nel salvataggio dei pesi', 'error');
      }
    });
  }

  // Reset button
  const resetBtn = document.getElementById('resetWeightsBtn');
  console.log('🔍 Reset button element:', resetBtn);
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      console.log('🔘 Reset button clicked');
      if (confirm('Ripristinare i pesi predefiniti?')) {
        console.log('✅ User confirmed reset');
        try {
          console.log('📡 Calling resetArchetypeWeights...');
          const result = await resetArchetypeWeights('default');
          console.log('📥 Reset result:', result);
          showToast('✅ Pesi ripristinati ai valori predefiniti', 'success');

          // Reload weights
          console.log('🔄 Reloading weights...');
          await populateArchetypeWeights();
          console.log('✅ Weights reloaded');
        } catch (error) {
          console.error('❌ Error resetting weights:', error);
          showToast('❌ Errore nel ripristino dei pesi', 'error');
        }
      } else {
        console.log('❌ User cancelled reset');
      }
    });
  } else {
    console.error('❌ Reset button not found!');
  }
}

function updateTotalWeight() {
  const sliders = document.querySelectorAll('.weight-slider');
  const total = Array.from(sliders).reduce((sum, slider) => sum + parseInt(slider.value), 0);

  const totalElement = document.getElementById('totalValue');
  if (totalElement) {
    totalElement.textContent = total;
    totalElement.style.color = total === 100 ? 'var(--color-success)' : 'var(--color-warning)';
  }
}
