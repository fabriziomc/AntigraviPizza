// ============================================
// DISCOVERY COMPONENT
// ============================================

import { importRecipeManually, importSampleRecipes } from '../modules/recipeSearch.js';
import { DOUGH_TYPES } from '../utils/constants.js';
import { getAllPreparations, getAllIngredients } from '../modules/database.js';
// refreshData is available globally via window.refreshData
import { showToast } from '../utils/helpers.js';

// Track selected preparations
let selectedPreparations = [];
// Cache preparations from database
let cachedPreparations = [];

// Track selected ingredients
let selectedIngredients = [];
// Track auto-suggested ingredients
let autoSuggestedIngredients = [];
// Cache ingredients from database
let cachedIngredients = [];

export async function renderDiscovery(state) {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        setupDiscoveryListeners();
    }, 100);
}

function setupDiscoveryListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('.import-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.import-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const tabContent = document.getElementById(`${tabId}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });

    // Manual import form
    const form = document.getElementById('manualImportForm');
    if (form) {
        form.removeEventListener('submit', handleManualImport);
        form.addEventListener('submit', handleManualImport);
    }

    // Import samples button
    const importSamplesBtn = document.getElementById('importSamplesBtn');
    if (importSamplesBtn) {
        importSamplesBtn.removeEventListener('click', handleImportSamples);
        importSamplesBtn.addEventListener('click', handleImportSamples);
    }

    // Populate Dough Types
    const doughSelect = document.getElementById('manualDoughType');
    if (doughSelect && doughSelect.options.length <= 1) { // Only populate if empty (except default)
        DOUGH_TYPES.forEach(dough => {
            const option = document.createElement('option');
            option.value = dough.type;
            option.textContent = dough.type;
            doughSelect.appendChild(option);
        });
    }

    // Populate Preparations Selector
    populatePreparationsSelector();

    // Populate Ingredients Selector
    populateIngredientsSelector();

    // Populate Auto Ingredients Selector
    populateAutoIngredientsSelector();
}

/**
 * Populate preparations selector with checkboxes
 */
async function populatePreparationsSelector() {
    const selector = document.getElementById('preparationsSelector');
    if (!selector) return;

    // Fetch preparations from database
    cachedPreparations = await getAllPreparations();

    // Group by category
    const byCategory = {};
    cachedPreparations.forEach(prep => {
        if (!byCategory[prep.category]) {
            byCategory[prep.category] = [];
        }
        byCategory[prep.category].push(prep);
    });

    selector.innerHTML = Object.entries(byCategory).map(([category, preps]) => `
        <div style="grid-column: 1 / -1; font-weight: 600; color: var(--color-primary-light); margin-top: 0.5rem;">${category}</div>
        ${preps.map(prep => `
            <label class="preparation-option" data-prep-id="${prep.id}">
                <input type="checkbox" value="${prep.id}" onchange="window.togglePreparation('${prep.id}')">
                <span class="preparation-option-label">
                    ${prep.name}
                    <span class="preparation-option-category">${prep.prepTime}</span>
                </span>
            </label>
        `).join('')}
    `).join('');
}

/**
 * Toggle preparation selection
 */
window.togglePreparation = function (prepId) {
    const prep = cachedPreparations.find(p => p.id === prepId);
    if (!prep) return;

    const index = selectedPreparations.findIndex(p => p.id === prepId);

    if (index >= 0) {
        // Remove
        selectedPreparations.splice(index, 1);
    } else {
        // Add with default values
        selectedPreparations.push({
            id: prepId,
            quantity: 100,
            unit: 'g',
            timing: 'before'
        });
    }

    renderSelectedPreparations();
};

/**
 * Render selected preparations
 */
function renderSelectedPreparations() {
    const container = document.getElementById('selectedPreparations');
    if (!container) return;

    if (selectedPreparations.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = selectedPreparations.map(sp => {
        const prep = cachedPreparations.find(p => p.id === sp.id);
        if (!prep) return '';

        return `
            <div class="selected-preparation-item">
                <div class="selected-preparation-info">
                    <div class="selected-preparation-name">${prep.name}</div>
                    <div class="selected-preparation-details">
                        <span>${prep.category}</span>
                        <span>${prep.prepTime}</span>
                    </div>
                </div>
                <div class="selected-preparation-controls">
                    <input type="number" value="${sp.quantity}" min="1" 
                           onchange="window.updatePreparationQuantity('${sp.id}', this.value)"
                           placeholder="Quantità">
                    <select onchange="window.updatePreparationUnit('${sp.id}', this.value)">
                        <option value="g" ${sp.unit === 'g' ? 'selected' : ''}>g</option>
                        <option value="ml" ${sp.unit === 'ml' ? 'selected' : ''}>ml</option>
                        <option value="cucchiai" ${sp.unit === 'cucchiai' ? 'selected' : ''}>cucchiai</option>
                    </select>
                    <select onchange="window.updatePreparationTiming('${sp.id}', this.value)">
                        <option value="before" ${sp.timing === 'before' ? 'selected' : ''}>Prima cottura</option>
                        <option value="after" ${sp.timing === 'after' ? 'selected' : ''}>Dopo cottura</option>
                    </select>
                    <button type="button" class="btn btn-sm btn-ghost" onclick="window.removePreparation('${sp.id}')">
                        ✕
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update preparation quantity
 */
window.updatePreparationQuantity = function (prepId, quantity) {
    const prep = selectedPreparations.find(p => p.id === prepId);
    if (prep) {
        prep.quantity = parseInt(quantity) || 100;
    }
};

/**
 * Update preparation unit
 */
window.updatePreparationUnit = function (prepId, unit) {
    const prep = selectedPreparations.find(p => p.id === prepId);
    if (prep) {
        prep.unit = unit;
    }
};

/**
 * Update preparation timing
 */
window.updatePreparationTiming = function (prepId, timing) {
    const prep = selectedPreparations.find(p => p.id === prepId);
    if (prep) {
        prep.timing = timing;
    }
};

/**
 * Remove preparation
 */
window.removePreparation = function (prepId) {
    const checkbox = document.querySelector(`input[value="${prepId}"]`);
    if (checkbox) {
        checkbox.checked = false;
    }

    const index = selectedPreparations.findIndex(p => p.id === prepId);
    if (index >= 0) {
        selectedPreparations.splice(index, 1);
        renderSelectedPreparations();
    }
};

// ============================================
// INGREDIENTS SELECTOR
// ============================================

/**
 * Populate ingredients selector with dropdown
 */
async function populateIngredientsSelector() {
    const selector = document.getElementById('ingredientsSelector');
    if (!selector) return;

    // Fetch ingredients from database
    cachedIngredients = await getAllIngredients();

    // Group by category
    const byCategory = {};
    cachedIngredients.forEach(ing => {
        if (!byCategory[ing.category]) {
            byCategory[ing.category] = [];
        }
        byCategory[ing.category].push(ing);
    });

    selector.innerHTML = `
        <style>
            #ingredientSelect option,
            #ingredientSelect optgroup {
                background: #1a1f3a;
                color: white;
            }
        </style>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <select id="ingredientSelect" style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--color-border); background: var(--color-bg-secondary); color: var(--color-text);">
                <option value="">Seleziona un ingrediente...</option>
                ${Object.entries(byCategory).map(([category, ings]) => `
                    <optgroup label="${category}">
                        ${ings.map(ing => `
                            <option value="${ing.id}">${ing.name}</option>
                        `).join('')}
                    </optgroup>
                `).join('')}
            </select>
            <button type="button" class="btn btn-sm btn-primary" onclick="window.addIngredient()">
                ➕ Aggiungi
            </button>
        </div>
    `;
}

/**
 * Add ingredient to selection
 */
window.addIngredient = function () {
    const select = document.getElementById('ingredientSelect');
    if (!select || !select.value) return;

    const ingId = select.value;
    const ing = cachedIngredients.find(i => i.id === ingId);
    if (!ing) return;

    // Check if already selected
    if (selectedIngredients.find(i => i.id === ingId)) {
        showToast('Ingrediente già aggiunto', 'warning');
        return;
    }

    // Add with default values from database
    selectedIngredients.push({
        id: ingId,
        name: ing.name,
        quantity: ing.minWeight || 50,
        unit: ing.defaultUnit || 'g',
        category: ing.category
    });

    renderSelectedIngredients();
    select.value = ''; // Reset select
};

/**
 * Render selected ingredients
 */
function renderSelectedIngredients() {
    const container = document.getElementById('selectedIngredients');
    if (!container) return;

    if (selectedIngredients.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = selectedIngredients.map(si => {
        return `
            <div class="selected-item" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <span style="flex: 1; font-weight: 500;">${si.name}</span>
                <span style="font-size: 0.75rem; color: var(--color-gray-400);">${si.category}</span>
                <input 
                    type="number" 
                    value="${si.quantity}" 
                    onchange="window.updateIngredientQuantity('${si.id}', this.value)"
                    style="width: 80px; padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px solid var(--color-border); background: var(--color-bg-secondary); color: var(--color-text);"
                    min="1"
                >
                <select onchange="window.updateIngredientUnit('${si.id}', this.value)" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px solid var(--color-border); background: var(--color-bg-secondary); color: var(--color-text);">
                    <option value="g" ${si.unit === 'g' ? 'selected' : ''}>g</option>
                    <option value="ml" ${si.unit === 'ml' ? 'selected' : ''}>ml</option>
                    <option value="pz" ${si.unit === 'pz' ? 'selected' : ''}>pz</option>
                    <option value="cucchiaio" ${si.unit === 'cucchiaio' ? 'selected' : ''}>cucchiaio</option>
                    <option value="cucchiaino" ${si.unit === 'cucchiaino' ? 'selected' : ''}>cucchiaino</option>
                </select>
                <button type="button" class="btn btn-sm btn-ghost" onclick="window.removeIngredient('${si.id}')">
                    ✕
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Update ingredient quantity
 */
window.updateIngredientQuantity = function (ingId, quantity) {
    const ing = selectedIngredients.find(i => i.id === ingId);
    if (ing) {
        ing.quantity = parseInt(quantity) || 50;
    }
};

/**
 * Update ingredient unit
 */
window.updateIngredientUnit = function (ingId, unit) {
    const ing = selectedIngredients.find(i => i.id === ingId);
    if (ing) {
        ing.unit = unit;
    }
};

/**
 * Remove ingredient
 */
window.removeIngredient = function (ingId) {
    const index = selectedIngredients.findIndex(i => i.id === ingId);
    if (index >= 0) {
        selectedIngredients.splice(index, 1);
        renderSelectedIngredients();
    }
};

// ============================================
// AUTO INGREDIENTS SELECTOR (Discovery)
// ============================================

/**
 * Populate auto-ingredients selector
 */
async function populateAutoIngredientsSelector() {
    const selector = document.getElementById('autoIngredientsSelector');
    if (!selector) return;

    if (cachedIngredients.length === 0) {
        cachedIngredients = await getAllIngredients();
    }

    // Group by category
    const byCategory = {};
    cachedIngredients.forEach(ing => {
        if (!byCategory[ing.category]) {
            byCategory[ing.category] = [];
        }
        byCategory[ing.category].push(ing);
    });

    selector.innerHTML = `
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <select id="autoIngredientSelect" class="form-select" style="flex: 1;">
                <option value="">Aggiungi un ingrediente suggerito...</option>
                ${Object.entries(byCategory).map(([category, ings]) => `
                    <optgroup label="${category}">
                        ${ings.map(ing => `
                            <option value="${ing.id}">${ing.name}</option>
                        `).join('')}
                    </optgroup>
                `).join('')}
            </select>
            <button type="button" class="btn btn-sm btn-accent" onclick="window.addAutoIngredient()" style="min-width: 44px; font-size: 1.25rem; font-weight: bold;">
                +
            </button>
        </div>
    `;
}

/**
 * Add auto-suggested ingredient
 */
window.addAutoIngredient = function () {
    const select = document.getElementById('autoIngredientSelect');
    if (!select || !select.value) return;

    const ingId = select.value;
    const ing = cachedIngredients.find(i => i.id === ingId);
    if (!ing) return;

    if (autoSuggestedIngredients.find(i => i.id === ingId)) {
        showToast('Già suggerito', 'warning');
        return;
    }

    autoSuggestedIngredients.push({
        id: ingId,
        name: ing.name
    });

    renderAutoSelectedIngredients();
    select.value = '';
};

/**
 * Render auto-selected ingredients as chips
 */
function renderAutoSelectedIngredients() {
    const container = document.getElementById('autoSelectedIngredients');
    if (!container) return;

    if (autoSuggestedIngredients.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = autoSuggestedIngredients.map(si => `
        <div class="ingredient-chip" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; background: var(--color-accent); color: white; border-radius: 2rem; font-size: 0.875rem; font-weight: 500;">
            ${si.name}
            <span onclick="window.removeAutoIngredient('${si.id}')" style="cursor: pointer; opacity: 0.8; font-weight: bold; margin-left: 0.25rem;">✕</span>
        </div>
    `).join('');

    // Update window property so recipeSearch can access it
    window.autoSuggestedIngredients = autoSuggestedIngredients.map(i => i.name);
}

/**
 * Remove auto-suggested ingredient
 */
window.removeAutoIngredient = function (ingId) {
    const index = autoSuggestedIngredients.findIndex(i => i.id === ingId);
    if (index >= 0) {
        autoSuggestedIngredients.splice(index, 1);
        renderAutoSelectedIngredients();
    }
};

async function handleManualImport(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Use selected ingredients from selector
    const ingredients = selectedIngredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category
    }));

    // Parse instructions
    const instructionsText = formData.get('instructions');
    const instructions = instructionsText.split('\n')
        .filter(line => line.trim());

    // Parse tags
    const tagsText = formData.get('tags');
    const tags = tagsText.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

    const recipeData = {
        name: formData.get('name'),
        pizzaiolo: formData.get('pizzaiolo') || 'Sconosciuto',
        dough: formData.get('dough') || '',
        source: formData.get('source') || '',
        description: formData.get('description') || '',
        imageUrl: formData.get('imageUrl') || '',
        baseIngredients: ingredients,  // Renamed from ingredients
        preparations: [...selectedPreparations],  // Add preparations
        instructions,
        tags
    };

    try {
        await importRecipeManually(recipeData);
        await refreshData();
        e.target.reset();

        // Reset preparations
        selectedPreparations = [];
        renderSelectedPreparations();

        // Uncheck all checkboxes
        document.querySelectorAll('#preparationsSelector input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset ingredients
        selectedIngredients = [];
        renderSelectedIngredients();

        showToast('Ricetta importata con successo!', 'success');
    } catch (error) {
        console.error('Failed to import recipe:', error);
        showToast('Errore nell\'importazione della ricetta', 'error');
    }
}

async function handleImportSamples() {
    console.log('handleImportSamples called'); // DEBUG
    try {
        const imported = await importSampleRecipes();
        console.log('Imported recipes:', imported); // DEBUG

        if (window.refreshData) {
            await window.refreshData();
        } else {
            console.warn('window.refreshData not available');
        }
    } catch (error) {
        console.error('Failed to import samples:', error);
        showToast('Errore nell\'importazione delle ricette di esempio', 'error');
    }
}
