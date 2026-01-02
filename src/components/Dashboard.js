// ============================================
// DASHBOARD COMPONENT
// ============================================

import { getAllRecipes, getAllPizzaNights, getUpcomingPizzaNights, getFavoriteRecipes } from '../modules/database.js';
import { formatDateShort } from '../utils/helpers.js';

export async function renderDashboard(state) {
  // Render stats
  await renderStats();

  // Render recent recipes
  await renderRecentRecipes();

  // Render upcoming nights
  await renderUpcomingNights();
}

async function renderStats() {
  const statsGrid = document.getElementById('statsGrid');

  const recipes = await getAllRecipes();
  const pizzaNights = await getAllPizzaNights();
  const favorites = await getFavoriteRecipes();
  const upcoming = await getUpcomingPizzaNights();

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

async function renderRecentRecipes() {
  const container = document.getElementById('recentRecipes');
  const recipes = await getAllRecipes();

  // Sort by date added, most recent first
  const recent = recipes
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

async function renderUpcomingNights() {
  const container = document.getElementById('upcomingNights');
  const upcoming = await getUpcomingPizzaNights();

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
