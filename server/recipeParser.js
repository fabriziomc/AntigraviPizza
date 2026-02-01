/**
 * Recipe Parser for Italian Pizza Recipes
 * Parses text format from Gemini-generated gourmet pizza recipes
 */

/**
 * Parse a complete recipe text containing one or more recipes
 * @param {string} text - Full text containing recipes
 * @returns {Array} Array of parsed recipe objects
 */
export function parseRecipeFile(text) {
    const recipes = [];

    // Standardize line endings and STRIP INVISIBLE CHARACTERS (BOM, Zero Width Space, etc.)
    const cleanText = (text || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Split by recipe number pattern (e.g., "1. ", "2. ", etc.)
    // We allow optional empty lines or spaces between recipes
    const recipeBlocks = cleanText.split(/\n(?=\d+\.\s+)/);

    for (const block of recipeBlocks) {
        if (!block.trim()) continue;

        try {
            const recipe = parseRecipeBlock(block);
            if (recipe) {
                recipes.push(recipe);
            }
        } catch (error) {
            console.error('Error parsing recipe block:', error);
        }
    }

    return recipes;
}

/**
 * Parse a single recipe block
 */
function parseRecipeBlock(block) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length === 0) return null;

    const recipe = {
        name: '',
        description: '',
        ingredientiCottura: [],
        ingredientiPostCottura: [],
        instructions: [],
        archetype: 'gourmet',
        dough: 'nero',
        tags: ['gourmet']
    };

    // Name detection (Line 1)
    const firstLine = lines[0];
    const nameMatch = firstLine.match(/^\d+\.\s*(.+?)(?:\s*-\s*In cottura:|$)/);
    if (nameMatch) {
        recipe.name = nameMatch[1].trim();
    } else {
        recipe.name = firstLine.replace(/^\d+\.\s*/, '').split('-')[0].trim();
    }

    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Header detection (extremely permissive)
        if (line.match(/^(In\s*cottura:|Top\s*\(In\s*cottura\):|Cottura:|Ingredienti:|Base:)/i)) {
            currentSection = 'cottura';
            const content = line.replace(/^(In\s*cottura:|Top\s*\(In\s*cottura\):|Cottura:|Ingredienti:|Base:)/i, '').trim();
            if (content) {
                recipe.ingredientiCottura.push(...parseIngredientList(content));
            }
        } else if (line.match(/^(Post[\s-]?cottura:|Top\s*\(Post[\s-]?cottura\):|Dopo\s+cottura:|Finitura:|All'uscita:)/i)) {
            currentSection = 'post';
            const content = line.replace(/^(Post[\s-]?cottura:|Top\s*\(Post[\s-]?cottura\):|Dopo\s+cottura:|Finitura:|All'uscita:)/i, '').trim();
            if (content) {
                recipe.ingredientiPostCottura.push(...parseIngredientList(content));
            }
        } else if (line.match(/^(Perch[é|e]\s*funziona:|Descrizione:|Note:)/i)) {
            currentSection = 'description';
            const content = line.replace(/^(Perch[é|e]\s*funziona:|Descrizione:|Note:)/i, '').trim();
            if (content) {
                recipe.description = content;
            }
        } else {
            // Continuation logic
            const content = line.replace(/^[\s\-\*•]+/, '').trim();
            if (!content) continue;

            if (currentSection === 'cottura') {
                recipe.ingredientiCottura.push(...parseIngredientList(content));
            } else if (currentSection === 'post') {
                recipe.ingredientiPostCottura.push(...parseIngredientList(content));
            } else if (currentSection === 'description') {
                recipe.description += ' ' + line;
            }
        }
    }

    recipe.instructions = generateInstructions(recipe);
    return recipe;
}

function parseIngredientList(text) {
    const ingredients = [];
    // Split by comma or semicolon
    const parts = text.split(/[;,]/);

    const ingredientStarts = /^(funghi|pomodor|mozzarella|burrata|provola|fior|stracciatella|pecorino|parmigiano|gorgonzola|prosciutto|speck|guanciale|pancetta|salame|mortadella|nduja|salsiccia|tartufo|basilico|rucola|origano|timo|rosmarino|carpaccio|nocciole|noci|chips|crema|gocce|scaglie|cipolle)/i;

    for (let part of parts) {
        let subParts = [];
        let currentPart = '';
        const words = part.split(/(\s+e\s+)/i);

        for (let i = 0; i < words.length; i++) {
            if (words[i].match(/^\s+e\s+$/i) && i + 1 < words.length) {
                const nextWord = words[i + 1];
                if (nextWord.match(/^[A-Z]/) || nextWord.match(ingredientStarts)) {
                    if (currentPart.trim()) subParts.push(currentPart.trim());
                    currentPart = '';
                } else {
                    currentPart += words[i];
                }
            } else if (!words[i].match(/^\s+e\s+$/i)) {
                currentPart += words[i];
            }
        }

        if (currentPart.trim()) subParts.push(currentPart.trim());

        for (const sub of subParts) {
            const ingredient = parseIngredient(sub);
            if (ingredient) ingredients.push(ingredient);
        }
    }

    return ingredients;
}

function parseIngredient(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const quantityMatch = trimmed.match(/(\d+)\s*(g|ml|kg|l|cucchiai?|cucchiaini?|foglie?|fette?|spicchi?)/i);

    let name = trimmed;
    let quantity = null;
    let unit = 'q.b.';

    if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
        unit = quantityMatch[2].toLowerCase();
        name = trimmed.replace(quantityMatch[0], '').trim();
    }

    name = name.replace(/\s+/g, ' ').replace(/\.$/, '').trim();
    name = name.replace(/\s*\([^)]+\)\s*/g, ' ').trim();

    return {
        name: normalizeIngredientName(name),
        originalName: name,
        quantity,
        unit
    };
}

function normalizeIngredientName(name) {
    return name.toLowerCase().trim()
        .replace(/\s+(fresco|fresca|freschi|fresche)$/i, '')
        .replace(/\s+(DOP|IGP|DOC)$/i, '')
        .replace(/\s+\d+\s+mesi$/i, '')
        .trim();
}

function generateInstructions(recipe) {
    const instructions = ['Stendere l\'impasto nero al carbone vegetale'];
    if (recipe.ingredientiCottura.length > 0) {
        instructions.push(`Distribuire sulla base: ${recipe.ingredientiCottura.map(i => i.originalName).join(', ')}`);
    }
    instructions.push('Infornare a 450°C per 90 secondi (o secondo il proprio forno)');
    if (recipe.ingredientiPostCottura.length > 0) {
        instructions.push(`Guarnire dopo la cottura con: ${recipe.ingredientiPostCottura.map(i => i.originalName).join(', ')}`);
    }
    instructions.push('Servire immediatamente');
    return instructions;
}

export function suggestIngredientCategory(ingredientName) {
    const name = ingredientName.toLowerCase();
    if (name.match(/mozzarella|burrata|stracciatella|provola|scamorza|caciocavallo|fior di latte|bufala/i)) return 'latticini';
    if (name.match(/pecorino|parmigiano|grana|caprino|gorgonzola|taleggio|formaggio/i)) return 'formaggi';
    if (name.match(/guanciale|pancetta|speck|prosciutto|salame|mortadella|'nduja|nduja|salsiccia/i)) return 'salumi';
    if (name.match(/pomodoro|datterino|pachino|san marzano/i)) return 'pomodori';
    if (name.match(/zucca|carciofo|cavolo|funghi|porcini|tartufo/i)) return 'verdure';
    if (name.match(/basilico|timo|rosmarino|origano|prezzemolo/i)) return 'erbe aromatiche';
    if (name.match(/pistacchio|nocciola|noce|mandorla|pinoli/i)) return 'frutta secca';
    if (name.match(/olio|aceto|balsamico|miele/i)) return 'condimenti';
    if (name.match(/pepe|peperoncino|sale/i)) return 'spezie';
    return 'altro';
}

export function validateRecipeData(recipe) {
    const errors = [];
    if (!recipe.name) errors.push('Nome ricetta mancante');
    if (recipe.ingredientiCottura.length === 0 && recipe.ingredientiPostCottura.length === 0) {
        errors.push('Nessun ingrediente trovato');
    }
    return { valid: errors.length === 0, errors };
}
