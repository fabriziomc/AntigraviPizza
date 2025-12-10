// ============================================
// INGREDIENTS COMPONENT
// ============================================

import { getAllIngredients, getIngredientsByCategory, searchIngredients, addIngredient, updateIngredient, deleteIngredient } from '../modules/database.js';
import { openModal, closeModal } from '../modules/ui.js';

const CATEGORIES = ['Formaggi', 'Carne', 'Verdure', 'Salsa', 'Erbe e Spezie', 'Pesce', 'Altro'];
const UNITS = ['g', 'ml', 'pz', 'cucchiaio', 'cucchiaino'];

let currentFilter = 'all';
let currentSearch = '';
let allIngredients = [];

// ============================================
// MAIN RENDER
// ============================================

export async function renderIngredients(appState) {
    const container = document.getElementById('ingredients-view');
    if (!container) return;

    try {
        // Load ingredients
        allIngredients = await getAllIngredients();

        container.innerHTML = `
            <div class="ingredients-container">
                <div class="page-header">
                    <h1>🥗 Gestione Ingredienti</h1>
                    <button class="btn btn-primary" onclick="window.showIngredientForm()">
                        <span>➕</span> Nuovo Ingrediente
                    </button>
                </div>

                <div class="ingredients-toolbar">
                    <div class="search-box">
                        <input 
                            type="text" 
                            id="ingredient-search" 
                            placeholder="🔍 Cerca ingrediente..."
                            value="${currentSearch}"
                        >
                    </div>
                    
                    <div class="filter-buttons">
                        <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="window.filterIngredients('all')">
                            Tutti (${allIngredients.length})
                        </button>
                        ${CATEGORIES.map(cat => {
            const count = allIngredients.filter(i => i.category === cat).length;
            return `
                                <button class="filter-btn ${currentFilter === cat ? 'active' : ''}" onclick="window.filterIngredients('${cat}')">
                                    ${cat} (${count})
                                </button>
                            `;
        }).join('')}
                        <button class="filter-btn ${currentFilter === 'custom' ? 'active' : ''}" onclick="window.filterIngredients('custom')">
                            Custom (${allIngredients.filter(i => i.isCustom).length})
                        </button>
                    </div>
                </div>

                <div id="ingredients-list" class="ingredients-list">
                    ${renderIngredientsList()}
                </div>
            </div>
        `;

        // Add search listener
        document.getElementById('ingredient-search').addEventListener('input', (e) => {
            currentSearch = e.target.value;
            updateIngredientsList();
        });

    } catch (error) {
        console.error('Error rendering ingredients:', error);
        container.innerHTML = `
            <div class="error-state">
                <h2>⚠️ Errore</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// RENDER HELPERS
// ============================================

function renderIngredientsList() {
    let filtered = allIngredients;

    // Apply category filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'custom') {
            filtered = filtered.filter(i => i.isCustom);
        } else {
            filtered = filtered.filter(i => i.category === currentFilter);
        }
    }

    // Apply search filter
    if (currentSearch) {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(i => i.name.toLowerCase().includes(search));
    }

    if (filtered.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">Nessun ingrediente trovato</h3>
                <p class="empty-description">
                    ${currentSearch ? 'Prova con un altro termine di ricerca' : 'Aggiungi il tuo primo ingrediente personalizzato'}
                </p>
            </div>
        `;
    }

    return filtered.map(ingredient => `
        <div class="ingredient-card ${ingredient.isCustom ? 'custom' : ''}">
            <div class="ingredient-header">
                <h3 class="ingredient-name">${ingredient.name}</h3>
                ${ingredient.isCustom ? '<span class="badge badge-custom">Custom</span>' : ''}
            </div>
            
            <div class="ingredient-details">
                <div class="detail-row">
                    <span class="detail-label">Categoria:</span>
                    <span class="detail-value">${ingredient.category}</span>
                </div>
                
                ${ingredient.subcategory ? `
                    <div class="detail-row">
                        <span class="detail-label">Sottocategoria:</span>
                        <span class="detail-value">${ingredient.subcategory}</span>
                    </div>
                ` : ''}
                
                ${ingredient.minWeight && ingredient.maxWeight ? `
                    <div class="detail-row">
                        <span class="detail-label">Quantità:</span>
                        <span class="detail-value">${ingredient.minWeight}-${ingredient.maxWeight} ${ingredient.defaultUnit}</span>
                    </div>
                ` : ''}
                
                <div class="detail-row">
                    <span class="detail-label">Aggiunta:</span>
                    <span class="detail-value">${ingredient.postBake ? 'Dopo cottura' : 'Prima cottura'}</span>
                </div>
                
                ${ingredient.tags && ingredient.tags.length > 0 ? `
                    <div class="detail-row">
                        <span class="detail-label">Tags:</span>
                        <span class="detail-value">${ingredient.tags.join(', ')}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="ingredient-actions">
                <button class="btn btn-sm btn-secondary" onclick="window.editIngredient('${ingredient.id}')">
                    <span>✏️</span> Modifica
                </button>
                ${ingredient.isCustom ? `
                    <button class="btn btn-sm btn-danger" onclick="window.confirmDeleteIngredient('${ingredient.id}', '${ingredient.name}')">
                        <span>🗑️</span> Elimina
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function updateIngredientsList() {
    const listContainer = document.getElementById('ingredients-list');
    if (listContainer) {
        listContainer.innerHTML = renderIngredientsList();
    }
}

// ============================================
// INGREDIENT FORM
// ============================================

async function showIngredientForm(ingredientId = null) {
    let ingredient = null;
    let isEdit = false;

    if (ingredientId) {
        ingredient = allIngredients.find(i => i.id === ingredientId);
        isEdit = true;
    }

    const modalContent = `
        <div class="modal-header">
            <h2>${isEdit ? '✏️ Modifica Ingrediente' : '➕ Nuovo Ingrediente'}</h2>
            <button class="modal-close" onclick="window.closeModal()">×</button>
        </div>
        
        <div class="modal-body">
            <form id="ingredient-form" class="ingredient-form">
                <div class="form-group">
                    <label for="ing-name">Nome *</label>
                    <input 
                        type="text" 
                        id="ing-name" 
                        required 
                        placeholder="Es. Mozzarella di bufala"
                        value="${ingredient?.name || ''}"
                    >
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="ing-category">Categoria *</label>
                        <select id="ing-category" required>
                            <option value="">Seleziona...</option>
                            ${CATEGORIES.map(cat => `
                                <option value="${cat}" ${ingredient?.category === cat ? 'selected' : ''}>
                                    ${cat}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="ing-subcategory">Sottocategoria</label>
                        <input 
                            type="text" 
                            id="ing-subcategory" 
                            placeholder="Es. Freschi, Stagionati"
                            value="${ingredient?.subcategory || ''}"
                        >
                    </div>
                </div>

                <div class="form-section">
                    <h3>Quantità</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="ing-min-weight">Min</label>
                            <input 
                                type="number" 
                                id="ing-min-weight" 
                                min="0"
                                placeholder="0"
                                value="${ingredient?.minWeight || ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="ing-max-weight">Max</label>
                            <input 
                                type="number" 
                                id="ing-max-weight" 
                                min="0"
                                placeholder="0"
                                value="${ingredient?.maxWeight || ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="ing-unit">Unità</label>
                            <select id="ing-unit">
                                ${UNITS.map(unit => `
                                    <option value="${unit}" ${ingredient?.defaultUnit === unit ? 'selected' : ''}>
                                        ${unit}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            id="ing-post-bake"
                            ${ingredient?.postBake ? 'checked' : ''}
                        >
                        <span>Aggiungere dopo la cottura</span>
                    </label>
                </div>

                <div class="form-group">
                    <label for="ing-tags">Tags (separati da virgola)</label>
                    <input 
                        type="text" 
                        id="ing-tags" 
                        placeholder="Es. vegetariano, premium, locale"
                        value="${ingredient?.tags?.join(', ') || ''}"
                    >
                    <small>Esempi: vegetariano, vegano, premium, locale, stagionale</small>
                </div>
            </form>
        </div>

        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.closeModal()">
                Annulla
            </button>
            <button class="btn btn-primary" onclick="window.submitIngredientForm(${isEdit ? `'${ingredientId}'` : 'null'})">
                ${isEdit ? 'Salva Modifiche' : 'Crea Ingrediente'}
            </button>
        </div>
    `;

    openModal(modalContent);
}

async function submitIngredientForm(ingredientId) {
    const form = document.getElementById('ingredient-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const name = document.getElementById('ing-name').value.trim();
    const category = document.getElementById('ing-category').value;
    const subcategory = document.getElementById('ing-subcategory').value.trim() || null;
    const minWeight = parseInt(document.getElementById('ing-min-weight').value) || null;
    const maxWeight = parseInt(document.getElementById('ing-max-weight').value) || null;
    const defaultUnit = document.getElementById('ing-unit').value;
    const postBake = document.getElementById('ing-post-bake').checked;
    const tagsInput = document.getElementById('ing-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    const ingredientData = {
        name,
        category,
        subcategory,
        minWeight,
        maxWeight,
        defaultUnit,
        postBake,
        tags,
        phase: 'topping'
    };

    try {
        if (ingredientId) {
            // Update existing
            await updateIngredient(ingredientId, ingredientData);
        } else {
            // Create new
            await addIngredient(ingredientData);
        }

        closeModal();

        // Reload and re-render
        await renderIngredients({});

    } catch (error) {
        console.error('Error saving ingredient:', error);
        alert('Errore nel salvare l\'ingrediente: ' + error.message);
    }
}

// ============================================
// DELETE CONFIRMATION
// ============================================

function confirmDeleteIngredient(id, name) {
    const modalContent = `
        <div class="modal-header">
            <h2>🗑️ Elimina Ingrediente</h2>
            <button class="modal-close" onclick="window.closeModal()">×</button>
        </div>
        
        <div class="modal-body">
            <p>Sei sicuro di voler eliminare <strong>${name}</strong>?</p>
            <p class="text-warning">⚠️ Questa azione non può essere annullata.</p>
        </div>

        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.closeModal()">
                Annulla
            </button>
            <button class="btn btn-danger" onclick="window.deleteIngredientConfirmed('${id}')">
                Elimina
            </button>
        </div>
    `;

    openModal(modalContent);
}

async function deleteIngredientConfirmed(id) {
    try {
        await deleteIngredient(id);
        closeModal();
        await renderIngredients({});
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        alert('Errore nell\'eliminare l\'ingrediente: ' + error.message);
    }
}

// ============================================
// FILTER FUNCTIONS
// ============================================

async function filterIngredients(filter) {
    currentFilter = filter;
    await updateIngredientsList();

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ============================================
// GLOBAL EXPORTS
// ============================================

window.showIngredientForm = showIngredientForm;
window.submitIngredientForm = submitIngredientForm;
window.editIngredient = (id) => showIngredientForm(id);
window.confirmDeleteIngredient = confirmDeleteIngredient;
window.deleteIngredientConfirmed = deleteIngredientConfirmed;
window.filterIngredients = filterIngredients;
