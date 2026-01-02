// ============================================
// SHOPPING COMPONENT
// ============================================

import { getAllPizzaNights, getPizzaNightById } from '../modules/database.js';
import { generateShoppingList, downloadShoppingList } from '../modules/shopping.js';
import { formatQuantity } from '../utils/helpers.js';
import { state } from '../store.js';
import { DOUGH_RECIPES } from '../utils/constants.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

async function selectPizzaNightForShopping(nightId) {
  state.selectedPizzaNight = nightId;
  await renderShopping(state);
}

async function clearSelectedNight() {
  state.selectedPizzaNight = null;
  await renderShopping(state);
}

function getCategoryIcon(category) {
  const icons = {
    'Impasto': '🌾',
    'Salsa': '🍅',
    'Formaggi': '🧀',
    'Carne': '🥓',
    'Verdure': '🥬',
    'Pesce': '🐟',
    'Erbe e Spezie': '🌿',
    'Oli': '🫒',
    'Altro': '📦'
  };
  return icons[category] || '📦';
}

// ============================================
// RENDER FUNCTIONS
// ============================================


export async function renderShopping(appState) {
  const container = document.getElementById('shoppingListContainer');

  // Get all pizza nights
  const pizzaNights = await getAllPizzaNights();
  const plannedNights = pizzaNights.filter(n => n.status === 'planned');



  if (plannedNights.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3 class="empty-title">Nessuna serata pianificata</h3>
        <p class="empty-description">Crea una serata pizza per generare la lista della spesa</p>
      </div>
    `;
    return;
  }

  // If a specific night is selected, show its shopping list
  if (appState.selectedPizzaNight) {
    await renderShoppingListForNight(appState.selectedPizzaNight);
    return;
  }



  container.innerHTML = `
    <div class="card">
      <h3 style="margin-bottom: 1.5rem;">Seleziona una serata</h3>
      <div style="display: grid; gap: 1rem;" id="nightSelector">
        ${plannedNights.map(night => `
          <button 
            class="btn btn-secondary night-selector-btn" 
            style="justify-content: space-between; width: 100%;"
            data-night-id="${night.id}"
          >
            <span>${night.name}</span>
            <span>${night.selectedPizzas.length} pizze • ${night.guestCount} ospiti</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Add event listeners to buttons
  const nightButtons = container.querySelectorAll('.night-selector-btn');
  nightButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nightId = btn.getAttribute('data-night-id');
      selectPizzaNightForShopping(nightId);
    });
  });
}

async function renderDoughRecipeSection(selectedDough, selectedPizzas) {
  const doughRecipe = DOUGH_RECIPES.find(d => d.type === selectedDough);
  if (!doughRecipe) return '';

  // Calculate total pizzas and batches needed
  const totalPizzas = selectedPizzas.reduce((sum, pizza) => sum + pizza.quantity, 0);
  const batchesNeeded = Math.ceil(totalPizzas / doughRecipe.yield);

  return `
    <div style="background: rgba(102, 126, 234, 0.1); border: 2px solid rgba(102, 126, 234, 0.3); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
        <span style="font-size: 2rem;">🥣</span>
        <div>
          <h3 style="margin: 0; font-size: 1.25rem;">Ricetta Impasto: ${doughRecipe.type}</h3>
          <p style="margin: 0; font-size: 0.875rem; color: var(--color-gray-300);">
            ${totalPizzas} pizze = ${batchesNeeded} ${batchesNeeded === 1 ? 'batch' : 'batch'} (${doughRecipe.yield} pizze per batch)
          </p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
        <div style="text-align: center;">
          <div style="font-size: 0.75rem; color: var(--color-gray-400);">Idratazione</div>
          <div style="font-weight: 700; color: var(--color-primary-light);">${doughRecipe.hydration}%</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.75rem; color: var(--color-gray-400);">Lievitazione</div>
          <div style="font-weight: 600; font-size: 0.875rem;">${doughRecipe.fermentation}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.75rem; color: var(--color-gray-400);">Riposo</div>
          <div style="font-weight: 600; font-size: 0.875rem;">${doughRecipe.restTime}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.75rem; color: var(--color-gray-400);">Difficoltà</div>
          <div style="font-weight: 600;">${doughRecipe.difficulty}</div>
        </div>
      </div>
      
      <div style="margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
        <button 
          onclick="const content = this.nextElementSibling; const arrow = this.querySelector('.arrow'); if (content.style.display === 'none' || !content.style.display) { content.style.display = 'block'; arrow.textContent = '▲'; } else { content.style.display = 'none'; arrow.textContent = '▼'; }"
          style="width: 100%; cursor: pointer; font-weight: 700; padding: 1rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3)); border: 2px solid rgba(102, 126, 234, 0.5); border-radius: 0.75rem; color: white; display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; transition: all 0.3s;"
          onmouseover="this.style.background='linear-gradient(135deg, rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5))'; this.style.transform='translateY(-2px)'"
          onmouseout="this.style.background='linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))'; this.style.transform='translateY(0)'"
        >
          <span style="font-size: 1.5rem;">📝</span>
          <span style="flex: 1; text-align: left;">Procedimento Completo</span>
          <span class="arrow" style="font-size: 1.25rem; font-weight: bold;">▼</span>
        </button>
        <div style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 0.5rem;">
          <ol style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
            ${doughRecipe.instructions.map(instruction => `<li style="margin-bottom: 0.5rem;">${instruction}</li>`).join('')}
          </ol>
          ${doughRecipe.tips && doughRecipe.tips.length > 0 ? `
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(249, 115, 22, 0.1); border-left: 3px solid var(--color-accent); border-radius: 0.5rem;">
              <div style="font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>💡</span>
                <span>Consigli Utili</span>
              </div>
              <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.875rem;">
                ${doughRecipe.tips.map(tip => `<li style="margin-bottom: 0.25rem;">${tip}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

async function renderShoppingListForNight(nightId) {
  const container = document.getElementById('shoppingListContainer');
  const night = await getPizzaNightById(nightId);

  if (!night || night.selectedPizzas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍕</div>
        <h3 class="empty-title">Nessuna pizza selezionata</h3>
        <p class="empty-description">Aggiungi pizze alla serata per generare la lista della spesa</p>
      </div>
    `;
    return;
  }

  try {
    // Generate shopping list with dough ingredients
    const groupedList = await generateShoppingList(night.selectedPizzas, night.selectedDough);

    // Check if we have any ingredients
    if (!groupedList || Object.keys(groupedList).length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">Errore nella generazione della lista</h3>
          <p class="empty-description">Alcune pizze potrebbero essere state cancellate dal database. Aggiorna la serata con pizze valide.</p>
          <button class="btn btn-secondary" onclick="window.clearSelectedNight()">
            <span>←</span>
            Indietro
          </button>
        </div>
      `;
      return;
    }

    // Generate dough recipe section HTML first (before template string)
    const doughRecipeHTML = night.selectedDough
      ? await renderDoughRecipeSection(night.selectedDough, night.selectedPizzas)
      : '';

    container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div>
        <h2 style="margin: 0;">${night.name}</h2>
        <p class="text-muted">${night.guestCount} ospiti • ${night.selectedPizzas.length} pizze${night.selectedDough ? ` • ${night.selectedDough}` : ''}</p>
      </div>
      <div style="display: flex; gap: 1rem;">
        <button class="btn btn-secondary" onclick="window.clearSelectedNight()">
          <span>←</span>
          Indietro
        </button>
        <button class="btn btn-accent" onclick="window.downloadShoppingListAction('${night.id}', '${night.name}')">
          <span>📥</span>
          Scarica
        </button>
      </div>
    </div>
    
    ${doughRecipeHTML}
    
    <div class="shopping-list">
      ${Object.entries(groupedList).map(([category, ingredients]) => `
        <div class="shopping-category">
          <h3 class="shopping-category-title">
            <span>${getCategoryIcon(category)}</span>
            <span>${category}</span>
          </h3>
          <ul class="shopping-items">
            ${ingredients.map((ing, index) => `
              <li class="shopping-item" data-category="${category}" data-index="${index}">
                <div class="shopping-checkbox" onclick="window.toggleShoppingItem(this)"></div>
                <span class="shopping-item-name">${ing.name}</span>
                <span class="shopping-item-quantity">${formatQuantity(ing.quantity, ing.unit)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;
  } catch (error) {
    console.error('Error generating shopping list:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Errore nella generazione della lista</h3>
        <p class="empty-description">Si è verificato un errore. Alcune pizze potrebbero essere state cancellate dal database.</p>
        <button class="btn btn-secondary" onclick="window.clearSelectedNight()">
          <span>←</span>
          Indietro
        </button>
      </div>
    `;
  }
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

// Make functions globally accessible for inline onclick handlers
window.clearSelectedNight = clearSelectedNight;

window.toggleShoppingItem = (element) => {
  const item = element.closest('.shopping-item');
  const checkbox = element;

  checkbox.classList.toggle('checked');
  item.classList.toggle('checked');
};

window.downloadShoppingListAction = async (nightId, nightName) => {
  const night = await getPizzaNightById(nightId);
  const groupedList = await generateShoppingList(night.selectedPizzas, night.selectedDough);
  downloadShoppingList(groupedList, nightName);
};

// Show shopping list in a modal
window.showShoppingListModal = async (nightId) => {
  const night = await getPizzaNightById(nightId);
  if (!night) return;

  const groupedList = await generateShoppingList(night.selectedPizzas, night.selectedDough);

  let itemsHTML = '';
  for (const [category, items] of Object.entries(groupedList)) {
    const icon = getCategoryIcon(category);
    itemsHTML += `
      <div class="shopping-category">
        <h3 class="category-title">${icon} ${category}</h3>
        <div class="shopping-items">
          ${items.map(item => `
            <div class="shopping-item">
              <div class="shopping-item-checkbox" onclick="window.toggleShoppingItem(this)"></div>
              <div class="shopping-item-content">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">${formatQuantity(item.quantity, item.unit)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content large">
      <div class="modal-header">
        <h2>🛒 Lista Spesa - ${night.name}</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="shopping-list-container">
          ${itemsHTML}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
          Chiudi
        </button>
        <button class="btn btn-primary" onclick="window.downloadShoppingListAction('${nightId}', '${night.name}')">
          📥 Scarica PDF
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
};

