/**
 * Recipe Parser for Italian Pizza Recipes
 * Parses text format from Gemini-generated gourmet pizza recipes
 * 
 * Expected format:
 * 1. Nome Pizza
 * In cottura: ingredienti che vanno in forno
 * Post-cottura: ingredienti aggiunti a crudo dopo la cottura
 * Perché funziona: descrizione
 */

/**
 * Parse a complete recipe text containing one or more recipes
 * @param {string} text - Full text containing recipes
 * @returns {Array} Array of parsed recipe objects
 */
export function parseRecipeFile(text) {
    const recipes = [];

    // Split by recipe number pattern (e.g., "1. ", "2. ", etc.)
    const recipeBlocks = text.split(/\n(?=\d+\.\s+)/);

    for (const block of recipeBlocks) {
        if (!block.trim()) continue;

        try {
            const recipe = parseRecipeBlock(block);
            if (recipe) {
                recipes.push(recipe);
            }
        } catch (error) {
            console.error('Error parsing recipe block:', error);
            // Continue with other recipes even if one fails
        }
    }

    return recipes;
}

/**
 * Parse a single recipe block
 * @param {string} block - Text block for one recipe
 * @returns {Object} Parsed recipe object
 */
function parseRecipeBlock(block) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length === 0) return null;

    const recipe = {
        name: '',
        description: '',
        ingredientiCottura: [],      // Ingredients that go in the oven (merged Base + In cottura)
        ingredientiPostCottura: [],  // Ingredients added after baking
        instructions: [],
        archetype: 'gourmet',
        dough: 'nero',
        tags: ['gourmet']
    };

    // Parse first line for name (format: "1. Nome Pizza" or just "Nome Pizza")
    const firstLine = lines[0];
    const nameMatch = firstLine.match(/^\d+\.\s*(.+?)(?:\s*-\s*In cottura:|$)/);
    if (nameMatch) {
        recipe.name = nameMatch[1].trim();
    } else {
        recipe.name = firstLine.replace(/^\d+\.\s*/, '').split('-')[0].trim();
    }

    // Parse sections
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for section headers
        // Accept both "In cottura:" and "Top (In cottura):" for backward compatibility
        if (line.match(/^(In cottura:|Top\s*\(In cottura\):)/i)) {
            currentSection = 'cottura';
            const content = line.replace(/^(In cottura:|Top\s*\(In cottura\):)/i, '').trim();
            if (content) {
                recipe.ingredientiCottura = parseIngredientList(content);
            }
        } else if (line.match(/^(Post-cottura:|Top\s*\(Post-cottura\):|Dopo\s+cottura:)/i)) {
            currentSection = 'post';
            const content = line.replace(/^(Post-cottura:|Top\s*\(Post-cottura\):|Dopo\s+cottura:)/i, '').trim();
            if (content) {
                recipe.ingredientiPostCottura = parseIngredientList(content);
            }
        } else if (line.match(/Perché funziona:/i)) {
            currentSection = 'description';
            const content = line.replace(/Perché funziona:/i, '').trim();
            if (content) {
                recipe.description = content;
            }
        } else if (currentSection === 'description') {
            // Continue description on next lines
            recipe.description += ' ' + line;
        }
    }

    // Generate instructions from ingredients
    recipe.instructions = generateInstructions(recipe);

    return recipe;
}

/**
 * Parse ingredient list from text
 * @param {string} text - Comma or "e" separated ingredient list
 * @returns {Array} Array of ingredient objects
 */
function parseIngredientList(text) {
    const ingredients = [];

    // Split by comma first (most reliable separator)
    let parts = text.split(',');

    // Common ingredient start words that indicate a new ingredient
    // Avoid overly common words that might appear in descriptions
    const ingredientStarts = /^(funghi|pomodor|mozzarella|burrata|provola|fior|stracciatella|pecorino|parmigiano|gorgonzola|prosciutto|speck|guanciale|pancetta|salame|mortadella|nduja|salsiccia|tartufo|basilico|rucola|origano|timo|rosmarino|carpaccio|nocciole|noci|chips|crema|gocce|scaglie|cipolle)/i;

    const finalParts = [];
    for (const part of parts) {
        // Split on " e " if followed by uppercase OR common ingredient word
        const subParts = [];
        let currentPart = '';
        const words = part.split(/(\s+e\s+)/i);

        for (let i = 0; i < words.length; i++) {
            if (words[i].match(/^\s+e\s+$/i) && i + 1 < words.length) {
                const nextWord = words[i + 1];
                // Check if next word starts with uppercase or common ingredient
                if (nextWord.match(/^[A-Z]/) || nextWord.match(ingredientStarts)) {
                    // This is a separator between ingredients
                    if (currentPart.trim()) {
                        subParts.push(currentPart.trim());
                    }
                    currentPart = '';
                } else {
                    // This "e" is part of the description (like "tostate e tritate")
                    currentPart += words[i];
                }
            } else if (!words[i].match(/^\s+e\s+$/i)) {
                currentPart += words[i];
            }
        }

        if (currentPart.trim()) {
            subParts.push(currentPart.trim());
        }

        finalParts.push(...subParts);
    }

    for (const part of finalParts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        const ingredient = parseIngredient(trimmed);
        if (ingredient) {
            ingredients.push(ingredient);
        }
    }

    return ingredients;
}

/**
 * Parse a single ingredient with optional quantity
 * @param {string} text - Ingredient text (e.g., "Mozzarella di bufala", "Guanciale croccante 50g")
 * @returns {Object} Ingredient object
 */
function parseIngredient(text) {
    // Try to extract quantity (e.g., "50g", "100ml", "2 cucchiai")
    const quantityMatch = text.match(/(\d+)\s*(g|ml|kg|l|cucchiai?|cucchiaini?|foglie?|fette?|spicchi?)/i);

    let name = text;
    let quantity = null;
    let unit = 'q.b.';

    if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
        unit = quantityMatch[2].toLowerCase();
        // Remove quantity from name
        name = text.replace(quantityMatch[0], '').trim();
    }

    // Clean up name
    name = name
        .replace(/\s+/g, ' ')
        .replace(/\.$/, '')
        .trim();

    // Remove parenthetical notes (e.g., "(o datterino giallo)")
    name = name.replace(/\s*\([^)]+\)\s*/g, ' ').trim();

    return {
        name: normalizeIngredientName(name),
        originalName: name,
        quantity,
        unit
    };
}

/**
 * Normalize ingredient name for database matching
 * @param {string} name - Original ingredient name
 * @returns {string} Normalized name
 */
function normalizeIngredientName(name) {
    return name
        .toLowerCase()
        .trim()
        // Remove common qualifiers that might not be in DB
        .replace(/\s+(fresco|fresca|freschi|fresche)$/i, '')
        .replace(/\s+(DOP|IGP|DOC)$/i, '')
        .replace(/\s+\d+\s+mesi$/i, '') // Remove aging info (e.g., "36 mesi")
        .trim();
}

/**
 * Generate cooking instructions from ingredient lists
 * @param {Object} recipe - Parsed recipe object
 * @returns {Array} Array of instruction strings
 */
function generateInstructions(recipe) {
    const instructions = [];

    instructions.push('Stendere l\'impasto nero al carbone vegetale');

    if (recipe.ingredientiCottura && recipe.ingredientiCottura.length > 0) {
        const cotturaNames = recipe.ingredientiCottura.map(i => i.originalName).join(', ');
        instructions.push(`Distribuire sulla base: ${cotturaNames}`);
    }

    instructions.push('Infornare a 450°C per 90 secondi (o secondo il proprio forno)');

    if (recipe.ingredientiPostCottura && recipe.ingredientiPostCottura.length > 0) {
        const postNames = recipe.ingredientiPostCottura.map(i => i.originalName).join(', ');
        instructions.push(`Guarnire dopo la cottura con: ${postNames}`);
    }

    instructions.push('Servire immediatamente');

    return instructions;
}

/**
 * Suggest category for an ingredient based on its name
 * @param {string} ingredientName - Name of the ingredient
 * @returns {string} Suggested category ID or name
 */
export function suggestIngredientCategory(ingredientName) {
    const name = ingredientName.toLowerCase();

    // Cheese/Dairy
    if (name.match(/mozzarella|burrata|stracciatella|provola|scamorza|caciocavallo|fior di latte|bufala/i)) {
        return 'latticini';
    }
    if (name.match(/pecorino|parmigiano|grana|caprino|gorgonzola|taleggio|formaggio/i)) {
        return 'formaggi';
    }

    // Meats
    if (name.match(/guanciale|pancetta|speck|prosciutto|salame|mortadella|'nduja|nduja|salsiccia/i)) {
        return 'salumi';
    }

    // Vegetables
    if (name.match(/pomodoro|datterino|pachino|san marzano/i)) {
        return 'pomodori';
    }
    if (name.match(/zucca|carciofo|cavolo|funghi|porcini|tartufo/i)) {
        return 'verdure';
    }
    if (name.match(/basilico|timo|rosmarino|origano|prezzemolo/i)) {
        return 'erbe aromatiche';
    }

    // Nuts and seeds
    if (name.match(/pistacchio|nocciola|noce|mandorla|pinoli/i)) {
        return 'frutta secca';
    }

    // Condiments
    if (name.match(/olio|aceto|balsamico|miele/i)) {
        return 'condimenti';
    }
    if (name.match(/pepe|peperoncino|sale/i)) {
        return 'spezie';
    }

    // Default
    return 'altro';
}

/**
 * Validate parsed recipe data
 * @param {Object} recipe - Parsed recipe object
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateRecipeData(recipe) {
    const errors = [];

    if (!recipe.name || recipe.name.trim().length === 0) {
        errors.push('Nome ricetta mancante');
    }

    if (recipe.baseIngredients.length === 0 &&
        recipe.toppingsDuringBake.length === 0 &&
        recipe.toppingsPostBake.length === 0) {
        errors.push('Nessun ingrediente trovato');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
