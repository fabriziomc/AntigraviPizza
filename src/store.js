// ============================================
// APP STATE
// ============================================

import { VIEWS } from './utils/constants.js';

export const state = {
    currentView: VIEWS.DASHBOARD,
    recipes: [],
    pizzaNights: [],
    selectedPizzaNight: null,
    searchTerm: '',
    selectedTag: null,
    sortBy: 'newest'
};
