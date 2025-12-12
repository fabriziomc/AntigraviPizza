// ============================================
// ANTIGRAVIPIZZA - MAIN APPLICATION
// ============================================

console.log('🚀 main.js is loading...');

import './styles/index.css';
import './styles/components.css';
import './styles/preparations-selector.css';
import './styles/ingredients.css';
import './styles/live-mode.css';

import { initDB, getAllRecipes, getAllPizzaNights, initCombinations, initSeedData, seedPreparations } from './modules/database.js';
import { NAV_ITEMS, VIEWS, FLAVOR_COMBINATIONS, PREPARATIONS } from './utils/constants.js';
import { showToast } from './utils/helpers.js';
import { state } from './store.js';
import { openModal, closeModal } from './modules/ui.js';

// Import view renderers
import { renderDashboard } from './components/Dashboard.js';
import { renderDiscovery } from './components/Discovery.js';
import { renderLibrary } from './components/Library.js';
import { renderPlanner } from './components/Planner.js';
import { renderShopping } from './components/Shopping.js';
import { renderCombinations, setupCombinationsListeners } from './components/Combinations.js';
import { renderDoughs } from './components/Doughs.js';
import { renderPreparations } from './components/Preparations.js';
import { renderIngredients } from './components/Ingredients.js';
import { renderSettings } from './components/Settings.js';

console.log('✅ All imports loaded');

// ============================================
// INITIALIZATION
// ============================================

async function initApp() {
  console.log('🎯 initApp called');
  console.log('🚀 AntigraviPizza v1.1 - Dough Filter Loaded');

  try {
    // Initialize database
    await initDB();
    console.log('✅ Database initialized');

    // Initialize combinations (with error handling)
    try {
      await initCombinations(FLAVOR_COMBINATIONS);
      console.log('✅ Combinations initialized');
    } catch (combError) {
      console.warn('⚠️ Could not initialize combinations:', combError.message);
      // Continue anyway - combinations are optional
    }

    // Initialize seed data if database is empty
    try {
      await initSeedData();
      console.log('✅ Seed data checked/loaded');
    } catch (seedError) {
      console.warn('⚠️ Could not load seed data:', seedError.message);
      // Continue anyway - seed data is optional
    }

    // Initialize preparations from constants
    try {
      await seedPreparations(PREPARATIONS);
      console.log('✅ Preparations initialized');
    } catch (prepError) {
      console.warn('⚠️ Could not initialize preparations:', prepError.message);
      // Continue anyway - preparations are optional
    }

    // Load initial data
    await loadData();
    console.log('✅ Data loaded');

    // Render navigation
    renderNavigation();
    console.log('✅ Navigation rendered');

    // Setup event listeners
    setupEventListeners();
    console.log('✅ Event listeners setup');

    // Check if there's a hash in the URL
    const hash = window.location.hash.slice(1);
    if (hash && Object.values(VIEWS).includes(hash)) {
      navigateToView(hash);
    } else {
      navigateToView(VIEWS.DASHBOARD);
    }

    console.log('✅ AntigraviPizza initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    showToast('Errore nell\'inizializzazione dell\'app', 'error');
  }
}

// ============================================
// DATA LOADING
// ============================================

async function loadData() {
  try {
    state.recipes = await getAllRecipes();
    state.pizzaNights = await getAllPizzaNights();
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}

// ============================================
// NAVIGATION
// ============================================

function renderNavigation() {
  const navMenu = document.getElementById('navMenu');

  if (!navMenu) {
    console.error('❌ navMenu element not found!');
    return;
  }

  navMenu.innerHTML = NAV_ITEMS.map(item => `
    <li class="nav-item">
      <a href="#${item.id}" class="nav-link ${item.id === state.currentView ? 'active' : ''}" data-view="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');
}

function navigateToView(viewId) {
  // Update state
  state.currentView = viewId;

  // Update navigation active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewId);
  });

  // Update views visibility
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`${viewId}-view`).classList.add('active');

  // Render the view
  renderCurrentView();

  // Close mobile menu if open
  document.getElementById('sidebar').classList.remove('mobile-open');
}

async function renderCurrentView() {
  try {
    switch (state.currentView) {
      case VIEWS.DASHBOARD:
        await renderDashboard(state);
        break;
      case VIEWS.DISCOVERY:
        await renderDiscovery(state);
        break;
      case VIEWS.LIBRARY:
        await renderLibrary(state);
        break;
      case VIEWS.PLANNER:
        await renderPlanner(state);
        break;
      case VIEWS.SHOPPING:
        await renderShopping(state);
        break;
      case VIEWS.COMBINATIONS:
        await renderCombinations();
        setupCombinationsListeners();
        break;
      case VIEWS.DOUGHS:
        await renderDoughs();
        break;
      case VIEWS.PREPARATIONS:
        await renderPreparations();
        break;
      case VIEWS.INGREDIENTS:
        await renderIngredients(state);
        break;
      case VIEWS.SETTINGS:
        await renderSettings();
        break;
      default:
        await renderDashboard(state);
    }
  } catch (error) {
    console.error('Failed to render view:', error);
    showToast('Errore nel caricamento della vista', 'error');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Navigation clicks
  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('.nav-link');
    if (navLink) {
      e.preventDefault();
      const viewId = navLink.dataset.view;
      navigateToView(viewId);
    }
  });

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });
  }

  // Modal backdrop click to close
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && Object.values(VIEWS).includes(hash)) {
      navigateToView(hash);
    }
  });
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

// Make closeModal globally accessible
window.closeModal = closeModal;
window.refreshData = refreshData;

// ============================================
// REFRESH DATA
// ============================================

export async function refreshData() {
  await loadData();
  await renderCurrentView();
}

// ============================================
// START APP
// ============================================

// Vite loads modules after DOM is ready, so we can call initApp directly
initApp();

console.log('🏁 main.js loaded completely');
