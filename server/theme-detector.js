// theme-detector.js - Automatic theme detection from pizza night titles

/**
 * Detects the theme of a pizza night based on its title
 * @param {string} title - The pizza night title
 * @returns {string} - The detected theme ID
 */
function detectTheme(title) {
    if (!title) return 'classic';

    const lowerTitle = title.toLowerCase();

    // Annual events - in order of specificity
    if (/natale|christmas|xmas|natalizio/i.test(lowerTitle)) return 'christmas';
    if (/capodanno|new year|anno nuovo|veglione/i.test(lowerTitle)) return 'newyear';
    if (/halloween|zucca|scary|dolcetto.*scherzetto/i.test(lowerTitle)) return 'halloween';
    if (/pasqua|easter|pasquale/i.test(lowerTitle)) return 'easter';
    if (/san valentino|valentine|amore|innamorati/i.test(lowerTitle)) return 'valentine';
    if (/carnevale|carnival|maschera|mascherato/i.test(lowerTitle)) return 'carnival';
    if (/ferragosto|agosto/i.test(lowerTitle)) return 'ferragosto';

    // Generic events
    if (/compleanno|birthday|anniversario/i.test(lowerTitle)) return 'birthday';
    if (/estate|summer|mare|spiaggia/i.test(lowerTitle)) return 'summer';

    // Default fallback
    return 'classic';
}

export { detectTheme };
