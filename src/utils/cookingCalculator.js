// ============================================
// COOKING CALCULATOR
// Calculate optimal cooking temperature and time
// based on oven max temp and dough type
// ============================================

// Optimal temperatures by dough type (in °C)
const OPTIMAL_TEMPS = {
    'Napoletana': 450,           // Ideale: forno a legna molto caldo
    'Romana': 300,               // Croccante: temperatura media-alta
    'Alta Idratazione': 250,     // Lunga cottura: temperatura media
    'Integrale': 230,            // Delicata: temperatura più bassa
    'Contemporanea': 280,        // Versatile: temperatura media-alta
    'Biga': 270,                 // Media-alta per sviluppo sapore
    'Poolish': 260,              // Media per alveolatura
    'default': 280               // Default sicuro
};

/**
 * Calculate cooking time based on actual temperature
 * Higher temp = shorter time, lower temp = longer time
 */
function calculateCookingTime(actualTemp, optimalTemp) {
    const ratio = optimalTemp / actualTemp;

    if (actualTemp >= 400) {
        // Forno molto caldo (legna/professionale top)
        // Tempi molto brevi in secondi
        const baseMin = 90;
        const baseMax = 120;
        return {
            min: Math.round(baseMin * ratio),
            max: Math.round(baseMax * ratio),
            unit: 'secondi'
        };
    } else if (actualTemp >= 300) {
        // Forno caldo (professionale/gas)
        // Tempi brevi in minuti
        const baseMin = 4;
        const baseMax = 6;
        return {
            min: Math.round(baseMin * ratio),
            max: Math.round(baseMax * ratio),
            unit: 'minuti'
        };
    } else {
        // Forno domestico (elettrico standard)
        // Tempi standard in minuti
        const baseMin = 8;
        const baseMax = 12;
        return {
            min: Math.round(baseMin * ratio),
            max: Math.round(baseMax * ratio),
            unit: 'minuti'
        };
    }
}

/**
 * Get cooking instructions for a specific dough type and oven
 * @param {string} doughType - Type of dough (e.g., 'Napoletana' or 'Napoletana Classica')
 * @param {number} maxOvenTemp - Maximum temperature of user's oven in °C
 * @returns {object} Cooking instructions with temp, time, and formatted string
 */
export function getCookingInstructions(doughType, maxOvenTemp) {
    // Normalize dough type: extract base type from full name
    // e.g., "Napoletana Classica" -> "Napoletana"
    const baseDoughType = doughType ? doughType.split(' ')[0] : 'default';

    // Get optimal temp for this dough type
    const optimalTemp = OPTIMAL_TEMPS[baseDoughType] || OPTIMAL_TEMPS['default'];

    console.log('🔥 getCookingInstructions:');
    console.log('  - Original doughType:', doughType);
    console.log('  - Normalized baseDoughType:', baseDoughType);
    console.log('  - Found optimalTemp:', optimalTemp);

    // Use max available temp, but not higher than optimal
    // (no point heating beyond optimal for this dough)
    const actualTemp = Math.min(maxOvenTemp, optimalTemp);

    // Calculate time based on actual temp vs optimal
    const time = calculateCookingTime(actualTemp, optimalTemp);

    return {
        temperature: actualTemp,
        timeMin: time.min,
        timeMax: time.max,
        timeUnit: time.unit,
        formatted: `Forno a ${actualTemp}°C per ${time.min}-${time.max} ${time.unit}`
    };
}

/**
 * Get list of common oven temperatures for UI hints
 */
export function getCommonOvenTemps() {
    return [
        { label: 'Forno elettrico domestico', temp: 250 },
        { label: 'Forno a gas', temp: 280 },
        { label: 'Forno professionale elettrico', temp: 350 },
        { label: 'Forno a legna', temp: 450 }
    ];
}
