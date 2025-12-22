// ============================================
// ARCHETYPES COMPONENT
// ============================================

import { getAllRecipes } from '../modules/database.js';

// Archetype definitions with labels and descriptions
const ARCHETYPES = {
    'combinazioni_db': {
        icon: '📚',
        label: 'Combinazioni Salvate',
        description: 'Pizze create da combinazioni di ingredienti salvate nel database',
        color: '#f59e0b'
    },
    'classica': {
        icon: '🍕',
        label: 'Classica',
        description: 'Pizza in stile Margherita e Marinara, i grandi classici napoletani',
        color: '#ef4444'
    },
    'tradizionale': {
        icon: '👨‍🍳',
        label: 'Tradizionale',
        description: 'Pizze tradizionali come Prosciutto, Funghi, Capricciosa',
        color: '#f97316'
    },
    'terra_bosco': {
        icon: '🍄',
        label: 'Terra e Bosco',
        description: 'Sapori rustici con funghi porcini, tartufo e ingredienti del sottobosco',
        color: '#84cc16'
    },
    'fresca_estiva': {
        icon: '🌿',
        label: 'Fresca Estiva',
        description: 'Ingredienti freschi e leggeri, perfetti per l\'estate',
        color: '#10b981'
    },
    'piccante_decisa': {
        icon: '🌶️',
        label: 'Piccante',
        description: 'Gusti decisi con nduja, peperoncino e sapori intensi',
        color: '#dc2626'
    },
    'mare': {
        icon: '🐟',
        label: 'Mare',
        description: 'Frutti di mare e pesce fresco per gli amanti del mare',
        color: '#3b82f6'
    },
    'vegana': {
        icon: '🌱',
        label: 'Vegana',
        description: 'Completamente vegetale, ricca di verdure e sapori naturali',
        color: '#22c55e'
    },
    'dolce_salato': {
        icon: '🍯',
        label: 'Dolce/Salato',
        description: 'Equilibrio perfetto tra ingredienti dolci e salati',
        color: '#a855f7'
    },
    'fusion': {
        icon: '🌟',
        label: 'Fusion',
        description: 'Interpretazioni contemporanee e creative',
        color: '#8b5cf6'
    }
};

/**
 * Get statistics for each archetype
 */
async function getArchetypeStats() {
    const recipes = await getAllRecipes();

    const stats = {};

    // Initialize stats for all archetypes
    Object.keys(ARCHETYPES).forEach(key => {
        stats[key] = {
            count: 0,
            recipes: []
        };
    });

    // Count recipes by archetype
    recipes.forEach(recipe => {
        const archetype = recipe.archetypeUsed || 'unknown';
        if (stats[archetype]) {
            stats[archetype].count++;
            stats[archetype].recipes.push(recipe);
        }
    });

    return stats;
}

/**
 * Render main archetypes view
 */
export async function renderArchetypes() {
    const archetypesView = document.getElementById('archetypes-view');

    const stats = await getArchetypeStats();
    const totalRecipes = await getAllRecipes();
    const totalArchetypeRecipes = totalRecipes.filter(r => r.recipeSource === 'archetype' || r.recipeSource === 'combination').length;

    archetypesView.innerHTML = `
        <div class="archetypes-container fade-in">
            <div class="page-header">
                <h1 class="page-title">🎨 Archetipi Pizza</h1>
                <p class="page-description">
                    Gli archetipi sono modelli di pizze che guidano la generazione automatica. 
                    Ogni archetipo rappresenta uno stile o tema specifico di pizza.
                </p>
            </div>

            <div class="archetypes-summary card">
                <h3>📊 Riepilogo</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${totalArchetypeRecipes}</span>
                        <span class="stat-label">Pizze generate</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${Object.keys(ARCHETYPES).length}</span>
                        <span class="stat-label">Archetipi disponibili</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${Object.values(stats).filter(s => s.count > 0).length}</span>
                        <span class="stat-label">Archetipi utilizzati</span>
                    </div>
                </div>
            </div>

            <div class="archetypes-grid">
                ${Object.entries(ARCHETYPES).map(([key, archetype]) => {
        const archetypeStats = stats[key] || { count: 0, recipes: [] };
        const percentage = totalArchetypeRecipes > 0
            ? Math.round((archetypeStats.count / totalArchetypeRecipes) * 100)
            : 0;

        return `
                        <div class="archetype-card" data-archetype="${key}" style="--archetype-color: ${archetype.color}">
                            <div class="archetype-header">
                                <span class="archetype-icon">${archetype.icon}</span>
                                <h3 class="archetype-name">${archetype.label}</h3>
                            </div>
                            <p class="archetype-description">${archetype.description}</p>
                            
                            <div class="archetype-stats">
                                <div class="archetype-count">
                                    <span class="count-number">${archetypeStats.count}</span>
                                    <span class="count-label">pizze generate</span>
                                </div>
                                <div class="archetype-percentage">
                                    <div class="percentage-bar">
                                        <div class="percentage-fill" style="width: ${percentage}%; background-color: ${archetype.color}"></div>
                                    </div>
                                    <span class="percentage-text">${percentage}%</span>
                                </div>
                            </div>
                            
                            ${archetypeStats.count > 0 ? `
                                <button class="btn btn-secondary btn-sm mt-4" onclick="window.viewArchetypeRecipes('${key}')">
                                    👁️ Vedi Pizze (${archetypeStats.count})
                                </button>
                            ` : `
                                <p class="text-muted mt-4">Nessuna pizza generata con questo archetipo</p>
                            `}
                        </div>
                    `;
    }).join('')}
            </div>

            <div class="archetypes-footer mt-8">
                <div class="card">
                    <h3>⚙️ Personalizza i Pesi</h3>
                    <p>Vuoi modificare la frequenza con cui vengono generati i diversi archetipi?</p>
                    <button class="btn btn-primary mt-4" onclick="window.navigateToView('settings')">
                        Vai alle Impostazioni
                    </button>
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    setupArchetypesListeners();
}

/**
 * View recipes for a specific archetype
 */
window.viewArchetypeRecipes = async function (archetypeKey) {
    const recipes = await getAllRecipes();
    const archetypeRecipes = recipes.filter(r => r.archetypeUsed === archetypeKey);
    const archetype = ARCHETYPES[archetypeKey];

    if (!archetype || archetypeRecipes.length === 0) {
        return;
    }

    const modalHtml = `
        <div class="modal-backdrop active" id="archetypeModal">
            <div class="modal modal-large">
                <div class="modal-header">
                    <h2 class="modal-title">${archetype.icon} ${archetype.label}</h2>
                    <button class="modal-close" onclick="window.closeArchetypeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="mb-6">${archetype.description}</p>
                    <h3 class="mb-4">Pizze Generate (${archetypeRecipes.length})</h3>
                    <div class="archetype-recipes-grid">
                        ${archetypeRecipes.map(recipe => `
                            <div class="recipe-mini-card" onclick="window.openRecipeDetail('${recipe.id}')">
                                <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-mini-img">
                                <div class="recipe-mini-info">
                                    <h4>${recipe.name}</h4>
                                    <p class="text-muted text-sm">${recipe.pizzaiolo}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.closeArchetypeModal()">Chiudi</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

/**
 * Close archetype modal
 */
window.closeArchetypeModal = function () {
    const modal = document.getElementById('archetypeModal');
    if (modal) {
        modal.remove();
    }
};

/**
 * Open recipe detail (redirect to library with recipe open)
 */
window.openRecipeDetail = function (recipeId) {
    window.closeArchetypeModal();
    window.location.hash = '#library';
    // Small delay to ensure library is loaded
    setTimeout(() => {
        const recipeCard = document.querySelector(`[data-recipe-id="${recipeId}"]`);
        if (recipeCard) {
            recipeCard.click();
        }
    }, 100);
};

/**
 * Setup event listeners
 */
function setupArchetypesListeners() {
    // Add hover effects to archetype cards
    document.querySelectorAll('.archetype-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}
