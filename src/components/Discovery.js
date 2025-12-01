// ============================================
// DISCOVERY COMPONENT
// ============================================

import { importRecipeManually, importSampleRecipes } from '../modules/recipeSearch.js';
// refreshData is available globally via window.refreshData
import { showToast } from '../utils/helpers.js';

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
}

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
        source: formData.get('source') || '',
        description: formData.get('description') || '',
        imageUrl: formData.get('imageUrl') || '',
        ingredients,
        instructions,
        tags
    };

    try {
        await importRecipeManually(recipeData);
        await refreshData();
        e.target.reset();
    } catch (error) {
        console.error('Failed to import recipe:', error);
    }
}

async function handleImportSamples() {
    try {
        await importSampleRecipes();
        await refreshData();
    } catch (error) {
        console.error('Failed to import samples:', error);
        showToast('Errore nell\'importazione delle ricette di esempio', 'error');
    }
}
