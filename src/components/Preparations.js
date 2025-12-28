// ============================================
// PREPARATIONS COMPONENT
// ============================================

import { getAllPreparations, createPreparation, updatePreparation, deletePreparation, getAllIngredients, getAllRecipes } from '../modules/database.js';
import { PREPARATION_CATEGORIES } from '../utils/constants.js';
import { showToast } from '../utils/helpers.js';
import { openModal, closeModal } from '../modules/ui.js';

let currentPreparations = [];
let cachedIngredients = [];
let currentSearch = '';

/**
 * Render Preparations view
 */
export async function renderPreparations() {
  const preparationsView = document.getElementById('preparations-view');

  preparationsView.innerHTML = `
    <div class="preparations-container fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">🥫 Preparazioni</h1>
          <p class="page-description">Ricette per ingredienti composti - creme, salse e condimenti</p>
        </div>
        <button class="btn btn-primary" id="newPreparationBtn">
          <span>➕</span>
          Nuova Preparazione
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="search-box" style="margin-bottom: 1rem;">
        <input 
          type="text" 
          id="preparation-search" 
          placeholder="🔍 Cerca preparazione..."
          value="${currentSearch}"
        >
      </div>
      
      <div class="filters-bar" style="margin-bottom: 2rem;">
        <select id="categoryFilter" class="filter-select">
          <option value="">Tutte le categorie</option>
          ${PREPARATION_CATEGORIES.map(cat => `
            <option value="${cat}">${cat}</option>
          `).join('')}
        </select>
        
        <select id="difficultyFilter" class="filter-select">
          <option value="">Tutte le difficoltà</option>
          <option value="Facile">Facile</option>
          <option value="Media">Media</option>
          <option value="Difficile">Difficile</option>
        </select>
      </div>

      <!-- Preparations Grid -->
      <div id="preparationsGrid" class="preparations-grid"></div>
    </div>
  `;

  await renderPreparationsGrid();
  setupEventListeners();
}

/**
 * Render preparations grid
 */
async function renderPreparationsGrid(filters = {}) {
  const grid = document.getElementById('preparationsGrid');

  // Fetch from database
  currentPreparations = await getAllPreparations();
  let filtered = [...currentPreparations];

  // Apply search filter
  if (currentSearch) {
    const search = currentSearch.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  }

  // Apply filters
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  if (filters.difficulty) {
    filtered = filtered.filter(p => p.difficulty === filters.difficulty);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">Nessuna preparazione trovata</h3>
        <p class="empty-description">Prova a cambiare i filtri o crea una nuova preparazione</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(prep => createPreparationCard(prep)).join('');
}

/**
 * Create preparation card
 */
function createPreparationCard(prep) {
  const difficultyColors = {
    'Facile': 'var(--color-success)',
    'Media': 'var(--color-warning)',
    'Difficile': 'var(--color-danger)'
  };

  return `
    <div class="preparation-card" data-prep-id="${prep.id}">
      <div class="preparation-card-header">
        <h3 class="preparation-card-title">${prep.name}</h3>
        <span class="preparation-category-badge">${prep.category}</span>
      </div>
      
      <p class="preparation-description">${prep.description}</p>
      
      <div class="preparation-meta">
        <div class="meta-item">
          <span class="meta-icon">⏱️</span>
          <span>${prep.prepTime}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">🍽️</span>
          <span>${prep.yield} porzioni</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon" style="color: ${difficultyColors[prep.difficulty]}">●</span>
          <span>${prep.difficulty}</span>
        </div>
      </div>
      
      <div class="preparation-card-footer">
        <button class="btn btn-primary btn-sm view-preparation-btn" data-prep-id="${prep.id}">
          <span>📖</span>
          Vedi Ricetta
        </button>
        ${prep.isCustom ? `
          <button class="btn btn-secondary btn-sm edit-preparation-btn" data-prep-id="${prep.id}">
            <span>✏️</span>
            Modifica
          </button>
          <button class="btn btn-ghost btn-sm delete-preparation-btn" data-prep-id="${prep.id}">
            <span>🗑️</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const searchInput = document.getElementById('preparation-search');
  const categoryFilter = document.getElementById('categoryFilter');
  const difficultyFilter = document.getElementById('difficultyFilter');
  const grid = document.getElementById('preparationsGrid');
  const newBtn = document.getElementById('newPreparationBtn');

  // Search listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderPreparationsGrid({
        category: categoryFilter?.value,
        difficulty: difficultyFilter?.value
      });
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      renderPreparationsGrid({
        category: categoryFilter.value,
        difficulty: difficultyFilter.value
      });
    });
  }

  if (difficultyFilter) {
    difficultyFilter.addEventListener('change', () => {
      renderPreparationsGrid({
        category: categoryFilter.value,
        difficulty: difficultyFilter.value
      });
    });
  }

  if (newBtn) {
    newBtn.addEventListener('click', () => showPreparationForm());
  }

  // Event delegation for buttons
  if (grid) {
    grid.addEventListener('click', async (e) => {
      const viewBtn = e.target.closest('.view-preparation-btn');
      const editBtn = e.target.closest('.edit-preparation-btn');
      const deleteBtn = e.target.closest('.delete-preparation-btn');

      if (viewBtn) {
        const prepId = viewBtn.dataset.prepId;
        showPreparationModal(prepId);
      } else if (editBtn) {
        const prepId = editBtn.dataset.prepId;
        showPreparationForm(prepId);
      } else if (deleteBtn) {
        const prepId = deleteBtn.dataset.prepId;
        await deletePreparationAction(prepId);
      }
    });
  }
}

/**
 * Show preparation form modal (create or edit)
 */
async function showPreparationForm(prepId = null) {
  const isEdit = !!prepId;
  let prep = null;

  if (isEdit) {
    prep = currentPreparations.find(p => p.id === prepId);
    if (!prep) return;
  }

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Modifica' : 'Nuova'} Preparazione</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
      <form id="preparationForm">
        <!-- Basic Info -->
        <div class="form-group">
          <label class="form-label">Nome *</label>
          <input type="text" class="form-input" name="name" required value="${prep?.name || ''}" placeholder="es. Crema di Zucca">
        </div>

        <div class="form-group">
          <label class="form-label">Categoria *</label>
          <select class="form-input" name="category" required>
            <option value="">Seleziona categoria...</option>
            ${PREPARATION_CATEGORIES.map(cat => `
              <option value="${cat}" ${prep?.category === cat ? 'selected' : ''}>${cat}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Descrizione</label>
          <textarea class="form-textarea" name="description" rows="2" placeholder="Breve descrizione...">${prep?.description || ''}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Porzioni</label>
            <input type="number" class="form-input" name="yield" min="1" value="${prep?.yield || 4}" id="yieldInput">
          </div>

          <div class="form-group">
            <label class="form-label">Tempo</label>
            <input type="text" class="form-input" name="prepTime" value="${prep?.prepTime || ''}" placeholder="es. 30 min">
          </div>

          <div class="form-group">
            <label class="form-label">Difficoltà</label>
            <select class="form-input" name="difficulty">
              <option value="Facile" ${prep?.difficulty === 'Facile' ? 'selected' : ''}>Facile</option>
              <option value="Media" ${prep?.difficulty === 'Media' ? 'selected' : ''}>Media</option>
              <option value="Difficile" ${prep?.difficulty === 'Difficile' ? 'selected' : ''}>Difficile</option>
            </select>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="form-group">
          <label class="form-label">Ingredienti *</label>
          <div id="ingredientsList"></div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.addIngredientRow()" style="margin-top: 0.5rem;">
            ➕ Aggiungi Ingrediente
          </button>
        </div>

        <!-- Instructions -->
        <div class="form-group">
          <label class="form-label">Procedimento *</label>
          <div id="instructionsList"></div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.addInstructionRow()" style="margin-top: 0.5rem;">
            ➕ Aggiungi Passo
          </button>
        </div>

        <!-- Tips -->
        <div class="form-group">
          <label class="form-label">Consigli (opzionale)</label>
          <div id="tipsList"></div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.addTipRow()" style="margin-top: 0.5rem;">
            ➕ Aggiungi Consiglio
          </button>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Annulla</button>
      <button class="btn btn-primary" onclick="window.submitPreparationForm(${isEdit ? `'${prepId}'` : 'null'})">
        <span>${isEdit ? '💾' : '➕'}</span>
        ${isEdit ? 'Salva' : 'Crea'}
      </button>
    </div>
  `;

  openModal(modalContent);

  // Initialize dynamic lists
  if (prep) {
    for (const ing of prep.ingredients) {
      await addIngredientRow(ing);
    }
    prep.instructions.forEach(inst => addInstructionRow(inst));
    if (prep.tips) prep.tips.forEach(tip => addTipRow(tip));
  } else {
    await addIngredientRow();
    addInstructionRow();
  }

  // Add listener to yield input to recalculate all per portions
  const yieldInput = document.getElementById('yieldInput');
  if (yieldInput) {
    yieldInput.addEventListener('input', recalculateAllPerPortions);
  }
}

/**
 * Add ingredient row
 */
async function addIngredientRow(data = null) {
  // Load ingredients if not cached
  if (cachedIngredients.length === 0) {
    cachedIngredients = await getAllIngredients();
  }

  const container = document.getElementById('ingredientsList');
  const index = container.children.length;

  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;';

  // Group ingredients by category
  const byCategory = {};
  cachedIngredients.forEach(ing => {
    if (!byCategory[ing.category]) {
      byCategory[ing.category] = [];
    }
    byCategory[ing.category].push(ing);
  });

  row.innerHTML = `
    <style>
      .ing-select-${index} option,
      .ing-select-${index} optgroup {
        background: #1a1f3a;
        color: white;
      }
    </style>
    <select class="form-input ing-select-${index}" name="ing_name[]" required>
      <option value="">Seleziona ingrediente...</option>
      ${Object.entries(byCategory).map(([category, ings]) => `
        <optgroup label="${category}">
          ${ings.map(ing => `
            <option value="${ing.name}" ${data?.name === ing.name ? 'selected' : ''}>${ing.name}</option>
          `).join('')}
        </optgroup>
      `).join('')}
    </select>
    <input type="number" class="form-input ing-quantity" placeholder="Qtà totale" value="${data?.quantity || ''}" step="0.01" required>
    <input type="text" class="form-input" name="ing_unit[]" placeholder="Unità" value="${data?.unit || ''}" required>
    <input type="number" class="form-input ing-per-portion" placeholder="Per porz." value="${data?.perPortion || ''}" step="0.01" readonly style="background: #e8e8e8; color: #333; font-weight: 500; cursor: not-allowed;" title="Calcolato automaticamente: Qtà ÷ Porzioni">
    <input type="text" class="form-input" name="ing_category[]" placeholder="Categoria" value="${data?.category || ''}">
    <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()">🗑️</button>
  `;

  container.appendChild(row);

  // Add event listener to quantity input to auto-calculate perPortion
  const quantityInput = row.querySelector('.ing-quantity');
  quantityInput.addEventListener('input', calculatePerPortion);

  // Calculate initial value if data provided
  if (data?.quantity) {
    calculatePerPortion.call(quantityInput);
  }
}

/**
 * Calculate per portion value for an ingredient
 */
function calculatePerPortion() {
  const row = this.closest('.ingredient-row');
  const quantityInput = row.querySelector('.ing-quantity');
  const perPortionInput = row.querySelector('.ing-per-portion');
  const yieldInput = document.querySelector('input[name="yield"]');

  const quantity = parseFloat(quantityInput.value) || 0;
  const yieldValue = parseInt(yieldInput?.value) || 4;

  if (quantity > 0 && yieldValue > 0) {
    const perPortion = (quantity / yieldValue).toFixed(2);
    perPortionInput.value = perPortion;
  } else {
    perPortionInput.value = '';
  }
}

/**
 * Recalculate all per portion values when yield changes
 */
function recalculateAllPerPortions() {
  const quantityInputs = document.querySelectorAll('.ing-quantity');
  quantityInputs.forEach(input => {
    calculatePerPortion.call(input);
  });
}

/**
 * Add instruction row
 */
function addInstructionRow(text = '') {
  const container = document.getElementById('instructionsList');
  const index = container.children.length;

  const row = document.createElement('div');
  row.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
  row.innerHTML = `
    <span style="color: var(--color-gray-400); padding: 0.5rem;">${index + 1}.</span>
    <textarea class="form-textarea" name="instruction[]" rows="2" placeholder="Descrivi il passo..." required>${text}</textarea>
    <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove(); window.renumberInstructions()">🗑️</button>
  `;

  container.appendChild(row);
}

/**
 * Add tip row
 */
function addTipRow(text = '') {
  const container = document.getElementById('tipsList');

  const row = document.createElement('div');
  row.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
  row.innerHTML = `
    <input type="text" class="form-input" name="tip[]" placeholder="Consiglio utile..." value="${text}">
    <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()">🗑️</button>
  `;

  container.appendChild(row);
}

/**
 * Renumber instructions after deletion
 */
function renumberInstructions() {
  const container = document.getElementById('instructionsList');
  Array.from(container.children).forEach((row, index) => {
    const numberSpan = row.querySelector('span');
    if (numberSpan) numberSpan.textContent = `${index + 1}.`;
  });
}

/**
 * Submit preparation form
 */
async function submitPreparationForm(prepId) {
  const form = document.getElementById('preparationForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);

  // Collect ingredients
  const ingredients = [];
  const ingNames = formData.getAll('ing_name[]');
  const ingUnits = formData.getAll('ing_unit[]');
  const ingCategories = formData.getAll('ing_category[]');

  // Get quantities and perPortions from the actual input elements (including readonly ones)
  const quantityInputs = document.querySelectorAll('.ing-quantity');
  const perPortionInputs = document.querySelectorAll('.ing-per-portion');

  for (let i = 0; i < ingNames.length; i++) {
    if (ingNames[i].trim()) {
      ingredients.push({
        name: ingNames[i].trim(),
        quantity: parseFloat(quantityInputs[i].value),
        unit: ingUnits[i].trim(),
        perPortion: parseFloat(perPortionInputs[i].value),
        category: ingCategories[i].trim() || 'Altro'
      });
    }
  }

  // Collect instructions
  const instructions = formData.getAll('instruction[]')
    .map(inst => inst.trim())
    .filter(inst => inst);

  // Collect tips
  const tips = formData.getAll('tip[]')
    .map(tip => tip.trim())
    .filter(tip => tip);

  const prepData = {
    name: formData.get('name').trim(),
    category: formData.get('category'),
    description: formData.get('description').trim(),
    yield: parseInt(formData.get('yield')),
    prepTime: formData.get('prepTime').trim(),
    difficulty: formData.get('difficulty'),
    ingredients,
    instructions,
    tips
  };

  try {
    if (prepId) {
      // Update existing
      await updatePreparation(prepId, prepData);
      showToast('Preparazione aggiornata!', 'success');
    } else {
      // Create new
      await createPreparation(prepData);
      showToast('Preparazione creata!', 'success');
    }

    closeModal();
    await renderPreparationsGrid();
  } catch (error) {
    console.error('Error saving preparation:', error);
    showToast('Errore nel salvataggio', 'error');
  }
}

/**
 * Delete preparation
 */
async function deletePreparationAction(prepId) {
  const prep = currentPreparations.find(p => p.id === prepId);
  if (!prep) return;

  if (!prep.isCustom) {
    showToast('Non puoi eliminare preparazioni predefinite', 'error');
    return;
  }

  if (!confirm(`Sei sicuro di voler eliminare "${prep.name}"?`)) {
    return;
  }

  try {
    await deletePreparation(prepId);
    showToast('Preparazione eliminata', 'success');
    await renderPreparationsGrid();
  } catch (error) {
    console.error('Error deleting preparation:', error);
    showToast('Errore nell\'eliminazione', 'error');
  }
}

/**
 * Get pizzas that use a specific preparation
 */
async function getPizzasUsingPreparation(prepId) {
  const allRecipes = await getAllRecipes();

  const pizzasUsing = allRecipes.filter(recipe => {
    if (!recipe.preparations || recipe.preparations.length === 0) return false;
    return recipe.preparations.some(p => p.id === prepId);
  });

  return pizzasUsing;
}

/**
 * Show modal with pizzas using this preparation
 */
async function showPizzasUsingPreparation(prepId, prepName) {
  const pizzas = await getPizzasUsingPreparation(prepId);

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">🍕 Pizze con "${prepName}"</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    
    <div class="modal-body">
      ${pizzas.length > 0 ? `
        <p style="margin-bottom: 1.5rem; color: var(--color-text-secondary);">
          Questa preparazione è usata in <strong>${pizzas.length}</strong> ${pizzas.length === 1 ? 'pizza' : 'pizze'}:
        </p>
        <div style="display: grid; gap: 1rem;">
          ${pizzas.map(pizza => `
            <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3 style="margin: 0; color: var(--color-white);">${pizza.name}</h3>
                ${pizza.tags ? `<div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                  ${pizza.tags.slice(0, 2).map(tag => `<span class="badge" style="font-size: 0.75rem;">${tag}</span>`).join('')}
                </div>` : ''}
              </div>
              ${pizza.baseIngredients ? `
                <p style="margin: 0; font-size: 0.875rem; color: var(--color-gray-400);">
                  ${pizza.baseIngredients.slice(0, 3).map(ing => ing.name).join(', ')}${pizza.baseIngredients.length > 3 ? '...' : ''}
                </p>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">Nessuna pizza trovata</h3>
          <p class="empty-description">Questa preparazione non è ancora stata usata in nessuna pizza.</p>
        </div>
      `}
    </div>
    
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">
        Chiudi
      </button>
    </div>
  `;

  openModal(modalContent);
}

/**
 * Show preparation modal (read-only view)
 */
async function showPreparationModal(prepId) {
  const prep = currentPreparations.find(p => p.id === prepId);
  if (!prep) return;

  // Count pizzas using this preparation
  const pizzasUsing = await getPizzasUsingPreparation(prepId);
  const pizzaCount = pizzasUsing.length;

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">${prep.name}</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    
    <div class="modal-body">
      <div class="preparation-modal-meta">
        <span class="badge">${prep.category}</span>
        <span>⏱️ ${prep.prepTime}</span>
        <span>🍽️ ${prep.yield} porzioni</span>
        <span>Difficoltà: ${prep.difficulty}</span>
      </div>
      
      <p class="preparation-modal-description">${prep.description}</p>
      
      <div class="preparation-modal-grid">
        <!-- Ingredients -->
        <div class="preparation-section">
          <h3 class="section-title">🛒 Ingredienti</h3>
          ${prep.ingredients && prep.ingredients.length > 0 ? `
            <ul class="ingredients-list">
              ${prep.ingredients.map(ing => `
                <li class="ingredient-item">
                  <span class="ingredient-name">${ing.name}</span>
                  <span class="ingredient-quantity">${ing.quantity} ${ing.unit}</span>
                </li>
              `).join('')}
            </ul>
            <p class="ingredients-note">
              <em>Per porzione: ${prep.ingredients.map(i => `${i.name} ${i.perPortion}${i.unit}`).join(', ')}</em>
            </p>
          ` : `
            <p class="empty-message">Nessun ingrediente specificato</p>
          `}
        </div>
        
        <!-- Instructions -->
        ${prep.instructions && prep.instructions.length > 0 ? `
        <div class="preparation-section">
          <h3 class="section-title">👨‍🍳 Procedimento</h3>
          <ol class="instructions-list">
            ${prep.instructions.map(step => `
              <li class="instruction-item">${step}</li>
            `).join('')}
          </ol>
        </div>
        ` : prep.description ? `
        <div class="preparation-section">
          <h3 class="section-title">📝 Ricetta</h3>
          <p>${prep.description.startsWith('http') ? `<a href="${prep.description}" target="_blank" rel="noopener">Vedi ricetta completa →</a>` : prep.description}</p>
        </div>
        ` : ''}
      </div>
      
      ${prep.tips && prep.tips.length > 0 ? `
        <div class="preparation-tips">
          <h3 class="section-title">💡 Consigli</h3>
          <ul class="tips-list">
            ${prep.tips.map(tip => `
              <li class="tip-item">${tip}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">
        Chiudi
      </button>
      <button class="btn ${pizzaCount > 0 ? 'btn-accent' : 'btn-ghost'}" onclick="window.closeModal(); window.showPizzasUsingPreparationGlobal('${prep.id}', '${prep.name.replace(/'/g, "\\'")}')" style="position: relative;">
        <span>🍕</span>
        Usata in ${pizzaCount} ${pizzaCount === 1 ? 'pizza' : 'pizze'}
        ${pizzaCount > 0 ? `<span style="position: absolute; top: -4px; right: -4px; background: var(--color-accent); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; font-weight: bold;">${pizzaCount}</span>` : ''}
      </button>
      ${prep.isCustom ? `
        <button class="btn btn-primary" onclick="window.closeModal(); window.showPreparationFormGlobal('${prep.id}')">
          <span>✏️</span>
          Modifica
        </button>
      ` : ''}
    </div>
  `;

  openModal(modalContent);
}

// Global functions for modal callbacks
window.showPreparationFormGlobal = showPreparationForm;
window.submitPreparationForm = submitPreparationForm;
window.addIngredientRow = addIngredientRow;
window.addInstructionRow = addInstructionRow;
window.addTipRow = addTipRow;
window.renumberInstructions = renumberInstructions;
window.showPizzasUsingPreparationGlobal = showPizzasUsingPreparation;
