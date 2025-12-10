// ============================================
// DISCOVERY COMPONENT
// ============================================

import { importRecipeManually, importSampleRecipes } from '../modules/recipeSearch.js';
import { DOUGH_TYPES } from '../utils/constants.js';
import { getAllPreparations } from '../modules/database.js';
// refreshData is available globally via window.refreshData
import { showToast } from '../utils/helpers.js';

// Track selected preparations
let selectedPreparations = [];
// Cache preparations from database
let cachedPreparations = [];

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

async function handleManualImport(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Parse ingredients
    const ingredientsText = formData.get('ingredients');
    const ingredients = ingredientsText.split('\n')
        .filter(line => line.trim())
        .map(line => {
            const parts = line.split(',').map(p => p.trim());
            return {
                name: parts[0] || '',
                quantity: parseFloat(parts[1]) || 0,
                unit: parts[2] || 'g',
                category: parts[3] || 'Altro'
            };
        });

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
