// ============================================
// DASHBOARD COMPONENT
// ============================================

import { getAllRecipes, getAllPizzaNights } from '../modules/database.js';
import { formatDateShort } from '../utils/helpers.js';
import { getUser } from '../modules/auth.js';

export async function renderDashboard(state) {
  // Get current user
  const user = getUser();
  const userName = user?.name || 'Utente';

  // Update welcome message
  const pageDescription = document.querySelector('#dashboard-view .page-description');
  if (pageDescription) {
    pageDescription.textContent = `Benvenuto, ${userName}! 🍕`;
  }

  try {
    // Optimization: Fetch data once
    const [recipes, pizzaNights] = await Promise.all([
      getAllRecipes(),
      getAllPizzaNights()
    ]);

    // Render stats
    renderStats(recipes, pizzaNights);

    // Render recent recipes
    renderRecentRecipes(recipes);

    // Render upcoming nights
    renderUpcomingNights(pizzaNights);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function renderStats(recipes, pizzaNights) {
  const statsGrid = document.getElementById('statsGrid');

  // Calculate derived stats locally to avoid extra API calls
  const favorites = recipes.filter(r => r.isFavorite);
  const now = Date.now();
  const upcoming = pizzaNights.filter(night => night.date >= now && night.status === 'planned');

  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📚</div>
      <div class="stat-value">${recipes.length}</div>
      <div class="stat-label">Ricette</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⭐</div>
      <div class="stat-value">${favorites.length}</div>
      <div class="stat-label">Preferite</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🎉</div>
      <div class="stat-value">${pizzaNights.length}</div>
      <div class="stat-label">Serate Totali</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📅</div>
      <div class="stat-value">${upcoming.length}</div>
      <div class="stat-label">Prossime Serate</div>
    </div>
  `;
}

function renderRecentRecipes(recipes) {
  const container = document.getElementById('recentRecipes');

  // Sort by date added, most recent first
  const recent = [...recipes]
    .sort((a, b) => b.dateAdded - a.dateAdded)
    .slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2rem;">
        <p class="text-muted">Nessuna ricetta ancora. Inizia ad aggiungerne!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <ul style="list-style: none; padding: 0;">
      ${recent.map(recipe => `
        <li style="padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div style="font-weight: 600;">${recipe.name}</div>
          <div style="font-size: 0.875rem; color: var(--color-gray-400);">
            ${recipe.pizzaiolo} • ${formatDateShort(recipe.dateAdded)}
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

function renderUpcomingNights(pizzaNights) {
  const container = document.getElementById('upcomingNights');

  const now = Date.now();
  const upcoming = pizzaNights
    .filter(night => night.date >= now && night.status === 'planned')
    .sort((a, b) => a.date - b.date);

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2rem;">
        <p class="text-muted">Nessuna serata pianificata. Creane una!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <ul style="list-style: none; padding: 0;">
      ${upcoming.slice(0, 5).map(night => `
        <li style="padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div style="font-weight: 600;">${night.name}</div>
          <div style="font-size: 0.875rem; color: var(--color-gray-400);">
            ${formatDateShort(night.date)} • ${night.guestCount} ospiti
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}
