/**
 * Dough Calculator Utility
 * Calcola le quantità di ingredienti per l'impasto in base a:
 * - Numero di pizze
 * - Peso per pizza
 * - Panetti di scorta opzionali
 */

/**
 * Calcola le quantità di ingredienti per l'impasto
 * @param {Object} doughRecipe - Ricetta base dell'impasto da DOUGH_RECIPES
 * @param {number} numPizzas - Numero di pizze da preparare
 * @param {number} weightPerPizza - Peso impasto per pizza in grammi (default 250)
 * @param {number} extraDoughBalls - Panetti di scorta aggiuntivi (default 0)
 * @returns {Object} Ingredienti ricalcolati con quantità totali
 */
export function calculateDoughIngredients(doughRecipe, numPizzas, weightPerPizza = 250, extraDoughBalls = 0) {
    if (!doughRecipe || !numPizzas) {
        return null;
    }

    // Calcola il numero totale di pizze (inclusi i panetti di scorta)
    const totalPizzas = numPizzas + extraDoughBalls;

    // Usa il peso totale per pizza della ricetta base (non solo la farina!)
    // Se non disponibile, calcola dalla somma degli ingredienti
    let baseWeightPerPizza = doughRecipe.weightPerPizza;

    if (!baseWeightPerPizza) {
        // Fallback: calcola dalla somma degli ingredienti
        const totalRecipeWeight = doughRecipe.ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
        baseWeightPerPizza = totalRecipeWeight / doughRecipe.yield;
    }

    // Calcola il fattore di scala basato sul peso TOTALE desiderato per pizza
    const scaleFactor = (totalPizzas * weightPerPizza) / (doughRecipe.yield * baseWeightPerPizza);

    // Ricalcola tutti gli ingredienti
    const calculatedIngredients = doughRecipe.ingredients.map(ing => {
        const calculatedQuantity = ing.quantity * scaleFactor;

        return {
            ...ing,
            originalQuantity: ing.quantity,
            calculatedQuantity: Math.round(calculatedQuantity * 10) / 10, // Arrotonda a 1 decimale
            scaleFactor: scaleFactor
        };
    });

    return {
        ...doughRecipe,
        calculatedYield: totalPizzas,
        requestedPizzas: numPizzas,
        extraDoughBalls: extraDoughBalls,
        weightPerPizza: weightPerPizza,
        totalWeight: totalPizzas * weightPerPizza,
        ingredients: calculatedIngredients,
        scaleFactor: scaleFactor
    };
}

/**
 * Formatta la ricetta calcolata per la copia negli appunti
 * @param {Object} calculation - Risultato di calculateDoughIngredients
 * @returns {string} Testo formattato della ricetta
 */
export function formatDoughRecipeForCopy(calculation) {
    if (!calculation) return '';

    const lines = [
        `🥣 ${calculation.type}`,
        ``,
        `📊 Quantità:`,
        `- ${calculation.requestedPizzas} pizze${calculation.extraDoughBalls > 0 ? ` + ${calculation.extraDoughBalls} di scorta` : ''}`,
        `- ${calculation.weightPerPizza}g per pizza`,
        `- Peso totale: ${calculation.totalWeight}g`,
        ``,
        `🧾 Ingredienti:`,
        ...calculation.ingredients.map(ing =>
            `- ${ing.name}: ${ing.calculatedQuantity} ${ing.unit}`
        ),
        ``,
        `⏱️ Lievitazione: ${calculation.fermentation}`,
        `🌡️ Temperatura: ${calculation.temperature}`,
        `⏰ Riposo: ${calculation.restTime}`,
        ``,
        `📝 Generato da AntigraviPizza`
    ];

    return lines.join('\n');
}

/**
 * Copia la ricetta negli appunti
 * @param {Object} calculation - Risultato di calculateDoughIngredients
 * @returns {Promise<boolean>} True se copiato con successo
 */
export async function copyDoughRecipeToClipboard(calculation) {
    try {
        const text = formatDoughRecipeForCopy(calculation);
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}
