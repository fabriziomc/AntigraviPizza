// ============================================
// ANTIGRAVIPIZZA - MAIN APPLICATION
// ============================================

console.log('🚀 main.js is loading...');

import './styles/index.css';
import './styles/components.css';
import './styles/preparations-selector.css';
import './styles/ingredients.css';
import './styles/live-mode.css';
import './styles/settings-append.css';
import './styles/archetypes.css';

import { initDB, getAllRecipes, getAllPizzaNights, initCombinations, initSeedData, seedPreparations } from './modules/database.js';
import { NAV_ITEMS, VIEWS, FLAVOR_COMBINATIONS, PREPARATIONS } from './utils/constants.js';
import { showToast } from './utils/helpers.js';
import { state } from './store.js';
import { openModal, closeModal, setupSidebarListeners } from './modules/ui.js';
import { requireAuth, getUser, withAuth, logout } from './modules/auth.js';

// Import view renderers
import { renderDashboard } from './components/Dashboard.js';
import { renderDiscovery } from './components/Discovery.js';
import { renderLibrary } from './components/Library.js';
import { renderPlanner } from './components/PlannerV2.js';
import { renderShopping } from './components/Shopping.js';
import { renderCombinations, setupCombinationsListeners } from './components/Combinations.js';
import { renderDoughs } from './components/Doughs.js';
import { renderPreparations } from './components/Preparations.js';
import { renderIngredients } from './components/Ingredients.js';
import { renderSettings } from './components/Settings.js';
import { renderQRCodes } from './components/QRCodes.js';
import { renderArchetypes } from './components/Archetypes.js';
import { renderAdminDashboard } from './components/AdminDashboard.js';

console.log('✅ All imports loaded');

// ============================================
// INITIALIZATION
// ============================================

async function initApp() {
  console.log('🎯 initApp called');
  console.log('🚀 AntigraviPizza v2.0 - Multi-User Authentication');

  // Check authentication first
  const isAuth = await requireAuth();
  if (!isAuth) {
    return; // requireAuth will redirect to login
  }

  // Get current user
  const currentUser = getUser();
  console.log('👤 Logged in as:', currentUser?.name);

  try {
    // Initialize database
    await initDB();
    console.log('✅ Database initialized');

    // Load and display version
    loadVersion();

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

  const user = getUser();
  console.log('🔍 DEBUG NAV: User:', user);
  console.log('🔍 DEBUG NAV: Role:', user?.role);
  console.log('🔍 DEBUG NAV: Is Admin?', user?.role === 'admin');

  // Build main nav items
  const navItemsHtml = NAV_ITEMS.map(item => `
    <li class="nav-item">
      <a href="#${item.id}" class="nav-link ${item.id === state.currentView ? 'active' : ''}" data-view="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');

  // Build Admin item if user is admin
  const adminItemHtml = (user && user.role === 'admin') ? `
    <li class="nav-item">
      <a href="#admin" class="nav-link ${state.currentView === 'admin' ? 'active' : ''}" data-view="admin">
        <span class="nav-icon">👑</span>
        <span>Admin</span>
      </a>
    </li>` : '';

  // Build Logout item
  const logoutItemHtml = `
    <li class="nav-item" style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
      <a href="#" id="logoutBtn" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: var(--color-danger); text-decoration: none; border-radius: 0.5rem; transition: background-color 0.2s; cursor: pointer;">
        <span style="font-size: 1.25rem;">🚪</span>
        <span>Logout</span>
      </a>
    </li>
  `;

  // Combine properly
  navMenu.innerHTML = navItemsHtml + adminItemHtml + logoutItemHtml;

  // Add logout button click handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      if (confirm('Sei sicuro di voler uscire?')) {
        logout();
      }
    });
  }
}

function navigateToView(viewId) {
  // Handle special routes like qrcodes/id or guest/id/id
  if (viewId.startsWith('qrcodes/') || viewId.startsWith('guest/')) {
    const actualView = viewId.split('/')[0];
    state.currentView = actualView;

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`${actualView}-view`);
    if (targetView) {
      targetView.classList.add('active');
    }

    renderCurrentView();
    return;
  }

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
      case VIEWS.ARCHETYPES:
        await renderArchetypes();
        break;
      case VIEWS.SETTINGS:
        await renderSettings();
        break;
      case VIEWS.ADMIN:
        await renderAdminDashboard();
        break;
      case 'qrcodes':
        await renderQRCodes(state);
        break;
      case 'guest':
        // Guest view is handled by guest.html
        window.location.href = '/guest.html' + window.location.hash;
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
      // Update hash to keep URL in sync with navigation
      window.location.hash = viewId;
      // navigateToView will be called by hashchange event
    }
  });

  // Mobile menu toggle & sidebar behavior
  setupSidebarListeners();

  // Modal backdrop click to close
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Handle browser back/forward and hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && Object.values(VIEWS).includes(hash)) {
      navigateToView(hash);
    } else if (hash) {
      // Handle special routes like qrcodes/id or guest/id/id
      const viewType = hash.split('/')[0];
      if (viewType === 'qrcodes' || viewType === 'guest') {
        navigateToView(hash);
      }
    }
  });
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

// Make closeModal globally accessible
window.closeModal = closeModal;
window.refreshData = refreshData;
window.navigateToView = navigateToView;

// ============================================
// REFRESH DATA
// ============================================

export async function refreshData() {
  await loadData();
  await renderCurrentView();
}

// ============================================
// VERSION DISPLAY
// ============================================

async function loadVersion() {
  try {
    const response = await fetch('/api/version', withAuth());
    const data = await response.json();
    const versionElement = document.getElementById('appVersion');
    if (versionElement) {
      versionElement.textContent = data.version;
      versionElement.title = `Deployed: ${new Date(data.timestamp).toLocaleString()}`;
    }
  } catch (err) {
    console.error('Could not load version:', err);
  }
}

// ============================================
// START APP
// ============================================

// Vite loads modules after DOM is ready, so we can call initApp directly
initApp();

console.log('🏁 main.js loaded completely');
