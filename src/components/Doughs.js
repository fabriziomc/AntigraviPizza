// ============================================
// DOUGHS COMPONENT
// ============================================

import { DOUGH_RECIPES } from '../utils/constants.js';
import { openModal, closeModal } from '../modules/ui.js';

export async function renderDoughs() {
  renderDoughsGrid();
  setupDoughsListeners();
}

function renderDoughsGrid() {
  const grid = document.getElementById('doughsGrid');

  if (!grid) {
    console.error('Doughs grid not found');
    return;
  }

  grid.innerHTML = DOUGH_RECIPES.map(dough => createDoughCard(dough)).join('');
}

function createDoughCard(dough) {
  const difficultyColors = {
    'Media': 'var(--color-success)',
    'Alta': 'var(--color-warning)',
    'Molto Alta': 'var(--color-error)'
  };

  return `
    <div class="dough-card" data-dough-id="${dough.id}">
      <div class="dough-card-header">
        <h3 class="dough-card-title">${dough.type}</h3>
        <span class="dough-difficulty" style="background: ${difficultyColors[dough.difficulty] || 'var(--color-gray-600)'};">
          ${dough.difficulty}
        </span>
      </div>
      
      <p class="dough-card-description">${dough.description}</p>
      
      <div class="dough-card-stats">
        <div class="dough-stat">
          <span class="dough-stat-icon">💧</span>
          <div>
            <div class="dough-stat-label">Idratazione</div>
            <div class="dough-stat-value">${dough.hydration}%</div>
          </div>
        </div>
        
        <div class="dough-stat">
          <span class="dough-stat-icon">⏱️</span>
          <div>
            <div class="dough-stat-label">Lievitazione</div>
            <div class="dough-stat-value">${dough.fermentation}</div>
          </div>
        </div>
        
        <div class="dough-stat">
          <span class="dough-stat-icon">🍕</span>
          <div>
            <div class="dough-stat-label">Resa</div>
            <div class="dough-stat-value">${dough.yield} pizze</div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-block view-dough-btn" data-dough-id="${dough.id}">
        <span>📖</span>
        Vedi Ricetta
      </button>
    </div>
  `;
}

function setupDoughsListeners() {
  const grid = document.getElementById('doughsGrid');

  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.view-dough-btn');
    if (viewBtn) {
      const doughId = viewBtn.dataset.doughId;
      showDoughModal(doughId);
    }
  });
}

function showDoughModal(doughId) {
  const dough = DOUGH_RECIPES.find(d => d.id === doughId);
  if (!dough) return;

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">${dough.type}</h2>
      <button class="modal-close" onclick="window.closeModal()">×</button>
    </div>
    <div class="modal-body">
      <p style="font-size: 1.1rem; margin-bottom: 2rem; color: var(--color-gray-300);">${dough.description}</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div class="info-box">
          <div class="info-label">💧 Idratazione</div>
          <div class="info-value">${dough.hydration}%</div>
        </div>
        <div class="info-box">
          <div class="info-label">🌡️ Temperatura</div>
          <div class="info-value">${dough.temperature}</div>
        </div>
        <div class="info-box">
          <div class="info-label">⏱️ Lievitazione</div>
          <div class="info-value">${dough.fermentation}</div>
        </div>
        <div class="info-box">
          <div class="info-label">📊 Difficoltà</div>
          <div class="info-value">${dough.difficulty}</div>
        </div>
        ${dough.requiresRefrigeration ? `
        <div class="info-box">
          <div class="info-label">⏰ Riposo</div>
          <div class="info-value">${dough.restTime}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="recipe-modal-grid" style="display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 2rem;">
        <div>
          <h3 class="recipe-modal-section-title" style="border-bottom: 2px solid var(--color-primary); padding-bottom: 0.5rem; margin-bottom: 1rem;">
            🥣 Ingredienti
          </h3>
          <ul class="ingredients-list">
            ${dough.ingredients.map(ing => `
              <li class="ingredient-item">
                <span class="ingredient-name">${ing.name}</span>
                <span class="ingredient-quantity">${ing.quantity} ${ing.unit}</span>
              </li>
            `).join('')}
          </ul>
          <p style="font-size: 0.875rem; color: var(--color-gray-400); margin-top: 1rem;">
            <em>Peso totale impasto: ${dough.totalWeight}g (${dough.weightPerPizza}g per pizza)</em>
          </p>
        </div>
        
        <div>
          <h3 class="recipe-modal-section-title" style="border-bottom: 2px solid var(--color-accent); padding-bottom: 0.5rem; margin-bottom: 1rem;">
            📝 Procedimento
          </h3>
          <ol class="instructions-list">
            ${dough.instructions.map(instruction => `
              <li class="instruction-item">${instruction}</li>
            `).join('')}
          </ol>
        </div>
      </div>
      
      ${dough.tips && dough.tips.length > 0 ? `
        <div style="background: rgba(102, 126, 234, 0.1); border-left: 4px solid var(--color-primary); padding: 1rem; border-radius: 0.5rem;">
          <h4 style="color: var(--color-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            💡 Consigli Utili
          </h4>
          <ul style="margin: 0; padding-left: 1.5rem; color: var(--color-gray-300);">
            ${dough.tips.map(tip => `<li style="margin-bottom: 0.5rem;">${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Chiudi</button>
      <button class="btn btn-primary" onclick="window.printDoughRecipe('${dough.id}')">
        <span>🖨️</span>
        Stampa Ricetta
      </button>
    </div>
  `;

  openModal(modalContent);
}

function printDoughRecipe(doughId) {
  const dough = DOUGH_RECIPES.find(d => d.id === doughId);
  if (!dough) return;

  // Create a printable version
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${dough.type} - Ricetta Impasto</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 2rem; }
        h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 0.5rem; }
        h2 { color: #764ba2; margin-top: 2rem; }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 2rem 0; }
        .info-box { border: 1px solid #ddd; padding: 1rem; border-radius: 0.5rem; }
        .info-label { font-weight: bold; color: #666; font-size: 0.875rem; }
        .info-value { font-size: 1.1rem; margin-top: 0.25rem; }
        ul, ol { line-height: 1.8; }
        .tips { background: #f0f4ff; border-left: 4px solid #667eea; padding: 1rem; margin-top: 2rem; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>${dough.type}</h1>
      <p><em>${dough.description}</em></p>
      
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">Idratazione</div>
          <div class="info-value">${dough.hydration}%</div>
        </div>
        <div class="info-box">
          <div class="info-label">Temperatura</div>
          <div class="info-value">${dough.temperature}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Lievitazione</div>
          <div class="info-value">${dough.fermentation}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Resa</div>
          <div class="info-value">${dough.yield} pizze</div>
        </div>
        <div class="info-box">
          <div class="info-label">Difficoltà</div>
          <div class="info-value">${dough.difficulty}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Riposo</div>
          <div class="info-value">${dough.restTime}</div>
        </div>
      </div>
      
      <h2>Ingredienti</h2>
      <ul>
        ${dough.ingredients.map(ing => `<li>${ing.name}: ${ing.quantity} ${ing.unit}</li>`).join('')}
      </ul>
      
      <h2>Procedimento</h2>
      <ol>
        ${dough.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
      </ol>
      
      ${dough.tips && dough.tips.length > 0 ? `
        <div class="tips">
          <h3>💡 Consigli Utili</h3>
          <ul>
            ${dough.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <p style="margin-top: 3rem; text-align: center; color: #999; font-size: 0.875rem;">
        Ricetta generata da AntigraviPizza 🚀🍕
      </p>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// Global functions
window.printDoughRecipe = printDoughRecipe;
