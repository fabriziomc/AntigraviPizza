// ============================================
// SETTINGS COMPONENT
// ============================================

import { exportData, importData, clearAllData, getArchetypeWeights, updateArchetypeWeight, resetArchetypeWeights } from '../modules/database.js';
import { showToast } from '../utils/helpers.js';
import { openModal, closeModal } from '../modules/ui.js';

/**
 * Show a custom confirmation modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message (can include HTML)
 * @param {Function} onConfirm - Callback function to execute on confirmation
 */
function showConfirmModal(title, message, onConfirm) {
  const modalContent = `
    <div class="confirm-modal">
      <h2 class="confirm-title">${title}</h2>
      <div class="confirm-message">${message}</div>
      <div class="confirm-actions">
        <button id="confirmCancel" class="btn btn-secondary">❌ Annulla</button>
        <button id="confirmOK" class="btn btn-danger">✅ Conferma</button>
      </div>
    </div>
  `;

  openModal(modalContent);

  // Setup button listeners
  document.getElementById('confirmCancel').addEventListener('click', () => {
    closeModal();
  });

  document.getElementById('confirmOK').addEventListener('click', () => {
    closeModal();
    onConfirm();
  });
}

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


        <!-- Image Provider Configuration Section -->
        <section class="settings-card">
          <div class="card-header">
            <span class="card-icon">🎨</span>
            <h2>Configurazione Provider Immagini</h2>
          </div>
          <div class="card-body">
            <p class="card-description">
              Il sistema usa <strong>Google Gemini API</strong> - 50 immagini gratuite al giorno.<br>
              Backup: <strong>AI Horde</strong> (illimitato ma più lento, 30-90 secondi).
            </p>
            
            <div class="form-group" style="margin-top: 1rem;">
              <label for="geminiApiKey" class="form-label">
                🔑 Google Gemini API Key (raccomandato)
              </label>
              <input 
                type="password" 
                id="geminiApiKey" 
                class="form-input" 
                placeholder="AIza..."
                value="${localStorage.getItem('geminiApiKey') || ''}"
              >
              <small class="text-muted" style="display: block; margin-top: 0.5rem;">
                Ottieni una chiave gratuita su <a href="https://aistudio.google.com/apikey" target="_blank" style="color: var(--color-primary);">Google AI Studio</a>
                <br>50 immagini al giorno gratuite. Veloce e alta qualità.
              </small>
            </div>

            
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              <button id="btnSaveImageProviderSettings" class="btn btn-primary">
                <span class="icon">💾</span>
                Salva API Key
              </button>
              <button id="btnTestImageProvider" class="btn btn-secondary">
                <span class="icon">🧪</span>
                Test Provider
              </button>
            </div>
            
            <div id="providerTestResult" style="margin-top: 1rem; display: none;">
              <!-- Test results will appear here -->
            </div>
          </div>
        </section>

        <!-- Image Management Section -->
        <section class="settings-card">
          <div class="card-header">
            <span class="card-icon">🖼️</span>
            <h2>Gestione Immagini Pizze</h2>
          </div>
          <div class="card-body">
            <p class="card-description">
              Genera automaticamente immagini per tutte le pizze che ne sono sprovviste.
            </p>
            
            <div class="action-group">
              <button id="btnRegenerateAllImages" class="btn btn-primary">
                <span class="icon">🔄</span>
                Rigenera Immagini Mancanti
              </button>
              <p class="action-help">
                Trova tutte le pizze senza immagine e genera automaticamente immagini di alta qualità.
                <span id="missingImagesCount" style="display:none; color: var(--color-warning); font-weight: bold;"></span>
              </p>
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

  // Save Image Provider Settings
  document.getElementById('btnSaveImageProviderSettings').addEventListener('click', () => {
    const geminiKey = document.getElementById('geminiApiKey').value.trim();

    if (geminiKey) {
      localStorage.setItem('geminiApiKey', geminiKey);
      showToast('✅ Chiave Google Gemini salvata! Pronto per generare immagini.', 'success');
    } else {
      localStorage.removeItem('geminiApiKey');
      showToast('ℹ️ Chiave rimossa, verrà usato AI Horde come fallback', 'info');
    }
  });

  // Test Image Provider
  document.getElementById('btnTestImageProvider').addEventListener('click', async () => {
    const btn = document.getElementById('btnTestImageProvider');
    const resultDiv = document.getElementById('providerTestResult');

    btn.disabled = true;
    btn.innerHTML = '<span class="icon">⏳</span> Testing...';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p style="color: var(--color-gray-400);">🔍 Testing providers...</p>';

    try {
      const { testProvider } = await import('../utils/imageProviders.js');

      const results = [];

      // Test Google Gemini (if API key provided)
      const geminiKey = document.getElementById('geminiApiKey').value.trim();
      if (geminiKey) {
        resultDiv.innerHTML += '<p>🔑 Testing Google Gemini...</p>';
        const geminiResult = await testProvider('gemini');
        results.push({ provider: 'Google Gemini', ...geminiResult });
      } else {
        results.push({ provider: 'Google Gemini', success: false, error: 'API Key non configurata' });
      }

      // Test AI Horde (free backup)
      resultDiv.innerHTML += '<p>🌐 Testing AI Horde (may take 30-90 seconds)...</p>';
      const hordeResult = await testProvider('ai_horde');
      results.push({ provider: 'AI Horde', ...hordeResult });

      // Display results
      let html = '<div style="margin-top: 1rem;"><h4>Risultati Test:</h4><ul style="list-style: none; padding: 0;">';
      results.forEach(r => {
        const icon = r.success ? '✅' : '❌';
        const color = r.success ? 'var(--color-success)' : 'var(--color-error)';
        const message = r.success ? 'Funzionante' : r.error;
        html += `<li style="color: ${color}; margin: 0.5rem 0;">${icon} <strong>${r.provider}</strong>: ${message}</li>`;
      });
      html += '</ul></div>';

      resultDiv.innerHTML = html;

      const anySuccess = results.some(r => r.success);
      if (anySuccess) {
        showToast('✅ Almeno un provider funziona correttamente!', 'success');
      } else {
        showToast('⚠️ Tutti i provider hanno fallito il test', 'warning');
      }

    } catch (error) {
      console.error('Test failed:', error);
      resultDiv.innerHTML = `<p style="color: var(--color-error);">❌ Errore durante il test: ${error.message}</p>`;
      showToast('❌ Errore durante il test dei provider', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span class="icon">🧪</span> Test Provider';
    }
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

        // NOTE: We intentionally do NOT revoke the blob URL.
        // Revoking too early causes empty/corrupted downloads.
        // The browser will automatically clean up when the page is closed.
        // This is the recommended approach for download operations.

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

  // Bulk Regenerate Images
  document.getElementById('btnRegenerateAllImages').addEventListener('click', async () => {
    try {
      const btn = document.getElementById('btnRegenerateAllImages');
      btn.disabled = true;
      btn.innerHTML = '<span class="icon">⏳</span> Caricamento...';

      // Fetch all recipes
      const response = await fetch('/api/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const recipes = await response.json();

      // Filter recipes without images or with broken/old images
      const recipesWithoutImages = recipes.filter(r => {
        // Check for various "no image" conditions
        if (!r.imageUrl) return true; // null or undefined
        if (r.imageUrl.trim() === '') return true; // empty string
        if (r.imageUrl.includes('placeholder')) return true; // placeholder image
        if (r.imageUrl.includes('default')) return true; // default image

        // NEW: Regenerate old pollinations URLs without turbo model (broken because flux is down)
        if (r.imageUrl.includes('pollinations.ai') && !r.imageUrl.includes('model=turbo')) {
          return true; // Old URL without turbo model
        }

        return false;
      });

      console.log(`Found ${recipesWithoutImages.length} recipes without images out of ${recipes.length} total`);

      if (recipesWithoutImages.length === 0) {
        showToast('✅ Tutte le pizze hanno già un\'immagine!', 'success');
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">🔄</span> Rigenera Immagini Mancanti';
        return;
      }

      // Confirm action
      const confirmed = confirm(
        `🖼️ Trovate ${recipesWithoutImages.length} pizze senza immagine.\n\n` +
        `Vuoi generare le immagini per tutte?\n` +
        `(Questa operazione potrebbe richiedere alcuni minuti)`
      );

      if (!confirmed) {
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">🔄</span> Rigenera Immagini Mancanti';
        return;
      }

      // Generate images sequentially
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < recipesWithoutImages.length; i++) {
        const recipe = recipesWithoutImages[i];
        const progress = i + 1;

        // Update button with progress
        btn.innerHTML = `<span class="icon">⏳</span> Generando ${progress}/${recipesWithoutImages.length}...`;

        try {
          // Generate image using multi-provider system
          const toppingIngredients = recipe.baseIngredients?.filter(ing =>
            ing.phase === 'topping' || ing.category !== 'Impasto'
          ) || [];
          const mainIngredients = toppingIngredients.slice(0, 3).map(i => i.name || 'condimento');

          // Detect if pizza has tomato base
          const hasTomato = recipe.baseIngredients?.some(ing =>
            ing.name.toLowerCase().includes('pomodor') ||
            ing.name.toLowerCase().includes('salsa') ||
            ing.name.toLowerCase().includes('passata')
          ) || false;

          // Import image provider
          const { generatePizzaImage } = await import('../utils/imageProviders.js');

          const result = await generatePizzaImage(recipe.name, mainIngredients, {
            hasTomato,
            seed: Date.now() + i // Unique seed for each
          });

          // Update recipe via API
          const updateResponse = await fetch(`/api/recipes/${recipe.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: result.imageUrl })
          });

          if (!updateResponse.ok) throw new Error('API update failed');

          successCount++;
          console.log(`✅ Generated image for: ${recipe.name} using ${result.provider}`);

          // Small delay to avoid overwhelming the image service
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`❌ Failed to generate image for ${recipe.name}:`, error);
          errorCount++;
        }
      }

      // Final feedback
      btn.disabled = false;
      btn.innerHTML = '<span class="icon">🔄</span> Rigenera Immagini Mancanti';

      if (successCount > 0) {
        showToast(
          `✅ Generazione completata! ${successCount} immagini create` +
          (errorCount > 0 ? `, ${errorCount} errori` : ''),
          errorCount > 0 ? 'warning' : 'success'
        );
      } else {
        showToast('❌ Nessuna immagine generata', 'error');
      }

    } catch (error) {
      console.error('Bulk regeneration failed:', error);
      showToast('❌ Errore durante la rigenerazione: ' + error.message, 'error');

      const btn = document.getElementById('btnRegenerateAllImages');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">🔄</span> Rigenera Immagini Mancanti';
      }
    }
  });




  // Reset Archives (Recipes, Nights) and Reseed (Ingredients, Preparations)
  document.getElementById('btnResetArchives').addEventListener('click', async () => {
    // Use custom modal instead of confirm()
    showConfirmModal(
      '🔄 RESET ARCHIVI?',
      'Questa azione:<br>' +
      '• Cancellerà TUTTE le ricette<br>' +
      '• Cancellerà TUTTE le serate pizza<br>' +
      '• Ripopolerà gli ingredienti base (192)<br>' +
      '• Ripopolerà le preparazioni base (64)<br>' +
      '• Ripopolerà le categorie (10)<br><br>' +
      '<strong>Non può essere annullata.</strong>',
      async () => {
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
      });
  });

  // Reseed Database (restore base ingredients and preparations)
  document.getElementById('btnReseedDB').addEventListener('click', async () => {
    // Use custom modal instead of confirm()
    showConfirmModal(
      '🌱 RIPRISTINA DATI BASE?',
      'Questa azione ripopolerà il database con:<br>' +
      '• 192 ingredienti base<br>' +
      '• 64 preparazioni base<br>' +
      '• 10 categorie standard<br><br>' +
      'I tuoi dati custom e ricette NON saranno toccati.',
      async () => {

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
  'vegana': '🌱 Vegana',
  'dolce_salato': '🍯 Dolce/Salato',
  'fusion': '🌟 Fusion'
};

const ARCHETYPE_DESCRIPTIONS = {
  'combinazioni_db': 'Combinazioni salvate nel database',
  'classica': 'Margherita, Marinara style',
  'tradizionale': 'Prosciutto, Funghi, Capricciosa',
  'terra_bosco': 'Funghi porcini, tartufo',
  'fresca_estiva': 'Verdure, pomodorini',
  'piccante_decisa': 'Nduja, peperoncino',
  'mare': 'Pesce, frutti di mare',
  'vegana': 'Solo vegetali',
  'dolce_salato': 'Equilibrio dolce/salato',
  'fusion': 'Interpretazioni creative e contemporanee'
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
