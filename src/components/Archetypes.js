// ============================================
// ARCHETYPES COMPONENT
// ============================================

import { getAllRecipes } from '../modules/database.js';
import { ARCHETYPES } from '../utils/constants.js';
import { state } from '../store.js';


// Criteri di selezione ingredienti per archetipo
const ARCHETYPE_TAG_CRITERIA = {
    'combinazioni_db': {
        intro: 'Utilizza combinazioni predefinite salvate nel database',
        criteria: [
            '📚 Abbinamenti testati e approvati dal team',
            '🎯 Ingredienti scelti da combinazioni fisse',
            '✨ Varianti create combinando ricette esistenti'
        ]
    },
    'classica': {
        intro: 'I grandi classici della tradizione napoletana con ingredienti semplici e autentici',
        criteria: [
            '🍅 Salse: pomodoro San Marzano o passata classica',
            '🧀 Formaggi: mozzarella di bufala o fior di latte',
            '🌿 Finishing: basilico fresco e olio EVO'
        ]
    },
    'tradizionale': {
        intro: 'Pizze della tradizione italiana con ingredienti classici e ricette consolidate',
        criteria: [
            '🍅 Base: pomodoro classico o bianca',
            '🧀 Formaggi: mozzarella tradizionale',
            '🥩 Carni: prosciutto cotto/crudo, salame classico',
            '🍄 Verdure: funghi, carciofi, olive tradizionali'
        ]
    },
    'terra_bosco': {
        intro: 'Sapori rustici del sottobosco con ingredienti autunnali e invernali',
        criteria: [
            '🍄 Funghi: porcini, champignon o funghi misti',
            '🥓 Carni: intense e saporite come guanciale, pancetta o salsiccia',
            '🌰 Premium: tartufo nero/bianco o creme vegetali',
            '🧀 Formaggi: provola affumicata o formaggi stagionati'
        ]
    },
    'fresca_estiva': {
        intro: 'Ingredienti leggeri e freschi, perfetti per la stagione calda',
        criteria: [
            '🧀 Formaggi: freschi come burrata, stracciatella o ricotta',
            '🥬 Verdure: a foglia come rucola, spinaci o lattuga',
            '🥩 Carni: delicate come prosciutto crudo, bresaola',
            '🐟 Pesce: alici, salmone affumicato (a crudo)',
            '🌿 Finishing: erbe fresche, limone, olio aromatizzato'
        ]
    },
    'piccante_decisa': {
        intro: 'Gusti decisi e carattere forte con un equilibrio tra piccante e dolce',
        criteria: [
            '🌶️ Carni: piccanti come nduja, salame piccante, ventricina',
            '🧅 Verdure: cipolle caramellate, peperoni grigliati',
            '🍯 Contrasti: miele, fichi o altre note dolci per equilibrare',
            '🧀 Formaggi: freschi per bilanciare il piccante'
        ]
    },
    'mare': {
        intro: 'Sapori del mare con pesce fresco e frutti di mare di qualità',
        criteria: [
            '🦐 Frutti di mare: gamberi, scampi, cozze, vongole, polpo',
            '🐟 Pesce: tonno fresco, salmone, alici di Cetara',
            '🧀 Formaggi: delicati o assenti per non coprire il sapore',
            '💧 Base: olio EVO, aglio, prezzemolo',
            '🌿 Finishing: erbe aromatiche, limone grattugiato'
        ]
    },
    'vegana': {
        intro: 'Completamente vegetale con verdure sostanziose e creme vegetali',
        criteria: [
            '🥬 Verdure: sostanziose come melanzane, zucchine, peperoni',
            '🌿 A foglia: spinaci, rucola, cavolo nero',
            '🍄 Funghi: per corpo e sapore umami',
            '🥜 Creme: vegetali come hummus, crema di ceci, pesto',
            '🌰 Finishing: frutta secca, semi, olio aromatizzato'
        ]
    },
    'dolce_salato': {
        intro: 'Equilibrio perfetto tra sapori contrastanti dolci e salati',
        criteria: [
            '🧀 Formaggi: sapidi come gorgonzola, taleggio o formaggi stagionati',
            '🍐 Frutta: dolce come pere, fichi, mele o miele',
            '🥜 Croccantezza: noci, pistacchi, mandorle o nocciole',
            '✨ Base: spesso bianca per esaltare i contrasti'
        ]
    },
    'fusion': {
        intro: 'Interpretazioni contemporanee che mescolano tradizioni diverse',
        criteria: [
            '🌍 Ingredienti: da diverse tradizioni culinarie',
            '🎨 Creatività: abbinamenti innovativi e inaspettati',
            '⚡ Tecniche: preparazioni moderne e sperimentali',
            '🌟 Presentazione: estetica contemporanea'
        ]
    }
};

/**
 * Get statistics for each archetype
 * @param {Array} recipes - List of recipes
 */
function getArchetypeStats(recipes) {
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

    // Only fetch if not already loaded or empty
    if (!state.recipes || state.recipes.length === 0) {
        state.recipes = await getAllRecipes();
    }
    const recipes = state.recipes;

    const stats = getArchetypeStats(recipes);
    const totalRecipes = recipes.length;
    const totalArchetypeRecipes = recipes.filter(r => r.recipeSource === 'archetype' || r.recipeSource === 'combination').length;

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
    // Only fetch if not already loaded or empty
    if (!state.recipes || state.recipes.length === 0) {
        state.recipes = await getAllRecipes();
    }
    const recipes = state.recipes;
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
                    
                    ${ARCHETYPE_TAG_CRITERIA[archetypeKey] ? `
                        <div class="archetype-criteria-section mb-8">
                            <h3 class="criteria-title">🎯 Criteri di Selezione Ingredienti</h3>
                            <p class="criteria-intro">${ARCHETYPE_TAG_CRITERIA[archetypeKey].intro}</p>
                            <ul class="criteria-list">
                                ${ARCHETYPE_TAG_CRITERIA[archetypeKey].criteria.map(criterion => `
                                    <li>${criterion}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
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
