// ============================================
// COMBINATIONS COMPONENT
// ============================================

import { getAllCombinations, addCombination, deleteCombination } from '../modules/database.js';
import { FLAVOR_COMBINATIONS } from '../utils/constants.js';
import { openModal, closeModal } from '../modules/ui.js';

export async function renderCombinations() {
    const grid = document.getElementById('combinationsGrid');
    const combinations = await getAllCombinations();

    if (combinations.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🧪</div>
                <h3 class="empty-title">Nessuna combinazione trovata</h3>
                <p class="empty-description">Aggiungi nuove combinazioni di sapori!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = combinations.map(combo => createCombinationCard(combo)).join('');

    // Attach event listeners
    grid.querySelectorAll('.btn-delete-combo').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            deleteCombinationAction(id);
        });
    });
}

function createCombinationCard(combo) {
    return `
        <div class="card" style="position: relative;">
            <button class="btn btn-ghost btn-sm btn-delete-combo" data-id="${combo.id}" style="position: absolute; top: 0.5rem; right: 0.5rem; color: var(--color-error);">
                🗑️
            </button>
            <h3 style="margin-bottom: 1rem; padding-right: 2rem;">Combinazione</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${combo.ingredients.map(ing => `
                    <span class="tag">${ing}</span>
                `).join('')}
            </div>
        </div>
    `;
}

export function setupCombinationsListeners() {
    const newBtn = document.getElementById('newCombinationBtn');
    if (newBtn) {
        newBtn.removeEventListener('click', showNewCombinationModal);
        newBtn.addEventListener('click', showNewCombinationModal);
    }
}

// Expose functions to window early
window.submitNewCombination = submitNewCombination;
window.deleteCombinationAction = deleteCombinationAction;
window.showNewCombinationModal = showNewCombinationModal;

function showNewCombinationModal() {
    const modalContent = `
        <div class="modal-header">
            <h2 class="modal-title">Nuova Combinazione</h2>
            <button class="modal-close" onclick="window.closeModal()">×</button>
        </div>
        <div class="modal-body">
            <form id="newCombinationForm">
                <div class="form-group">
                    <label class="form-label">Ingredienti (separati da virgola)</label>
                    <textarea class="form-textarea" name="ingredients" required placeholder="es. Gorgonzola, Pere, Noci"></textarea>
                    <p class="text-muted text-sm" style="margin-top: 0.5rem;">Inserisci gli ingredienti esatti come appaiono nelle ricette.</p>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.closeModal()">Annulla</button>
            <button class="btn btn-primary" onclick="window.submitNewCombination()">Salva</button>
        </div>
    `;
    openModal(modalContent);
}

async function submitNewCombination() {
    const form = document.getElementById('newCombinationForm');
    const formData = new FormData(form);
    const ingredientsText = formData.get('ingredients');

    if (!ingredientsText) return;

    const ingredients = ingredientsText.split(',').map(i => i.trim()).filter(i => i.length > 0);

    if (ingredients.length < 2) {
        alert('Inserisci almeno 2 ingredienti');
        return;
    }

    try {
        await addCombination(ingredients);
        closeModal();
        await renderCombinations();
    } catch (error) {
        console.error('Failed to add combination:', error);
    }
}

async function deleteCombinationAction(id) {
    if (!confirm('Sei sicuro di voler eliminare questa combinazione?')) return;

    try {
        await deleteCombination(id);
        await renderCombinations();
    } catch (error) {
        console.error('Failed to delete combination:', error);
    }
}
