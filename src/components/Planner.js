// ============================================
// PLANNER COMPONENT
// ============================================

import { getAllPizzaNights, createPizzaNight, deletePizzaNight, completePizzaNight, getAllRecipes, getAllGuests, addGuest, deleteGuest } from '../modules/database.js';
import { formatDate, formatDateForInput, getNextSaturdayEvening, confirm } from '../utils/helpers.js';
import { openModal, closeModal } from '../modules/ui.js';
import { state } from '../store.js';
import { DEFAULT_GUEST_COUNT } from '../utils/constants.js';

export async function renderPlanner(appState) {
  await renderPizzaNights();
  setupPlannerListeners();
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

async function showNewPizzaNightModal() {
  const recipes = await getAllRecipes();

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">Nuova Serata Pizza</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="newPizzaNightForm">
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
        
        <div class="form-group">
          <label class="form-label">Seleziona Pizze</label>
          <div id="pizzaSelection" style="max-height: 300px; overflow-y: auto;">
            ${recipes.length > 0 ? recipes.map(recipe => `
              <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <input type="checkbox" name="selectedPizzas" value="${recipe.id}" style="width: 20px; height: 20px;">
                <span style="flex: 1;">${recipe.name}</span>
                <input type="number" name="quantity_${recipe.id}" value="1" min="1" max="10" style="width: 60px; padding: 0.25rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.25rem; color: white; text-align: center;">
              </div>
            `).join('') : '<p class="text-muted">Nessuna ricetta disponibile. Aggiungine prima!</p>'}
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

  // Load guests into the selection area
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
  state.selectedPizzaNight = nightId;
  closeModal();

  // Navigate to shopping view
  window.location.hash = 'shopping';
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
window.completePizzaNightAction = completePizzaNightAction;
window.deletePizzaNightAction = deletePizzaNightAction;
window.confirmDeletePizzaNight = confirmDeletePizzaNight;
window.showManageGuestsModal = showManageGuestsModal;
window.submitNewGuest = submitNewGuest;
window.deleteGuestAction = deleteGuestAction;
