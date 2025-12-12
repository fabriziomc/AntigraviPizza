// ============================================
// MANAGE AVAILABLE INGREDIENTS FUNCTION
// ============================================

async function manageAvailableIngredients(nightId) {
    closeModal();

    // Get pizza night data
    const night = await getPizzaNightById(nightId);
    if (!night) return;

    // Generate FULL ingredient list (without filtering)
    const fullList = await generateShoppingList(night.selectedPizzas, night.selectedDough, []);

    // Get currently available ingredients
    const availableIngredients = night.availableIngredients || [];

    // Helper to get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            'Impasto': '🌾',
            'Salsa': '🍅',
            'Formaggi': '🧀',
            'Carne': '🥓',
            'Verdure': '🥬',
            'Pesce': '🐟',
            'Erbe e Spezie': '🌿',
            'Altro': '📦'
        };
        return icons[category] || '📦';
    };

    // Build items HTML with checkboxes
    let itemsHTML = '';
    for (const [category, items] of Object.entries(fullList)) {
        const icon = getCategoryIcon(category);
        itemsHTML += `
      <div class="shopping-category">
        <h3 class="category-title">${icon} ${category}</h3>
        <div class="shopping-items">
          ${items.map(item => {
            const isChecked = availableIngredients.some(avail =>
                avail.toLowerCase() === item.name.toLowerCase()
            );
            return `
            <div class="shopping-item ${isChecked ? 'checked' : ''}">
              <div class="shopping-item-checkbox ${isChecked ? 'checked' : ''}" 
                   onclick="this.classList.toggle('checked'); this.closest('.shopping-item').classList.toggle('checked');">
              </div>
              <div class="shopping-item-content">
                <span class="item-name" data-ingredient-name="${item.name}">${item.name}</span>
                <span class="item-quantity">${formatQuantity(item.quantity, item.unit)}</span>
              </div>
            </div>
          `;
        }).join('')}
        </div>
      </div>
      `;
    }

    // Create and show modal
    const modalContent = `
      <div class="modal-header">
        <h2>✓ Ingredienti Disponibili - ${night.name}</h2>
        <button class="modal-close" onclick="window.closeModal()">×</button>
      </div>
      <div class="modal-body">
        <p style="color: var(--color-gray-300); margin-bottom: 1.5rem;">
          Seleziona gli ingredienti che hai già in casa. La lista spesa mostrerà solo quelli da acquistare.
        </p>
        
        <!-- Quick Select Buttons -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="window.quickSelectDough()">
            <span>🌾</span> Tutto l'impasto
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.quickSelectSpices()">
            <span>🌿</span> Spezie base
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.quickSelectAll()">
            <span>✓</span> Seleziona tutto
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.quickSelectNone()">
            <span>✗</span> Azzera tutto
          </button>
        </div>
        
        <div class="shopping-list-container">
          ${itemsHTML}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.closeModal()">
          Annulla
        </button>
        <button class="btn btn-primary" onclick="window.saveAvailableIngredients('${nightId}')">
          💾 Salva
        </button>
      </div>
      `;

    openModal(modalContent);
}

// Save available ingredients selection
async function saveAvailableIngredients(nightId) {
    // Get all checked ingredients
    const checkedItems = document.querySelectorAll('.shopping-item.checked .item-name');
    const availableIngredients = Array.from(checkedItems).map(el => el.dataset.ingredientName);

    // Update pizza night in database
    const night = await getPizzaNightById(nightId);
    night.availableIngredients = availableIngredients;

    // Save to database (using updatePizzaNight if available, or re-create)
    try {
        // For now, we'll use a simple approach: fetch, modify, and save
        // This requires an updatePizzaNight function in the database module
        const response = await fetch(`/api/pizza-nights/${nightId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ availableIngredients })
        });

        if (!response.ok) throw new Error('Failed to update available ingredients');

        closeModal();
        showToast(`✅ ${availableIngredients.length} ingredienti salvati come disponibili`, 'success');

        // Refresh the view
        await refreshData();
    } catch (error) {
        console.error('Error saving available ingredients:', error);
        showToast('❌ Errore nel salvare gli ingredienti', 'error');
    }
}

// Quick select functions
function quickSelectDough() {
    // Select all items in "Impasto" category
    const doughItems = document.querySelectorAll('.shopping-category:has(.category-title:contains("🌾")) .shopping-item');
    doughItems.forEach(item => {
        item.classList.add('checked');
        item.querySelector('.shopping-item-checkbox').classList.add('checked');
    });
}

function quickSelectSpices() {
    // Select all items in "Erbe e Spezie" category
    const spiceItems = document.querySelectorAll('.shopping-category:has(.category-title:contains("🌿")) .shopping-item');
    spiceItems.forEach(item => {
        item.classList.add('checked');
        item.querySelector('.shopping-item-checkbox').classList.add('checked');
    });
}

function quickSelectAll() {
    // Select all items
    const allItems = document.querySelectorAll('.shopping-item');
    allItems.forEach(item => {
        item.classList.add('checked');
        item.querySelector('.shopping-item-checkbox').classList.add('checked');
    });
}

function quickSelectNone() {
    // Deselect all items
    const allItems = document.querySelectorAll('.shopping-item');
    allItems.forEach(item => {
        item.classList.remove('checked');
        item.querySelector('.shopping-item-checkbox').classList.remove('checked');
    });
}
