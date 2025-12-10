// ============================================
// PLANNER COMPONENT
// ============================================

import { getAllPizzaNights, createPizzaNight, deletePizzaNight, completePizzaNight, getAllRecipes, getAllGuests, addGuest, deleteGuest, getRecipeById, getPizzaNightById } from '../modules/database.js';
import { formatDate, formatDateForInput, getNextSaturdayEvening, confirm, formatQuantity } from '../utils/helpers.js';
import { openModal, closeModal } from '../modules/ui.js';
import { DOUGH_TYPES, DOUGH_RECIPES } from '../utils/constants.js';
import { getRecipeDoughType } from '../utils/doughHelper.js';
import { state } from '../store.js';
import { generateShoppingList, downloadShoppingList } from '../modules/shopping.js';
import { DEFAULT_GUEST_COUNT } from '../utils/constants.js';

export async function renderPlanner(appState) {
  await renderPizzaNights();
  setupPlannerListeners();
}

async function showNewPizzaNightModal() {
  const recipes = await getAllRecipes(); // Store all recipes

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">Nuova Serata Pizza</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="newPizzaNightForm">
        <!-- ... existing fields ... -->
        <div class="form-group">
          <label class="form-label">Nome Serata *</label>
          <input type="text" class="form-input" name="name" required placeholder="es. Pizza con gli amici">
        </div>
        
        <div class="form-group">
          <label class="form-label">Data e Ora *</label>
          <input type="datetime-local" class="form-input" name="date" required value="${formatDateForInput(getNextSaturdayEvening())}">
        </div>
        
        <div class="form-group">
          <label class="form-label">Numero Ospiti *</label>
          <input type="number" class="form-input" name="guestCount" required value="${DEFAULT_GUEST_COUNT}" min="1">
        </div>

        <div class="form-group">
          <label class="form-label">Seleziona Ospiti (Opzionale)</label>
          <div id="guestSelection" style="max-height: 150px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; padding: 0.5rem;">
            <!-- Guests will be loaded here -->
            <p class="text-muted text-sm">Caricamento ospiti...</p>
          </div>
        </div>
        
        <div class="form-group" style="background: rgba(102, 126, 234, 0.1); border: 2px solid rgba(102, 126, 234, 0.3); border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem;">
          <label class="form-label" style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin-bottom: 1rem;">
            <span>🥣</span>
            <span>Tipo di Impasto per la Serata *</span>
          </label>
          <p style="color: var(--color-gray-300); font-size: 0.875rem; margin-bottom: 1rem;">
            Scegli quale impasto preparare. Tutte le pizze della serata useranno questo impasto.
          </p>
          <select id="selectedDoughType" name="selectedDough" class="form-input" required style="font-size: 1rem; padding: 0.75rem;">
            <option value="" style="color: #000; background: #fff;">Seleziona un impasto...</option>
            ${DOUGH_RECIPES.map(d => `
              <option value="${d.type}" style="color: #000; background: #fff;">
                ${d.type} - ${d.hydration}% idratazione (${d.difficulty})
              </option>
            `).join('')}
          </select>
          <div id="doughInfo" style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; display: none;">
            <!-- Dough info will be shown here -->
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Seleziona Pizze</label>
          
          <div style="margin-bottom: 0.5rem;">
              <select id="plannerDoughFilter" class="form-input" style="padding: 0.4rem; font-size: 0.9rem;">
                  <option value="all" style="color: #000; background: #fff;">🔍 Filtra per impasto: Tutti</option>
                  ${DOUGH_TYPES.map(d => `<option value="${d.type}" style="color: #000; background: #fff;">${d.type}</option>`).join('')}
              </select>
          </div>

          <div id="pizzaSelection" style="max-height: 300px; overflow-y: auto;">
             <!-- Pizza list populated via JS -->
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Note</label>
          <textarea class="form-textarea" name="notes" placeholder="Note aggiuntive..."></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Annulla</button>
      <button class="btn btn-accent" onclick="window.submitNewPizzaNight()">
        <span>➕</span>
        Crea Serata
      </button>
    </div>
  `;

  openModal(modalContent);

  // Initialize with all recipes
  renderPizzaSelectionList(recipes);

  // Setup filter listener
  const filterSelect = document.getElementById('plannerDoughFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      const selectedType = e.target.value;
      let filteredRecipes = recipes;
      if (selectedType !== 'all') {
        filteredRecipes = recipes.filter(r => getRecipeDoughType(r) === selectedType);
      }
      renderPizzaSelectionList(filteredRecipes);
    });
  }

  // Load guests into the selection area
  // ... existing guest loading logic ...
  const guests = await getAllGuests();
  const guestSelection = document.getElementById('guestSelection');
  if (guestSelection) {
    if (guests.length > 0) {
      guestSelection.innerHTML = guests.map(guest => `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <input type="checkbox" name="selectedGuests" value="${guest.id}" id="guest_${guest.id}">
          <label for="guest_${guest.id}" style="cursor: pointer;">${guest.name}</label>
        </div>
      `).join('');
    } else {
      guestSelection.innerHTML = '<p class="text-muted text-sm">Nessun ospite salvato. <a href="#" onclick="window.closeModal(); window.showManageGuestsModal(); return false;">Gestisci ospiti</a></p>';
    }
  }

  // Setup dough selection listener to show info
  const doughSelect = document.getElementById('selectedDoughType');
  if (doughSelect) {
    doughSelect.addEventListener('change', (e) => {
      const selectedDoughType = e.target.value;
      const doughInfoDiv = document.getElementById('doughInfo');

      if (selectedDoughType && doughInfoDiv) {
        const dough = DOUGH_RECIPES.find(d => d.type === selectedDoughType);
        if (dough) {
          doughInfoDiv.style.display = 'block';
          doughInfoDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
              <div style="text-align: center;">
                <div style="font-size: 0.75rem; color: var(--color-gray-400);">Idratazione</div>
                <div style="font-weight: 700; color: var(--color-primary-light);">${dough.hydration}%</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 0.75rem; color: var(--color-gray-400);">Lievitazione</div>
                <div style="font-weight: 600; font-size: 0.875rem;">${dough.fermentation}</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 0.75rem; color: var(--color-gray-400);">Resa</div>
                <div style="font-weight: 700; color: var(--color-accent-light);">${dough.yield} pizze</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 0.75rem; color: var(--color-gray-400);">Difficoltà</div>
                <div style="font-weight: 600;">${dough.difficulty}</div>
              </div>
            </div>
            <p style="font-size: 0.875rem; color: var(--color-gray-300); margin: 0;">
              ${dough.description}
            </p>
          `;
        }
      } else if (doughInfoDiv) {
        doughInfoDiv.style.display = 'none';
      }
    });
  }
}

function renderPizzaSelectionList(recipes) {
  const listContainer = document.getElementById('pizzaSelection');
  if (!listContainer) return;

  if (recipes.length > 0) {
    listContainer.innerHTML = recipes.map(recipe => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; margin-bottom: 0.5rem;">
            <input type="checkbox" name="selectedPizzas" value="${recipe.id}" style="width: 20px; height: 20px;">
            <div style="flex: 1;">
                <div>${recipe.name}</div>
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${getRecipeDoughType(recipe)}</div>
            </div>
            <input type="number" name="quantity_${recipe.id}" value="1" min="1" max="10" style="width: 60px; padding: 0.25rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.25rem; color: white; text-align: center;">
            </div>
        `).join('');
  } else {
    listContainer.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center;">Nessuna ricetta trovata con questo filtro.</p>';
  }
}

async function renderPizzaNights() {
  const grid = document.getElementById('pizzaNightsGrid');
  const pizzaNights = await getAllPizzaNights();

  // Sort by date, most recent first
  const sorted = pizzaNights.sort((a, b) => b.date - a.date);

  if (sorted.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🎉</div>
        <h3 class="empty-title">Nessuna serata pianificata</h3>
        <p class="empty-description">Crea la tua prima serata pizza!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = sorted.map(night => createPizzaNightCard(night)).join('');

  // Attach event listeners to card actions
  attachCardListeners(grid);
}

function attachCardListeners(container) {
  // Details buttons
  container.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const nightId = btn.dataset.nightId;
      viewPizzaNightDetails(nightId);
    });
  });

  // Complete buttons
  container.querySelectorAll('.btn-complete').forEach(btn => {
    btn.addEventListener('click', () => {
      const nightId = btn.dataset.nightId;
      completePizzaNightAction(nightId);
    });
  });

  // Delete buttons
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Delete button clicked');
      const nightId = btn.dataset.nightId;
      console.log('Night ID:', nightId);
      deletePizzaNightAction(nightId);
    });
  });
}

function createPizzaNightCard(night) {
  return `
    <div class="planner-card">
      <div class="planner-card-header">
        <div>
          <h3 class="planner-card-title">${night.name}</h3>
          <div class="planner-card-date">
            <span>📅</span>
            <span>${formatDate(night.date)}</span>
          </div>
        </div>
        <span class="planner-card-status ${night.status}">${night.status === 'planned' ? 'Pianificata' : 'Completata'}</span>
      </div>
      
      <div class="planner-card-info">
        <div class="planner-info-item">
          <span class="planner-info-icon">👥</span>
          <div>
            <div class="planner-info-label">Ospiti</div>
            <div class="planner-info-value">${night.guestCount}</div>
          </div>
        </div>
        <div class="planner-info-item">
          <span class="planner-info-icon">🍕</span>
          <div>
            <div class="planner-info-label">Pizze</div>
            <div class="planner-info-value">${night.selectedPizzas.length}</div>
          </div>
        </div>
        ${night.selectedDough ? `
          <div class="planner-info-item">
            <span class="planner-info-icon">🥣</span>
            <div>
              <div class="planner-info-label">Impasto</div>
              <div class="planner-info-value" style="font-size: 0.875rem;">${night.selectedDough}</div>
            </div>
          </div>
        ` : ''}
      </div>
      
      ${night.selectedPizzas.length > 0 ? `
        <ul class="planner-pizzas-list">
          ${night.selectedPizzas.slice(0, 3).map(pizza => `
            <li class="planner-pizza-item">
              <span class="planner-pizza-name">${pizza.recipeName || 'Pizza'}</span>
              <span class="planner-pizza-quantity">×${pizza.quantity}</span>
            </li>
          `).join('')}
          ${night.selectedPizzas.length > 3 ? `
            <li class="planner-pizza-item text-muted">
              +${night.selectedPizzas.length - 3} altre...
            </li>
          ` : ''}
        </ul>
      ` : ''}
      
      ${night.notes ? `<p class="text-muted" style="font-size: 0.875rem; margin-top: 1rem;">${night.notes}</p>` : ''}
      
      <div class="planner-card-actions">
        <button class="btn btn-primary btn-sm btn-details" data-night-id="${night.id}">
          <span>👁️</span>
          Dettagli
        </button>
        ${night.status === 'planned' ? `
          <button class="btn btn-secondary btn-sm btn-complete" data-night-id="${night.id}">
            <span>✓</span>
            Completa
          </button>
        ` : ''}
        <button class="btn btn-ghost btn-sm btn-delete" data-night-id="${night.id}">
          <span>🗑️</span>
        </button>
      </div>
    </div>
  `;
}

function setupPlannerListeners() {
  const newBtn = document.getElementById('newPizzaNightBtn');
  newBtn.removeEventListener('click', showNewPizzaNightModal);
  newBtn.addEventListener('click', showNewPizzaNightModal);

  const manageGuestsBtn = document.getElementById('manageGuestsBtn');
  if (manageGuestsBtn) {
    manageGuestsBtn.removeEventListener('click', showManageGuestsModal);
    manageGuestsBtn.addEventListener('click', showManageGuestsModal);
  }
}

async function showManageGuestsModal() {
  const guests = await getAllGuests();

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">Gestisci Ospiti</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Aggiungi Nuovo Ospite</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="newGuestName" class="form-input" placeholder="Nome e Cognome">
          <button class="btn btn-primary" onclick="window.submitNewGuest()">Aggiungi</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Lista Ospiti</label>
        <div id="guestsList" style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
          ${guests.length > 0 ? guests.map(guest => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
              <span>${guest.name}</span>
              <button class="btn btn-ghost btn-sm" onclick="window.deleteGuestAction('${guest.id}')" style="color: var(--color-error);">🗑️</button>
            </div>
          `).join('') : '<p class="text-muted">Nessun ospite salvato.</p>'}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Chiudi</button>
    </div>
  `;

  openModal(modalContent);
}

async function submitNewGuest() {
  const nameInput = document.getElementById('newGuestName');
  const name = nameInput.value.trim();

  if (!name) return;

  try {
    await addGuest({ name });
    // Refresh modal content
    await showManageGuestsModal();
  } catch (error) {
    console.error('Failed to add guest:', error);
  }
}

async function deleteGuestAction(guestId) {
  if (!confirm('Sei sicuro di voler eliminare questo ospite?')) return;

  try {
    await deleteGuest(guestId);
    // Refresh modal content
    await showManageGuestsModal();
  } catch (error) {
    console.error('Failed to delete guest:', error);
  }
}



async function submitNewPizzaNight() {
  const form = document.getElementById('newPizzaNightForm');
  const formData = new FormData(form);

  const selectedPizzas = [];
  const checkboxes = form.querySelectorAll('input[name="selectedPizzas"]:checked');

  for (const checkbox of checkboxes) {
    const recipeId = checkbox.value;
    const quantity = parseInt(formData.get(`quantity_${recipeId}`)) || 1;
    const recipe = await import('../modules/database.js').then(m => m.getRecipeById(recipeId));

    selectedPizzas.push({
      recipeId,
      recipeName: recipe.name,
      quantity
    });
  }

  const selectedGuests = [];
  form.querySelectorAll('input[name="selectedGuests"]:checked').forEach(cb => {
    selectedGuests.push(cb.value);
  });

  const nightData = {
    name: formData.get('name'),
    date: new Date(formData.get('date')).getTime(),
    guestCount: parseInt(formData.get('guestCount')),
    selectedDough: formData.get('selectedDough'), // NUOVO: impasto scelto per la serata
    selectedPizzas,
    selectedGuests,
    notes: formData.get('notes') || ''
  };

  try {
    await createPizzaNight(nightData);
    closeModal();
    await refreshData();
  } catch (error) {
    console.error('Failed to create pizza night:', error);
  }
}

async function viewPizzaNightDetails(nightId) {
  const night = await import('../modules/database.js').then(m => m.getPizzaNightById(nightId));
  if (!night) return;

  let guestNames = [];
  if (night.selectedGuests && night.selectedGuests.length > 0) {
    const allGuests = await getAllGuests();
    guestNames = night.selectedGuests.map(guestId => {
      const guest = allGuests.find(g => g.id === guestId);
      return guest ? guest.name : 'Ospite rimosso';
    });
  }

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">${night.name}</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="display: grid; gap: 1.5rem;">
        <div>
          <h4 style="color: var(--color-accent-light); margin-bottom: 0.5rem;">📅 Data</h4>
          <p>${formatDate(night.date)}</p>
        </div>
        
        <div>
          <h4 style="color: var(--color-accent-light); margin-bottom: 0.5rem;">👥 Ospiti</h4>
          <p>${night.guestCount} persone</p>
          ${guestNames.length > 0 ? `
            <p class="text-muted text-sm" style="margin-top: 0.25rem;">
              ${guestNames.join(', ')}
            </p>
          ` : ''}
        </div>
        
        ${night.selectedDough ? `
          <div>
            <h4 style="color: var(--color-accent-light); margin-bottom: 0.5rem;">🥣 Impasto</h4>
            <p>${night.selectedDough}</p>
          </div>
        ` : ''}
        
        <div>
          <h4 style="color: var(--color-accent-light); margin-bottom: 0.5rem;">🍕 Pizze Selezionate</h4>
          ${night.selectedPizzas.length > 0 ? `
            <ul style="list-style: none; padding: 0;">
              ${night.selectedPizzas.map(pizza => `
                <li style="padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                  <span>${pizza.recipeName}</span>
                  <span style="color: var(--color-accent-light); font-weight: 700;">×${pizza.quantity}</span>
                </li>
              `).join('')}
            </ul>
          ` : '<p class="text-muted">Nessuna pizza selezionata</p>'}
        </div>
        
        ${night.notes ? `
          <div>
            <h4 style="color: var(--color-accent-light); margin-bottom: 0.5rem;">📝 Note</h4>
            <p>${night.notes}</p>
          </div>
        ` : ''}
        
        <div>
          <h4 style="color: var(--color-accent-light); margin-bottom: 0.5rem;">📊 Stato</h4>
          <span class="planner-card-status ${night.status}">${night.status === 'planned' ? 'Pianificata' : 'Completata'}</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Chiudi</button>
      ${night.selectedPizzas.length > 0 ? `
        <button class="btn btn-primary" onclick="window.viewShoppingListForNight('${night.id}')">
          <span>🛒</span>
          Lista Spesa
        </button>
      ` : ''}
    </div>
  `;

  openModal(modalContent);
}

async function viewShoppingListForNight(nightId) {
  closeModal();

  // Get pizza night data
  const night = await getPizzaNightById(nightId);
  if (!night) return;

  // Generate shopping list
  const groupedList = await generateShoppingList(night.selectedPizzas, night.selectedDough);

  // Helper to get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Impasto': '🌾',
      'Salsa': '🍅',
      'Formaggi': '🧀',
      'Carne': '🥓',
      'Verdure': '🥬',
      'Pesce': '🐟',
      'Erbe e Spezie': '🌿',
      'Altro': '📦'
    };
    return icons[category] || '📦';
  };

  // Build items HTML
  let itemsHTML = '';
  for (const [category, items] of Object.entries(groupedList)) {
    const icon = getCategoryIcon(category);
    itemsHTML += `
      <div class="shopping-category">
        <h3 class="category-title">${icon} ${category}</h3>
        <div class="shopping-items">
          ${items.map(item => `
            <div class="shopping-item">
              <div class="shopping-item-checkbox" onclick="this.classList.toggle('checked'); this.closest('.shopping-item').classList.toggle('checked');"></div>
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

  // Create and show modal
  const modalContent = `
    <div class="modal-header">
      <h2>🛒 Lista Spesa - ${night.name}</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="shopping-list-container">
        ${itemsHTML}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">
        Chiudi
      </button>
      <button class="btn btn-primary" onclick="window.downloadShoppingListForNight('${nightId}', '${night.name}')">
        📥 Scarica PDF
      </button>
    </div>
  `;

  openModal(modalContent);
}

// Helper function for downloading shopping list from modal
async function downloadShoppingListForNight(nightId, nightName) {
  const night = await getPizzaNightById(nightId);
  const groupedList = await generateShoppingList(night.selectedPizzas, night.selectedDough);
  downloadShoppingList(groupedList, nightName);
}

// Local action functions
async function completePizzaNightAction(nightId) {
  try {
    await completePizzaNight(nightId);
    await refreshData();
  } catch (error) {
    console.error('Failed to complete pizza night:', error);
  }
}

async function deletePizzaNightAction(nightId) {
  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">Elimina Serata</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body">
      <p>Sei sicuro di voler eliminare questa serata? L'azione non può essere annullata.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Annulla</button>
      <button class="btn btn-primary" style="background-color: var(--color-error, #ef4444);" onclick="window.confirmDeletePizzaNight('${nightId}')">
        <span>🗑️</span> Elimina
      </button>
    </div>
  `;
  openModal(modalContent);
}

async function confirmDeletePizzaNight(nightId) {
  try {
    await deletePizzaNight(nightId);
    closeModal();
    await refreshData();
    // Show success toast?
  } catch (error) {
    console.error('Failed to delete pizza night:', error);
  }
}

// Global functions for modals (still needed for inline onclick in modals)
window.viewPizzaNightDetails = viewPizzaNightDetails;
window.submitNewPizzaNight = submitNewPizzaNight;
window.viewShoppingListForNight = viewShoppingListForNight;
window.downloadShoppingListForNight = downloadShoppingListForNight;
window.completePizzaNightAction = completePizzaNightAction;
window.deletePizzaNightAction = deletePizzaNightAction;
window.confirmDeletePizzaNight = confirmDeletePizzaNight;
window.showManageGuestsModal = showManageGuestsModal;
window.submitNewGuest = submitNewGuest;
window.deleteGuestAction = deleteGuestAction;
