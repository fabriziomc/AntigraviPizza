// ============================================
// LIBRARY COMPONENT
// ============================================

import { getAllRecipes, getRecipeById, toggleFavorite, deleteRecipe, updateRecipe } from '../modules/database.js';
import { RECIPE_TAGS, DOUGH_TYPES, PREPARATIONS, ARCHETYPES } from '../utils/constants.js';
import { getRecipeDoughType } from '../utils/doughHelper.js';
import { debounce, showToast } from '../utils/helpers.js';
import { state } from '../store.js';
import { openModal, closeModal } from '../modules/ui.js';
import { getToken } from '../modules/auth.js';

export async function renderLibrary(appState) {
  // Only fetch if not already loaded or empty
  if (!state.recipes || state.recipes.length === 0) {
    state.recipes = await getAllRecipes();
  }

  await renderFilters(state.recipes);
  await renderRecipes(appState);
  setupLibraryListeners();
}

async function renderFilters(recipes) {
  const filtersContainer = document.getElementById('recipeFilters');

  // Extract unique ingredients from all recipes with their categories
  const ingredientsMap = new Map();
  recipes.forEach(recipe => {
    try {
      // Parse baseIngredients
      if (recipe.baseIngredients) {
        const baseIng = typeof recipe.baseIngredients === 'string'
          ? JSON.parse(recipe.baseIngredients)
          : recipe.baseIngredients;
        baseIng.forEach(ing => {
          if (ing.name && !ingredientsMap.has(ing.name)) {
            ingredientsMap.set(ing.name, ing.category || 'Altro');
          }
        });
      }

      // Parse preparations
      if (recipe.preparations) {
        const preps = typeof recipe.preparations === 'string'
          ? JSON.parse(recipe.preparations)
          : recipe.preparations;
        preps.forEach(prep => {
          if (prep.id) {
            const prepData = PREPARATIONS.find(p => p.id === prep.id);
            if (prepData && !ingredientsMap.has(prepData.name)) {
              ingredientsMap.set(prepData.name, prepData.category || 'Altro');
            }
          }
        });
      }
    } catch (e) {
      console.warn('Error parsing ingredients for recipe:', recipe.name, e);
    }
  });

  // Group ingredients by category
  const byCategory = {};
  ingredientsMap.forEach((category, name) => {
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(name);
  });

  // Sort categories and ingredients within each category
  Object.keys(byCategory).forEach(cat => {
    byCategory[cat].sort();
  });

  filtersContainer.innerHTML = `
    <div class="filters-scroll">
      <button class="filter-chip active" data-tag="all">Tutte</button>
      <button class="filter-chip" data-tag="favorites">⭐ Preferite</button>
      ${RECIPE_TAGS.map(tag => `
        <button class="filter-chip" data-tag="${tag}">${tag}</button>
      `).join('')}
    </div>
    
    <div class="filters-sort" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
      <div style="position: relative; flex: 1; min-width: 160px;">
        <input 
          type="text" 
          id="ingredientSearch" 
          class="sort-select" 
          placeholder="🔍 Cerca ingrediente..."
          style="width: 100%; padding-right: 2.5rem;"
        >
        <button 
          id="clearSearch" 
          style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-gray-400); cursor: pointer; font-size: 1.2rem; display: none;"
          title="Cancella ricerca"
        >×</button>
      </div>
      
      <select id="ingredientFilter" class="sort-select" style="min-width: 160px;">
        <option value="all">🥘 Tutti gli ingredienti</option>
        ${Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, ings]) => `
          <optgroup label="${category}">
            ${ings.map(ing => `<option value="${ing}">${ing}</option>`).join('')}
          </optgroup>
        `).join('')}
      </select>

      <select id="recipeSort" class="sort-select">
        <option value="newest">📅 Più recenti</option>
        <option value="oldest">📅 Meno recenti</option>
        <option value="rating">⭐ Rating</option>
        <option value="az">🔤 A-Z</option>
        <option value="za">🔤 Z-A</option>
      </select>
    </div>
  `;

  // Add search functionality
  const searchInput = document.getElementById('ingredientSearch');
  const ingredientFilter = document.getElementById('ingredientFilter');
  const clearBtn = document.getElementById('clearSearch');

  if (searchInput && ingredientFilter) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      // Show/hide clear button
      if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'block' : 'none';
      }

      if (!searchTerm) {
        // Reset to "all" if search is cleared
        ingredientFilter.value = 'all';
        ingredientFilter.dispatchEvent(new Event('change'));
        return;
      }

      // Find matching ingredient
      let found = false;
      const options = ingredientFilter.querySelectorAll('option');
      for (const option of options) {
        if (option.value !== 'all' && option.textContent.toLowerCase().includes(searchTerm)) {
          ingredientFilter.value = option.value;
          ingredientFilter.dispatchEvent(new Event('change'));
          found = true;
          break;
        }
      }

      if (!found) {
        // If no exact match, just trigger the filter with current value
        ingredientFilter.dispatchEvent(new Event('change'));
      }
    });

    // Clear button functionality
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        ingredientFilter.value = 'all';
        ingredientFilter.dispatchEvent(new Event('change'));
      });
    }
  }
}

async function renderRecipes(state) {
  const grid = document.getElementById('recipesGrid');
  let recipes = [...state.recipes];

  // Apply search filter
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    recipes = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(term) ||
      recipe.description.toLowerCase().includes(term)
    );
  }

  // Apply tag filter
  if (state.selectedTag && state.selectedTag !== 'all') {
    if (state.selectedTag === 'favorites') {
      recipes = recipes.filter(recipe => recipe.isFavorite);
    } else {
      recipes = recipes.filter(recipe => recipe.tags.includes(state.selectedTag));
    }
  }

  // Apply ingredient filter
  if (state.selectedIngredient && state.selectedIngredient !== 'all') {
    recipes = recipes.filter(recipe => {
      try {
        // Check baseIngredients
        if (recipe.baseIngredients) {
          const baseIng = typeof recipe.baseIngredients === 'string'
            ? JSON.parse(recipe.baseIngredients)
            : recipe.baseIngredients;
          if (baseIng.some(ing => ing.name === state.selectedIngredient)) {
            return true;
          }
        }

        // Check preparations
        if (recipe.preparations) {
          const preps = typeof recipe.preparations === 'string'
            ? JSON.parse(recipe.preparations)
            : recipe.preparations;
          return preps.some(prep => {
            const prepData = PREPARATIONS.find(p => p.id === prep.id);
            return prepData && prepData.name === state.selectedIngredient;
          });
        }
      } catch (e) {
        console.warn('Error filtering by ingredient:', e);
      }
      return false;
    });
  }

  // Apply sorting
  const sortBy = state.sortBy || 'newest';
  recipes.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (b.dateAdded || 0) - (a.dateAdded || 0);
      case 'oldest':
        return (a.dateAdded || 0) - (b.dateAdded || 0);
      case 'rating':
        // Sort by rating (highest first), then by date for ties
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        return ratingDiff !== 0 ? ratingDiff : (b.dateAdded || 0) - (a.dateAdded || 0);
      case 'az':
        return a.name.localeCompare(b.name);
      case 'za':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  if (recipes.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🍕</div>
        <h3 class="empty-title">Nessuna ricetta trovata</h3>
        <p class="empty-description">Prova a modificare i filtri o aggiungi nuove ricette</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
}

function createRecipeCard(recipe) {
  // Determine origin badge
  let originBadge = '';
  if (recipe.recipeSource === 'manual') {
    originBadge = '<span class="origin-badge origin-manual" title="Ricetta inserita manualmente">🖐️ Manuale</span>';
  } else if (recipe.recipeSource === 'archetype' && recipe.archetypeUsed) {
    const archetype = ARCHETYPES[recipe.archetypeUsed];
    const archetypeName = archetype ? archetype.label : recipe.archetypeUsed;
    const archetypeColor = archetype ? archetype.color : 'var(--color-primary)';
    originBadge = `<span class="origin-badge origin-archetype" style="background-color: ${archetypeColor}" title="Generata dall'archetipo ${archetypeName}">🎯 ${archetypeName}</span>`;
  } else if (recipe.recipeSource === 'combination') {
    originBadge = '<span class="origin-badge origin-combination" title="Creata da combinazione predefinita">🧪 Combinazione</span>';
  } else {
    // Legacy recipes without source tracking
    originBadge = '<span class="origin-badge origin-unknown" title="Origine non tracciata">❓ Sconosciuta</span>';
  }

  return `
    <div class="recipe-card" data-recipe-id="${recipe.id}">
      <img 
        src="${recipe.imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23333" width="400" height="200"/%3E%3Ctext fill="%23777" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E'}" 
        alt="${recipe.name}"
        class="recipe-card-image"
        onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%232a2f4a%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2250%22%3E🍕%3C/text%3E%3C/svg%3E'"
      />
      <button class="recipe-card-favorite ${recipe.isFavorite ? 'active' : ''}" data-recipe-id="${recipe.id}">
        ${recipe.isFavorite ? '⭐' : '☆'}
      </button>
      ${originBadge}
      <div class="recipe-card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
          <h3 class="recipe-card-title" style="margin: 0;">${recipe.name}</h3>
          ${recipe.rating > 0 ? `
            <div class="recipe-card-rating" title="Valutazione media degli ospiti">
              ⭐ ${Number(recipe.rating).toFixed(1)}
            </div>
          ` : ''}
        </div>
        <div class="recipe-card-tags">
          ${recipe.tags.slice(0, 3).map(tag => `
            <span class="tag">${tag}</span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function setupLibraryListeners() {
  // Search
  const searchInput = document.getElementById('recipeSearch');
  searchInput.removeEventListener('input', handleSearch);
  searchInput.addEventListener('input', debounce(handleSearch, 300));

  // Filter chips
  document.getElementById('recipeFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (chip) {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      handleFilterChange(chip.dataset.tag);
    }
  });

  // Ingredient filter select
  const ingredientSelect = document.getElementById('ingredientFilter');
  if (ingredientSelect) {
    ingredientSelect.addEventListener('change', (e) => {
      state.selectedIngredient = e.target.value;
      renderRecipes(state);
    });
  }

  // Sort select
  const sortSelect = document.getElementById('recipeSort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderRecipes(state);
    });
  }

  // Global click listener for recipe cards and favorites
  const grid = document.getElementById('recipesGrid');
  // Remove existing listener if any (not easily possible with anonymous functions without weakref, 
  // but we are relying on re-rendering to clear listeners attached to elements, wait, grid is static?)
  // Actually grid is static in DOM? No, it's part of the view. 
  // But we are attaching to it every time renderLibrary is called.

  // Better to use a named function or check if listener attached?
  // For now simpler: clone node to strip listeners? No, that kills internal state.
  // We'll just assume simple event delegation.

  const newGrid = grid.cloneNode(false);
  grid.parentNode.replaceChild(newGrid, grid);
  // Re-render content to new grid
  // Actually renderRecipes does innerHTML so it's fine.
  // Wait, we need to re-render recipes if we just replaced the grid node.
  renderRecipes(state);

  newGrid.addEventListener('click', async (e) => {
    const favoriteBtn = e.target.closest('.recipe-card-favorite');
    const card = e.target.closest('.recipe-card');

    if (favoriteBtn) {
      e.stopPropagation();
      await handleToggleFavorite(favoriteBtn.dataset.recipeId);
    } else if (card) {
      await showRecipeModal(card.dataset.recipeId);
    }
  });
}

async function handleSearch(e) {
  state.searchTerm = e.target.value;
  await renderRecipes(state);
}

async function handleFilterChange(tag) {
  state.selectedTag = tag;
  await renderRecipes(state);
}

async function handleToggleFavorite(recipeId) {
  try {
    await toggleFavorite(recipeId);

    // Update local state
    const recipeIndex = state.recipes.findIndex(r => r.id === recipeId);
    if (recipeIndex !== -1) {
      state.recipes[recipeIndex].isFavorite = !state.recipes[recipeIndex].isFavorite;
    }

    await renderRecipes(state);
    showToast('Preferiti aggiornati', 'success');
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    showToast('Errore nell\'aggiornamento preferiti', 'error');
  }
}

async function showRecipeModal(recipeId) {
  const recipe = await getRecipeById(recipeId);
  if (!recipe) return;

  // Load all preparations from database to include user-created ones
  const { getAllPreparations } = await import('../modules/database.js');
  const allPreparations = await getAllPreparations();

  // Helper to split ingredients
  const baseIngredients = recipe.baseIngredients || [];
  const doughIngredients = baseIngredients.filter(i => i.phase === 'dough' || i.category === 'Impasto');
  const toppingIngredients = baseIngredients.filter(i => i.phase === 'topping' || (i.phase !== 'dough' && i.category !== 'Impasto'));

  // Helper to format instruction list
  const renderInstructions = (list) => list.map(instruction => `
    <li class="instruction-item">${instruction}</li>
  `).join('');

  // Handle instructions (array vs object)
  let doughInstructions = [];
  let toppingInstructions = [];

  if (Array.isArray(recipe.instructions)) {
    // Legacy format or simple array
    toppingInstructions = recipe.instructions;
  } else {
    // New format
    doughInstructions = recipe.instructions.dough || [];
    toppingInstructions = recipe.instructions.topping || [];
  }

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">${recipe.name}</h2>
      <button class="modal-close" onclick="window.closeRecipeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="position: relative;">
        <img 
          id="recipeModalImage"
          src="${recipe.imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"%3E%3Crect fill="%23333" width="800" height="300"/%3E%3Ctext fill="%23777" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E'}" 
          alt="${recipe.name}"
          class="recipe-modal-image"
          onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%232a2f4a%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2250%22>🍕</text></svg>'"
        />
        <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 0.5rem; z-index: 10;">
          <button 
            id="btnDeleteImage" 
            class="btn btn-secondary" 
            onclick="window.handleDeleteRecipeImage('${recipe.id}')"
            style="padding: 8px 12px; font-size: 14px; background: rgba(255, 255, 255, 0.9); color: var(--color-error); border: 1px solid var(--color-error); border-radius: 4px; cursor: pointer;"
            title="Elimina foto"
          >
            🗑️
          </button>
          
          <button 
            id="btnUploadExample" 
            class="btn btn-secondary" 
            onclick="document.getElementById('recipePhotoInput').click()"
            style="padding: 8px 16px; font-size: 14px; background: rgba(255, 255, 255, 0.9); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: 4px; cursor: pointer;"
            title="Carica foto"
          >
            📷 Foto
          </button>

          <button 
            id="btnRegenerateImage" 
            class="btn btn-secondary" 
            style="padding: 8px 16px; font-size: 14px; background: rgba(255, 255, 255, 0.9); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: 4px; cursor: pointer;"
            title="Rigenera immagine"
          >
            🔄 Rigenera
          </button>
        </div>
        
        <input type="file" id="recipePhotoInput" accept="image/*" style="display: none;" onchange="window.handleRecipePhotoUpload(this, '${recipe.id}')">
      </div>
      
      
      <div class="recipe-modal-meta">
        
      </div>
      
      ${recipe.description ? `<p>${recipe.description}</p>` : ''}
      
      <div class="recipe-modal-grid">
        <!-- IMPASTO SUGGERITO SECTION -->
        <div class="recipe-section-group">
            <h3 class="recipe-modal-section-title" style="border-bottom: 1px solid var(--color-primary); padding-bottom: 0.5rem;">🥣 Impasto</h3>
            
            <div class="recipe-modal-section" style="padding: 1rem; background: rgba(102, 126, 234, 0.1); border-radius: 0.5rem; margin-top: 1rem;">
                <p style="color: var(--color-gray-400); font-size: 0.875rem; margin-bottom: 0.5rem;">Impasto suggerito:</p>
                <p style="font-size: 1.1rem; font-weight: 600; color: var(--color-primary-light); margin: 0;">
                    ${recipe.suggestedDough || 'Napoletana Classica'}
                </p>
                <p style="font-size: 0.75rem; color: var(--color-gray-500); margin-top: 0.5rem; margin-bottom: 0;">
                    Vedi la sezione "Impasti" per la ricetta completa
                </p>
            </div>
        </div>

        <!-- CONDIMENTO SECTION -->
        <div class="recipe-section-group">
            <h3 class="recipe-modal-section-title" style="border-bottom: 1px solid var(--color-accent); padding-bottom: 0.5rem;">🍅 Condimento</h3>
            
            <div class="recipe-modal-section">
                <h4 style="color: var(--color-gray-400); font-size: 0.9rem; margin-bottom: 0.5rem;">Ingredienti</h4>
                <ul class="ingredients-list">
                ${(() => {
      // Combine all ingredients with timing info
      const allIngredients = [];

      // Add ingredients from toppingsDuringBake (check individual postBake flag)
      if (recipe.toppingsDuringBake && recipe.toppingsDuringBake.length > 0) {
        recipe.toppingsDuringBake.forEach(ing => {
          // Check if ingredient has postBake flag set
          const isPostBake = ing.postBake === true || ing.postBake === 1 || ing.postBake === '1';
          allIngredients.push({
            type: 'ingredient',
            timing: isPostBake ? 'after' : 'before',
            data: ing
          });
        });
      }

      // Add ingredients from toppingsPostBake (after cooking)
      if (recipe.toppingsPostBake && recipe.toppingsPostBake.length > 0) {
        recipe.toppingsPostBake.forEach(ing => {
          allIngredients.push({
            type: 'ingredient',
            timing: 'after',
            data: ing
          });
        });
      }

      // Add preparations
      if (recipe.preparations && recipe.preparations.length > 0) {
        recipe.preparations.forEach(prep => {
          // Look for preparation by preparationId (normalized) or id (legacy)
          const prepId = prep.preparationId || prep.id;
          const prepData = allPreparations.find(p => p.id === prepId);
          if (prepData) {
            // Determine timing: use prep.timing if set, otherwise fall back to prepData.postCooking
            let timing = 'before'; // default
            if (prep.timing !== undefined) {
              timing = prep.timing === 'after' ? 'after' : 'before';
            } else if (prepData.postCooking) {
              timing = 'after';
            }

            allIngredients.push({
              type: 'preparation',
              timing: timing,
              data: { prep, prepData }
            });
          }
        });
      }

      // Sort by timing: 'before' first, then 'after'
      allIngredients.sort((a, b) => {
        if (a.timing === b.timing) return 0;
        return a.timing === 'before' ? -1 : 1;
      });

      // Render all ingredients
      return allIngredients.map(item => {
        if (item.type === 'ingredient') {
          const ing = item.data;
          const isPostBake = item.timing === 'after';
          return `
                    <li class="ingredient-item" style="${isPostBake ? 'border-left: 3px solid var(--color-accent);' : ''}">
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <div style="display: flex; justify-content: space-between; width: 100%;">
                            <span class="ingredient-name">${ing.name}</span>
                            <span class="ingredient-quantity">${ing.quantity} ${ing.unit}</span>
                        </div>
                        ${isPostBake ? '<span style="font-size: 0.75rem; color: var(--color-accent); margin-top: 2px;">📤 In uscita</span>' : ''}
                    </div>
                    </li>
                `;
        } else {
          const { prep, prepData } = item.data;
          const isPostCooking = item.timing === 'after';
          return `
                    <li class="ingredient-item" style="background: rgba(249, 115, 22, 0.05); ${isPostCooking ? 'border-left: 3px solid var(--color-accent);' : ''}">
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                                <span class="ingredient-name">${prepData.name}</span>
                                <span style="background: rgba(249, 115, 22, 0.3); color: var(--color-accent); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.65rem; font-weight: 600; white-space: nowrap;">🥫 PREP</span>
                            </div>
                            <span class="ingredient-quantity">${prep.quantity}${prep.unit}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--color-gray-500); margin-top: 0.25rem;">
                            ${prepData.category} • ${prepData.prepTime} • ${prep.timing === 'before' ? '📥 Prima cottura' : '📤 Dopo cottura'}
                        </div>
                    </div>
                    </li>
                  `;
        }
      }).join('');
    })()}
                </ul>
            </div>


            <div class="recipe-modal-section">
                <h4 style="color: var(--color-gray-400); font-size: 0.9rem; margin-bottom: 0.5rem;">📥 Distribuzione Ingredienti e Cottura</h4>
                <ol class="instructions-list">
                    ${renderInstructions(toppingInstructions.filter(inst => {
      const lower = inst.toLowerCase();
      // Exclude post-bake instructions
      if (lower.includes("all'uscita dal forno")) return false;
      // If there are post-bake instructions, also exclude "Servire" (it will go at the end)
      if (toppingInstructions.some(i => i.toLowerCase().includes("all'uscita dal forno")) &&
        lower.includes("servire")) return false;
      return true;
    }))}
                </ol>
            </div>

            ${toppingInstructions.some(inst => inst.toLowerCase().includes("all'uscita dal forno")) ? `
            <div class="recipe-modal-section" style="margin-top: 1rem;">
                <h4 style="color: var(--color-accent); font-size: 0.9rem; margin-bottom: 0.5rem;">📤 Ingredienti Post Cottura</h4>
                <ol class="instructions-list" start="${toppingInstructions.filter(inst => {
      const lower = inst.toLowerCase();
      if (lower.includes("all'uscita dal forno")) return false;
      if (toppingInstructions.some(i => i.toLowerCase().includes("all'uscita dal forno")) &&
        lower.includes("servire")) return false;
      return true;
    }).length + 1}">
                    ${renderInstructions(toppingInstructions.filter(inst => {
      const lower = inst.toLowerCase();
      // Include post-bake instructions and "Servire"
      return lower.includes("all'uscita dal forno") || lower.includes("servire");
    }))}
                </ol>
            </div>
            ` : ''}
        </div>
      </div>
      
      ${recipe.tags.length > 0 ? `
        <div class="recipe-card-tags">
          ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeRecipeModal()">Chiudi</button>
      <button class="btn btn-primary" id="btnEditRecipe">
        <span>✏️</span>
        Modifica Ricetta
      </button>
      <button class="btn btn-accent" id="btnDeleteRecipe">
        <span>🗑️</span>
        Elimina
      </button>
    </div>
  `;

  openModal(modalContent);

  // Attach regenerate image listener
  const regenerateBtn = document.getElementById('btnRegenerateImage');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', async () => {
      await handleRegenerateImage(recipe);
    });
  }

  // Attach edit recipe listener
  const editBtn = document.getElementById('btnEditRecipe');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      enableEditMode(recipe);
    });
  }

  // Attach delete listener dynamically
  const deleteBtn = document.getElementById('btnDeleteRecipe');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      // Replace modal content with confirmation
      const modalBody = document.querySelector('.modal-body');
      const modalFooter = document.querySelector('.modal-footer');

      // Save original content in case user cancels (optional, but for now we just close on cancel)

      modalBody.innerHTML = `
            <div class="confirmation-view" style="text-align: center; padding: 2rem 0;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Sei sicuro?</h3>
                <p>Vuoi davvero eliminare la ricetta <strong>${recipe.name}</strong>?</p>
                <p class="text-sm text-gray-400">Questa azione non può essere annullata.</p>
            </div>
          `;

      modalFooter.innerHTML = `
            <button class="btn btn-secondary" id="btnCancelDelete">Annulla</button>
            <button class="btn btn-primary" id="btnConfirmDelete" style="background-color: var(--color-accent); border-color: var(--color-accent);">
                Sì, elimina
            </button>
          `;

      // Attach confirmation listeners
      document.getElementById('btnCancelDelete').addEventListener('click', () => {
        // Re-render the original modal
        showRecipeModal(recipe.id);
      });

      document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
        try {
          const btn = document.getElementById('btnConfirmDelete');
          btn.textContent = 'Eliminazione...';
          btn.disabled = true;

          await deleteRecipe(recipe.id);
          closeModal();

          // Update local state
          state.recipes = state.recipes.filter(r => r.id !== recipe.id);

          // Refresh data
          await renderRecipes(state);
          showToast('Ricetta eliminata con successo', 'success');
        } catch (error) {
          console.error('Failed to delete recipe:', error);
          showToast('Errore durante l\'eliminazione', 'error');
          // Restore modal
          showRecipeModal(recipe.id);
        }
      });
    });
  }
}

/**
 * Handle image regeneration
 */
async function handleRegenerateImage(recipe) {
  try {
    const btn = document.getElementById('btnRegenerateImage');
    const img = document.getElementById('recipeModalImage');

    // Update button state
    btn.disabled = true;
    btn.innerHTML = '⏳ Generazione...';

    // Extract main ingredients for the prompt
    // Parse baseIngredients if it's a string
    const baseIngredientsArray = typeof recipe.baseIngredients === 'string'
      ? JSON.parse(recipe.baseIngredients)
      : (recipe.baseIngredients || []);

    const toppingIngredients = baseIngredientsArray.filter(i => i.phase === 'topping' || i.category !== 'Impasto');
    const mainIngredients = toppingIngredients.slice(0, 3).map(i => i.name);

    // Detect if pizza has tomato base
    const hasTomato = baseIngredientsArray.some(ing =>
      ing.name.toLowerCase().includes('pomodor') ||
      ing.name.toLowerCase().includes('salsa') ||
      ing.name.toLowerCase().includes('passata')
    );

    // Generate new image using multi-provider system
    const { generatePizzaImage } = await import('../utils/imageProviders.js');

    let newImageUrl;
    try {
      const result = await generatePizzaImage(recipe.name, mainIngredients, {
        hasTomato,
        seed: Date.now()
      });
      newImageUrl = result.imageUrl;
      console.log(`✅ Image regenerated using provider: ${result.provider}`);
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      throw new Error(`Impossibile generare l'immagine: ${error.message}`);
    }

    // Update recipe in database FIRST (don't wait for image to load)
    console.log('Updating recipe in database via API...');
    const response = await fetch(`/api/recipes/${recipe.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ imageUrl: newImageUrl })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update recipe');
    }

    // Update local state
    const recipeIndex = state.recipes.findIndex(r => r.id === recipe.id);
    if (recipeIndex !== -1) {
      state.recipes[recipeIndex].imageUrl = newImageUrl;
    }

    console.log('Recipe updated successfully via API');

    // Update the visible image (browser will load it in background)
    const currentImg = document.getElementById('recipeModalImage');
    if (currentImg) {
      currentImg.src = newImageUrl;
      currentImg.style.opacity = '0.7'; // Show loading state

      // Add load handler to restore opacity when loaded
      currentImg.onload = () => {
        currentImg.style.opacity = '1';
      };
    }

    // Update button state
    btn.innerHTML = '✅ Rigenerata!';
    setTimeout(() => {
      btn.innerHTML = '🔄 Rigenera Immagine';
      btn.disabled = false;
    }, 2000);

    // Refresh the recipe cards
    await renderRecipes(state);

    showToast('Immagine rigenerata con successo!', 'success');

  } catch (error) {
    console.error('Failed to regenerate image:', error);
    showToast('Errore nella rigenerazione dell\'immagine: ' + error.message, 'error');

    // Reset button
    const btn = document.getElementById('btnRegenerateImage');
    if (btn) {
      btn.innerHTML = '🔄 Rigenera Immagine';
      btn.disabled = false;
    }

    // Reset image opacity
    const img = document.getElementById('recipeModalImage');
    if (img) {
      img.style.opacity = '1';
    }
  }
}

/**
 * Enable edit mode for recipe ingredients and preparations
 */
async function enableEditMode(recipe) {
  const { getAllIngredients, getAllPreparations } = await import('../modules/database.js');

  // Load all available ingredients and preparations
  const allIngredients = await getAllIngredients();
  const allPreparations = await getAllPreparations();

  // Parse current ingredients and preparations
  const currentIngredients = typeof recipe.baseIngredients === 'string'
    ? JSON.parse(recipe.baseIngredients)
    : (recipe.baseIngredients || []);

  const currentPreparations = typeof recipe.preparations === 'string'
    ? JSON.parse(recipe.preparations)
    : (recipe.preparations || []);

  const modalBody = document.querySelector('.modal-body');
  const modalFooter = document.querySelector('.modal-footer');

  // Render edit mode UI
  modalBody.innerHTML = `
    <div class="edit-mode-container">
      <h3 style="margin-bottom: 1rem;">✏️ Modifica Ricetta: ${recipe.name}</h3>
      
      <!-- Ingredients Section -->
      <div class="edit-section">
        <h4 style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span>🥘 Ingredienti</span>
          <button class="btn btn-small btn-primary" id="btnAddIngredient">+ Aggiungi</button>
        </h4>
        <div id="ingredientsList" class="edit-list">
          ${currentIngredients.map((ing, idx) => renderIngredientRow(ing, idx, allIngredients)).join('')}
        </div>
      </div>
      
      <!-- Preparations Section -->
      <div class="edit-section" style="margin-top: 2rem;">
        <h4 style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span>🥫 Preparazioni</span>
          <button class="btn btn-small btn-primary" id="btnAddPreparation">+ Aggiungi</button>
        </h4>
        <div id="preparationsList" class="edit-list">
          ${currentPreparations.map((prep, idx) => renderPreparationRow(prep, idx, allPreparations)).join('')}
        </div>
      </div>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" id="btnCancelEdit">Annulla</button>
    <button class="btn btn-primary" id="btnSaveEdit">💾 Salva Modifiche</button>
  `;

  // Attach event listeners
  document.getElementById('btnAddIngredient').addEventListener('click', () => {
    const list = document.getElementById('ingredientsList');
    const idx = list.children.length;
    list.insertAdjacentHTML('beforeend', renderIngredientRow({}, idx, allIngredients));
    attachRemoveListeners();
  });

  document.getElementById('btnAddPreparation').addEventListener('click', () => {
    const list = document.getElementById('preparationsList');
    const idx = list.children.length;
    list.insertAdjacentHTML('beforeend', renderPreparationRow({}, idx, allPreparations));
    attachRemoveListeners();
  });

  document.getElementById('btnCancelEdit').addEventListener('click', () => {
    showRecipeModal(recipe.id);
  });

  document.getElementById('btnSaveEdit').addEventListener('click', async () => {
    await saveRecipeChanges(recipe.id);
  });

  // Attach remove listeners to existing rows
  attachRemoveListeners();
}

/**
 * Attach remove button listeners
 */
function attachRemoveListeners() {
  document.querySelectorAll('.remove-row').forEach(btn => {
    btn.onclick = (e) => {
      e.target.closest('.edit-row').remove();
    };
  });
}

/**
 * Render ingredient row for editing
 */
function renderIngredientRow(ingredient, index, allIngredients) {
  return `
    <div class="edit-row" data-index="${index}">
      <div class="edit-row-main">
        <select class="edit-input ingredient-select" data-field="id" style="flex: 2; min-width: 150px;">
          <option value="">Ingrediente...</option>
          ${allIngredients.map(ing => `
            <option value="${ing.id}" ${(ingredient.id === ing.id || ingredient.ingredientId === ing.id) ? 'selected' : ''}>
              ${ing.name}
            </option>
          `).join('')}
        </select>
        <div class="edit-row-group">
          <input type="number" class="edit-input" data-field="quantity" placeholder="Quantità" 
                 value="${ingredient.quantity || ''}" min="0" step="0.1" style="width: 70px;">
          <select class="edit-input" data-field="unit" style="width: 60px;">
            <option value="g" ${ingredient.unit === 'g' ? 'selected' : ''}>g</option>
            <option value="ml" ${ingredient.unit === 'ml' ? 'selected' : ''}>ml</option>
            <option value="q.b." ${ingredient.unit === 'q.b.' ? 'selected' : ''}>q.b.</option>
            <option value="pz" ${ingredient.unit === 'pz' ? 'selected' : ''}>pz</option>
          </select>
        </div>
      </div>
      <div class="edit-row-footer">
        <label class="checkbox-label">
          <input type="checkbox" data-field="postBake" ${ingredient.postBake ? 'checked' : ''}>
          <span>Post-cottura</span>
        </label>
        <button class="btn btn-small btn-accent remove-row">×</button>
      </div>
    </div>
  `;
}

/**
 * Render preparation row for editing
 */
function renderPreparationRow(preparation, index, allPreparations) {
  return `
    <div class="edit-row" data-index="${index}">
      <div class="edit-row-main">
        <select class="edit-input preparation-select" data-field="id" style="flex: 2; min-width: 150px;">
          <option value="">Preparazione...</option>
          ${allPreparations.map(prep => `
            <option value="${prep.id}" ${(preparation.id === prep.id || preparation.preparationId === prep.id) ? 'selected' : ''}>
              ${prep.name}
            </option>
          `).join('')}
        </select>
        <div class="edit-row-group">
          <input type="number" class="edit-input" data-field="quantity" placeholder="Quantità" 
                 value="${preparation.quantity || ''}" min="0" step="0.1" style="width: 70px;">
          <input type="text" class="edit-input" data-field="unit" placeholder="Unità" 
                 value="${preparation.unit || 'g'}" style="width: 50px;">
        </div>
      </div>
      <div class="edit-row-footer">
        <select class="edit-input" data-field="timing" style="flex: 1;">
          <option value="before" ${preparation.timing === 'before' ? 'selected' : ''}>Prima</option>
          <option value="after" ${preparation.timing === 'after' ? 'selected' : ''}>Dopo</option>
        </select>
        <button class="btn btn-small btn-accent remove-row">×</button>
      </div>
    </div>
  `;
}

/**
 * Save recipe changes
 */
async function saveRecipeChanges(recipeId) {
  try {
    const btn = document.getElementById('btnSaveEdit');
    btn.textContent = '💾 Salvataggio...';
    btn.disabled = true;

    // Collect ingredients
    const ingredientRows = document.querySelectorAll('#ingredientsList .edit-row');
    const baseIngredients = [];

    ingredientRows.forEach((row, idx) => {
      const ingredientSelect = row.querySelector('.ingredient-select');
      const selectedId = ingredientSelect.value;

      if (!selectedId) return; // Skip empty rows

      const selectedOption = ingredientSelect.options[ingredientSelect.selectedIndex];
      const name = selectedOption.textContent.trim();
      const quantity = parseFloat(row.querySelector('[data-field="quantity"]').value) || 0;
      const unit = row.querySelector('[data-field="unit"]').value;
      const postBake = row.querySelector('[data-field="postBake"]').checked ? 1 : 0;

      baseIngredients.push({ id: selectedId, name, quantity, unit, postBake });
    });

    // Collect preparations
    const preparationRows = document.querySelectorAll('#preparationsList .edit-row');
    const preparations = [];

    preparationRows.forEach(row => {
      const prepSelect = row.querySelector('.preparation-select');
      const selectedId = prepSelect.value;

      if (!selectedId) return; // Skip empty rows

      const quantity = parseFloat(row.querySelector('[data-field="quantity"]').value) || 0;
      const unit = row.querySelector('[data-field="unit"]').value;
      const timing = row.querySelector('[data-field="timing"]').value;

      preparations.push({ id: selectedId, quantity, unit, timing });
    });

    // Save to backend
    const response = await fetch(`/api/recipes/${recipeId}/components`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ baseIngredients, preparations })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save changes');
    }

    // Update local state with the returned recipe
    const updatedRecipe = await response.json();
    const recipeIndex = state.recipes.findIndex(r => r.id === recipeId);
    if (recipeIndex !== -1) {
      state.recipes[recipeIndex] = updatedRecipe;
    }

    // Success!
    showToast('Modifiche salvate con successo!', 'success');
    await renderRecipes(state);
    showRecipeModal(recipeId);

  } catch (error) {
    console.error('Failed to save recipe changes:', error);
    showToast('Errore nel salvataggio: ' + error.message, 'error');

    const btn = document.getElementById('btnSaveEdit');
    if (btn) {
      btn.textContent = '💾 Salva Modifiche';
      btn.disabled = false;
    }
  }
}

// Add CSS for edit mode
const editModeStyles = document.createElement('style');
editModeStyles.textContent = `
  .edit-mode-container {
    padding: 0.5rem;
  }
  
  .edit-section {
    background: rgba(102, 126, 234, 0.05);
    border-radius: 0.5rem;
    padding: 0.75rem;
  }
  
  .edit-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .edit-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--color-bg-secondary);
    border-radius: 0.5rem;
    border: 1px solid var(--color-gray-700);
  }
  
  .edit-row-main {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  .edit-row-group {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    width: 100%;
  }
  
  .edit-row-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-gray-400);
  }
  
  .edit-input {
    padding: 0.5rem;
    border: 1px solid var(--color-gray-600);
    border-radius: 0.375rem;
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    min-height: 44px; /* Better touch target for mobile */
  }
  
  /* Mobile-specific styles */
  @media (max-width: 767px) {
    .edit-mode-container {
      padding: 0.5rem;
    }
    
    .edit-section {
      padding: 0.5rem;
    }
    
    .edit-row {
      padding: 0.5rem;
    }
    
    .edit-row-main {
      flex-direction: column;
    }
    
    .ingredient-select,
    .preparation-select {
      width: 100% !important;
      min-width: 100% !important;
      flex: 1 !important;
    }
    
    .edit-row-group {
      width: 100%;
    }
    
    .edit-row-group input,
    .edit-row-group select {
      flex: 1;
    }
    
    .btn-small {
      padding: 0.5rem 0.75rem;
      min-height: 44px; /* Better touch target */
    }
    
    .remove-row {
      min-width: 44px;
      min-height: 44px;
    }
  }

  /* Desktop optimization */
  @media (min-width: 768px) {
    .edit-mode-container {
      padding: 1rem;
    }
    
    .edit-section {
      padding: 1rem;
    }
    
    .edit-row {
      flex-direction: row;
      flex-wrap: wrap;
      padding: 1rem;
    }
    
    .edit-row-main {
      flex: 3;
      flex-direction: row;
      align-items: center;
    }
    
    .edit-row-footer {
      flex: 1;
      border-top: none;
      padding-top: 0;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
  
  .edit-input option,
  .ingredient-select option,
  .preparation-select option,
  select.edit-input option {
    background: var(--color-bg-primary) !important;
    color: #000000 !important;
    padding: 0.5rem;
  }
  
  .edit-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  .btn-small {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .remove-row {
    font-size: 1.25rem;
    line-height: 1;
  }
`;
document.head.appendChild(editModeStyles);

// Global functions for modal
window.closeRecipeModal = closeModal;

// ==========================================
// PHOTO UPLOAD & DELETE (Library)
// ==========================================
window.handleRecipePhotoUpload = async function (input, recipeId) {
  const file = input.files[0];
  if (!file) return;

  const btn = document.getElementById('btnUploadExample');
  const originalText = btn ? btn.innerHTML : '📷 Foto';

  if (btn) {
    btn.innerHTML = '⏳';
    btn.disabled = true;
  }

  try {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = async function () {
        // Resize and Compress
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        console.log(`📸 Image compressed: ${(compressedBase64.length / 1024).toFixed(2)} KB`);

        try {
          // Import auth
          const { getToken, removeToken } = await import('../modules/auth.js');
          const token = getToken();

          if (!token) {
            alert('⚠️ Devi effettuare il login per caricare foto!');
            if (btn) {
              btn.innerHTML = originalText;
              btn.disabled = false;
            }
            return;
          }

          const response = await fetch(`/api/recipes/${recipeId}/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ imageBase64: compressedBase64 })
          });

          if (response.status === 401 || response.status === 403) {
            alert('⚠️ Sessione scaduta. Login necessario.');
            removeToken();
            window.location.href = '/login.html';
            return;
          }

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errText}`);
          }

          const data = await response.json();

          // Update UI
          const recipeImg = document.getElementById('recipeModalImage');
          if (recipeImg) {
            recipeImg.src = compressedBase64;
          }

          // Update local state
          const recipeIndex = state.recipes.findIndex(r => r.id === recipeId);
          if (recipeIndex !== -1) {
            state.recipes[recipeIndex].imageUrl = compressedBase64;
          }

          // We need to refresh the grid. renderRecipes relies on 'state' var in Library.js 
          if (typeof renderRecipes === 'function' && typeof state !== 'undefined') {
            await renderRecipes(state);
          }

          showToast('Foto caricata con successo!', 'success');

        } catch (err) {
          console.error('Upload error:', err);
          showToast('Errore nel caricamento della foto', 'error');
        } finally {
          if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }
        }
      };
    };
  } catch (err) {
    console.error('File reading error:', err);
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
};

window.handleDeleteRecipeImage = async function (recipeId) {
  if (!confirm('Vuoi eliminare la foto corrente e tornare a quella predefinita (o placeholder)?')) return;

  try {
    // We update with imageUrl = null to reset it
    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ imageUrl: null })
    });

    if (!response.ok) throw new Error('Delete image failed');

    // Update UI
    const recipeImg = document.getElementById('recipeModalImage');
    if (recipeImg) {
      // Set to placeholder or let onerror handle it
      recipeImg.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%232a2f4a%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2250%22>🍕</text></svg>';
    }

    // Update local state
    const recipeIndex = state.recipes.findIndex(r => r.id === recipeId);
    if (recipeIndex !== -1) {
      state.recipes[recipeIndex].imageUrl = null;
    }

    // Refresh grid
    if (typeof renderRecipes === 'function' && typeof state !== 'undefined') {
      await renderRecipes(state);
    }
    showToast('Foto eliminata', 'success');

  } catch (err) {
    console.error('Delete image error:', err);
    showToast('Errore nell\'eliminazione della foto', 'error');
  }
};
