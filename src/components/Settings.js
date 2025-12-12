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
            
            <div class="action-group">
              <button id="btnResetRecipesAndNights" class="btn btn-danger">
                <span class="icon">🔄</span>
                Reset Ricette/Serate
              </button>
              <p class="action-help">Cancella tutte le ricette e serate pizza. Mantiene ospiti, ingredienti, preparazioni e archetipi.</p>
            </div>

            <div class="action-group">
              <button id="btnReseedIngredients" class="btn btn-warning">
                <span class="icon">🌱</span>
                Reseed Ingredienti
              </button>
              <p class="action-help">Ripopola il database con gli ingredienti base. Usa dopo un reset o se mancano ingredienti.</p>
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

  // Reset Recipes and Pizza Nights
  document.getElementById('btnResetRecipesAndNights').addEventListener('click', async () => {
    const confirmed = confirm(
      '🔄 RESET RICETTE E SERATE?\n\n' +
      'Questa azione cancellerà:\n' +
      '• TUTTE le ricette\n' +
      '• TUTTE le serate pizza\n\n' +
      'Saranno mantenuti:\n' +
      '• Ospiti\n' +
      '• Ingredienti e preparazioni\n' +
      '• Archetipi\n\n' +
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

        // Refresh app data
        if (window.refreshData) {
          await window.refreshData();
        }
      } catch (error) {
        console.error('Reset failed:', error);
        showToast('❌ Errore durante il reset', 'error');
      }
    }
  });

  // Reseed Ingredients
  document.getElementById('btnReseedIngredients').addEventListener('click', async () => {
    const confirmed = confirm(
      '🌱 RESEED INGREDIENTI?\\n\\n' +
      'Questa azione ripopolerà il database con gli ingredienti base.\\n' +
      'Gli ingredienti custom aggiunti manualmente NON saranno eliminati.\\n\\n' +
      'Premi OK per confermare.'
    );

    if (confirmed) {
      try {
        showToast('🌱 Seeding ingredienti in corso...', 'info');

        const response = await fetch('/api/seed-ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to seed ingredients');

        const result = await response.json();
        showToast(`✅ ${result.count || 136} ingredienti seedati con successo!`, 'success');

        // Also seed archetype weights
        await fetch('/api/seed-archetype-weights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('Reseed failed:', error);
        showToast('❌ Errore durante il reseed', 'error');
      }
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
      container.innerHTML = '<p class="error-message">Nessun peso archetipo trovato nel database</p>';
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
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Ripristinare i pesi predefiniti?')) {
        try {
          await resetArchetypeWeights('default');
          showToast('✅ Pesi ripristinati ai valori predefiniti', 'success');

          // Reload weights
          await populateArchetypeWeights();
        } catch (error) {
          console.error('Error resetting weights:', error);
          showToast('❌ Errore nel ripristino dei pesi', 'error');
        }
      }
    });
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
