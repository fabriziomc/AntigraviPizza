// ============================================
// LIBRARY COMPONENT
// ============================================

import { getAllRecipes, getRecipeById, toggleFavorite, deleteRecipe, updateRecipe } from '../modules/database.js';
import { RECIPE_TAGS, DOUGH_TYPES, PREPARATIONS } from '../utils/constants.js';
import { getRecipeDoughType } from '../utils/doughHelper.js';
import { debounce, showToast } from '../utils/helpers.js';
import { state } from '../store.js';
import { openModal, closeModal } from '../modules/ui.js';

export async function renderLibrary(appState) {
  const recipes = await getAllRecipes();
  await renderFilters(recipes);
  await renderRecipes(appState);
  setupLibraryListeners();
}

async function renderFilters(recipes) {
  const filtersContainer = document.getElementById('recipeFilters');

  // Extract unique ingredients from all recipes
  const ingredientsSet = new Set();
  recipes.forEach(recipe => {
    try {
      // Parse baseIngredients
      if (recipe.baseIngredients) {
        const baseIng = typeof recipe.baseIngredients === 'string'
          ? JSON.parse(recipe.baseIngredients)
          : recipe.baseIngredients;
        baseIng.forEach(ing => {
          if (ing.name) ingredientsSet.add(ing.name);
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
            if (prepData) ingredientsSet.add(prepData.name);
          }
        });
      }
    } catch (e) {
      console.warn('Error parsing ingredients for recipe:', recipe.name, e);
    }
  });

  const sortedIngredients = Array.from(ingredientsSet).sort();

  filtersContainer.innerHTML = `
    <div class="filters-scroll">
      <button class="filter-chip active" data-tag="all">Tutte</button>
      <button class="filter-chip" data-tag="favorites">⭐ Preferite</button>
      ${RECIPE_TAGS.map(tag => `
        <button class="filter-chip" data-tag="${tag}">${tag}</button>
      `).join('')}
    </div>
    
    <div class="filters-sort" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
      <select id="ingredientFilter" class="sort-select" style="min-width: 160px;">
        <option value="all">🥘 Tutti gli ingredienti</option>
        ${sortedIngredients.map(ing => `<option value="${ing}">${ing}</option>`).join('')}
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
}

async function renderRecipes(state) {
  const grid = document.getElementById('recipesGrid');
  let recipes = await getAllRecipes();

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
    const archetypeLabels = {
      'dolce_salato': 'Dolce/Salato',
      'terra_bosco': 'Terra e Bosco',
      'fresca_estiva': 'Fresca Estiva',
      'piccante_decisa': 'Piccante',
      'mare': 'Mare',
      'vegana': 'Vegana',
      'classica': 'Classica',
      'tradizionale': 'Tradizionale',
      'fusion': 'Fusion'
    };
    const archetypeName = archetypeLabels[recipe.archetypeUsed] || recipe.archetypeUsed;
    originBadge = `<span class="origin-badge origin-archetype" title="Generata dall'archetipo ${archetypeName}">🎯 ${archetypeName}</span>`;
  } else if (recipe.recipeSource === 'combination') {
    originBadge = '<span class="origin-badge origin-combination" title="Creata da combinazione predefinita">🧪 Combinazione</span>';
  } else {
    // Legacy recipes without source tracking
    originBadge = '<span class="origin-badge origin-unknown" title="Origine non tracciata">❓ Sconosciuta</span>';
  }

  return `
    <div class="recipe-card" data-recipe-id="${recipe.id}">
      <img 
        src="${recipe.imageUrl || 'https://via.placeholder.com/400x200/667eea/ffffff?text=🍕'}" 
        alt="${recipe.name}"
        class="recipe-card-image"
        onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%232a2f4a%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2250%22%3E🍕%3C/text%3E%3C/svg%3E'"
      />
      <button class="recipe-card-favorite ${recipe.isFavorite ? 'active' : ''}" data-recipe-id="${recipe.id}">
        ${recipe.isFavorite ? '⭐' : '☆'}
      </button>
      ${originBadge}
      <div class="recipe-card-body">
        <h3 class="recipe-card-title">${recipe.name}</h3>
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
          src="${recipe.imageUrl || 'https://via.placeholder.com/800x300/667eea/ffffff?text=🍕'}" 
          alt="${recipe.name}"
          class="recipe-modal-image"
          onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%232a2f4a%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2250%22>🍕</text></svg>'"
        />
        <button 
          id="btnRegenerateImage" 
          class="btn btn-secondary" 
          style="position: absolute; top: 10px; right: 10px; padding: 8px 16px; font-size: 14px; background: rgba(255, 255, 255, 0.9); color: var(--color-primary); border: 1px solid var(--color-primary);"
          title="Rigenera immagine"
        >
          🔄 Rigenera Immagine
        </button>
      </div>
      
      
      <div class="recipe-modal-meta">
        ${recipe.source ? `<a href="${recipe.source}" target="_blank" class="recipe-modal-source">🔗 Fonte</a>` : ''}
      </div>
      
      ${recipe.description ? `<p>${recipe.description}</p>` : ''}
      
      <div class="recipe-modal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
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
                ${toppingIngredients.map(ing => `
                    <li class="ingredient-item" style="${ing.postBake ? 'border-left: 3px solid var(--color-accent);' : ''}">
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <div style="display: flex; justify-content: space-between; width: 100%;">
                            <span class="ingredient-name">${ing.name}</span>
                            <span class="ingredient-quantity">${ing.quantity} ${ing.unit}</span>
                        </div>
                        ${ing.postBake ? '<span style="font-size: 0.75rem; color: var(--color-accent); margin-top: 2px;">📤 In uscita</span>' : ''}
                    </div>
                    </li>
                `).join('')}
                ${recipe.preparations && recipe.preparations.length > 0 ? recipe.preparations.map(prep => {
    const prepData = PREPARATIONS.find(p => p.id === prep.id);
    if (!prepData) return '';
    return `
                    <li class="ingredient-item" style="background: rgba(249, 115, 22, 0.05); border-left: 3px solid var(--color-accent);">
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
  }).join('') : ''}
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
    const toppingIngredients = recipe.ingredients.filter(i => i.phase === 'topping' || i.category !== 'Impasto');
    const mainIngredients = toppingIngredients.slice(0, 3).map(i => i.name);

    // Generate new image URL with timestamp to avoid caching
    const imagePrompt = `gourmet pizza ${recipe.name}, toppings: ${mainIngredients.join(', ')}, professional food photography, 4k, highly detailed, italian style, rustic background`;
    const timestamp = Date.now();
    const newImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?seed=${timestamp}`;

    console.log('Generating new image:', newImageUrl);

    // Show loading state on image
    img.style.opacity = '0.5';

    // Remove old event listeners
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);

    // Create a new image element to preload
    const preloadImg = new Image();

    // Wait for image to load with longer timeout
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error('Image load timeout after 30 seconds');
        reject(new Error('Image load timeout'));
      }, 30000); // 30 seconds timeout

      preloadImg.onload = () => {
        clearTimeout(timeoutId);
        console.log('Image loaded successfully');
        resolve();
      };

      preloadImg.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error('Image load error:', error);
        reject(new Error('Failed to load image'));
      };

      // Start loading
      preloadImg.src = newImageUrl;
    });

    // Update the visible image
    const currentImg = document.getElementById('recipeModalImage');
    if (currentImg) {
      currentImg.src = newImageUrl;
      currentImg.style.opacity = '1';
    }

    // Update recipe in database BEFORE showing success
    console.log('Updating recipe in database...');
    await updateRecipe(recipe.id, { imageUrl: newImageUrl });
    console.log('Recipe updated successfully');

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

// Global functions for modal
window.closeRecipeModal = closeModal;
