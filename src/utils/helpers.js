// ============================================
// HELPER UTILITIES
// ============================================

/**
 * Generate a unique UUID v4
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Format a date to a readable string
 */
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('it-IT', options);
}

/**
 * Format a date to short format
 */
export function formatDateShort(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Format a date for input fields
 */
export function formatDateForInput(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 16);
}

/**
 * Get next Saturday at 19:00 (default for pizza nights)
 */
export function getNextSaturdayEvening() {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7; // 0 = Sunday, 6 = Saturday
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(19, 0, 0, 0); // 19:00
    return nextSaturday.getTime();
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Escape HTML entities
 */
export function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Convert unit to base unit (grams) for aggregation
 */
export function convertToBaseUnit(quantity, unit) {
    const conversionFactors = {
        'g': 1,
        'kg': 1000,
        'ml': 1,
        'l': 1000,
        'cucchiai': 15,
        'cucchiaini': 5,
        'tazze': 240
    };

    return (conversionFactors[unit] || 1) * quantity;
}

/**
 * Format quantity with unit
 */
export function formatQuantity(quantity, unit) {
    // Round to 2 decimal places
    const rounded = Math.round(quantity * 100) / 100;
    return `${rounded} ${unit}`;
}

/**
 * Aggregate ingredients from multiple recipes
 */
export function aggregateIngredients(recipes, quantities) {
    const aggregated = {};

    recipes.forEach((recipe, index) => {
        const multiplier = quantities[index] || 1;

        const ingredients = recipe.baseIngredients || recipe.ingredients || [];
        ingredients.forEach(ingredient => {
            // Safety check
            if (!ingredient || !ingredient.name) return;

            const key = ingredient.name.toLowerCase();

            if (!aggregated[key]) {
                aggregated[key] = {
                    name: ingredient.name,
                    quantity: 0,
                    unit: ingredient.unit,
                    category: ingredient.category || 'Altro'
                };
            }

            // Convert to base unit, add, then convert back
            const baseQuantity = convertToBaseUnit(ingredient.quantity, ingredient.unit);
            const totalBase = convertToBaseUnit(aggregated[key].quantity, aggregated[key].unit);
            aggregated[key].quantity = (totalBase + (baseQuantity * multiplier)) /
                (convertToBaseUnit(1, aggregated[key].unit));
        });
    });

    return Object.values(aggregated);
}

/**
 * Group ingredients by category
 */
export function groupByCategory(ingredients) {
    const grouped = {};

    ingredients.forEach(ingredient => {
        const category = ingredient.category || 'Altro';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(ingredient);
    });

    return grouped;
}

/**
 * Calculate total pizzas needed based on guest count
 */
export function calculatePizzasNeeded(guestCount, pizzasPerPerson = 0.75) {
    return Math.ceil(guestCount * pizzasPerPerson);
}

/**
 * Search/filter array of objects
 */
export function filterItems(items, searchTerm, fields) {
    if (!searchTerm) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item => {
        return fields.some(field => {
            const value = getNestedValue(item, field);
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

/**
 * Get nested object value by path
 */
export function getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Sort array of objects by field
 */
export function sortBy(items, field, order = 'asc') {
    return [...items].sort((a, b) => {
        const aVal = getNestedValue(a, field);
        const bVal = getNestedValue(b, field);

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Read JSON file
 */
export function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
    color: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Confirm dialog
 */
export function confirm(message) {
    return window.confirm(message);
}

/**
 * Extract domain from URL
 */
export function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
}

/**
 * Truncate text
 */
export function truncate(text, length) {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

/**
 * Pluralize word
 */
export function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
}
