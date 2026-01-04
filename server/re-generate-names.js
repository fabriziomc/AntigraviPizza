// Bulk Re-generation of Pizza Names using the new smart logic
import { db } from './db.js';

/**
 * Extracts an intelligent "short name" from an ingredient
 */
function getSmartShortName(fullName) {
    if (!fullName || fullName === 'Speciale') return fullName;

    // Normalization
    let name = fullName.trim();

    // Noise words
    const noiseWords = [
        'Fresco', 'Fresca', 'San Marzano', 'di Cetara', 'di bufala',
        'del Cilento', 'DOP', 'IGP', 'Bio', 'Biologico', 'Selezionato',
        'di Parma', 'di Norcia', 'Affumicato', 'Affumicata', 'Naturale'
    ];

    noiseWords.forEach(word => {
        const regex = new RegExp(`\\s+${word}`, 'gi');
        name = name.replace(regex, '');
    });

    const compoundConnectors = [' di ', ' al ', ' alla ', ' alle ', ' con ', ' e '];
    const hasConnector = compoundConnectors.some(conn => name.toLowerCase().includes(conn));

    if (hasConnector) {
        const words = name.split(' ');
        if (words.length > 3) {
            return words.slice(0, 3).join(' ');
        }
        return name;
    }

    return name.split(' ')[0];
}

/**
 * Generates a creative name based on ingredients
 */
function generatePizzaName(mainIngredients, existingNames = []) {
    const ing1 = mainIngredients[0] || 'Speciale';
    const ing2 = mainIngredients[1] || '';
    const ing3 = mainIngredients[2] || '';

    const short1 = getSmartShortName(ing1);
    const short2 = getSmartShortName(ing2);
    const short3 = getSmartShortName(ing3);

    const templates = [
        ing2 ? `Pizza ${short1} e ${short2}` : null,
        ing2 ? `${short1} e ${short2}` : null,
        ing2 ? `${ing1} e ${ing2}` : null,
        ing2 ? `Sapori di ${short1} e ${short2}` : null,
        ing2 ? `Delizia ${short1} e ${short2}` : null,
        ing2 ? `${short1} al ${short2}` : null,
        ing2 ? `${short2} e ${short1}` : null,
        ing3 ? `Trio ${short1}, ${short2} e ${short3}` : null,
        ing3 ? `${short1}, ${short2} e ${short3}` : null,
        ing3 ? `Pizza ${short1}, ${short2} e ${short3}` : null,
        ing3 ? `Sapori di ${short1}, ${short2} e ${short3}` : null,
        `La ${short1}`,
        `Pizza ${short1}`,
        `Delizia di ${ing1}`,
        `Profumi di ${short1}`,
        `Tentazione ${short1}`,
        `Armonia di ${short1}`,
        ing2 ? `Napoletana ${short1} e ${short2}` : `Napoletana al ${short1}`,
        ing2 ? `Romana ${short1} e ${short2}` : `Romana con ${short1}`,
        ing2 ? `Focaccia ${short1} e ${short2}` : `Focaccia ${short1}`,
        `${short1} Gourmet`,
        `Speciale ${short1}`,
        `${short1} Premium`,
        `Fantasia di ${short1}`,
        ing2 ? `Contrasto ${short1} e ${short2}` : `Contrasto ${short1}`,
        ing2 ? `Equilibrio ${short1} e ${short2}` : `Equilibrio ${short1}`,
        ing2 ? `Sinfonia ${short1} e ${short2}` : null,
        ing2 ? `Incontro di ${short1} e ${short2}` : null,
        ing2 ? `Fusione ${short1} e ${short2}` : null,
        ing2 ? `Dolce ${short1} al ${short2}` : null,
        ing2 ? `${short1} in ${short2}` : null,
        ing2 ? `Gusto ${short1} e ${short2}` : `Gusto ${short1}`,
        ing2 ? `Essenza di ${short1} e ${short2}` : `Essenza di ${short1}`,
        ing2 ? `Tradizione ${short1} e ${short2}` : `Tradizione ${short1}`
    ].filter(Boolean);

    const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);

    for (const template of shuffledTemplates) {
        const pizzaName = template.trim().replace(/\s+/g, ' ');
        if (!existingNames.includes(pizzaName)) {
            return pizzaName;
        }
    }

    const creativeSuffixes = ['Deluxe', 'Premium', 'Speciale', 'Suprema', 'Eccellente', 'Gourmet', 'Signature', 'Chef'];
    const shuffledSuffixes = [...creativeSuffixes].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(3, shuffledTemplates.length); i++) {
        for (const suffix of shuffledSuffixes) {
            const nameWithSuffix = `${shuffledTemplates[i]} ${suffix}`.trim().replace(/\s+/g, ' ');
            if (!existingNames.includes(nameWithSuffix)) {
                return nameWithSuffix;
            }
        }
    }

    return `${shuffledTemplates[0]} #${Math.floor(Math.random() * 1000)}`;
}

async function bulkRename() {
    console.log('🚀 Starting bulk rename migration...');

    try {
        const result = await db.execute('SELECT id, name, baseIngredients, preparations FROM Recipes');
        const recipes = result.rows;

        console.log(`Found ${recipes.length} recipes to process.`);

        let updatedCount = 0;
        const usedNames = [];

        for (const recipe of recipes) {
            let baseIngs = [];
            try {
                baseIngs = JSON.parse(recipe.baseIngredients || '[]');
            } catch (e) {
                console.warn(`Could not parse ingredients for recipe ${recipe.id}`);
            }

            // Extract main ingredients names
            const mainIngNames = baseIngs.slice(0, 3).map(i => i.name);

            const newName = generatePizzaName(mainIngNames, usedNames);
            usedNames.push(newName);

            if (newName !== recipe.name) {
                console.log(`Updating [${recipe.name}] -> [${newName}]`);
                await db.execute({
                    sql: 'UPDATE Recipes SET name = ? WHERE id = ?',
                    args: [newName, recipe.id]
                });
                updatedCount++;
            } else {
                console.log(`Skipping [${recipe.name}] (no change)`);
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`Total updated: ${updatedCount}/${recipes.length}`);

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        // Exit process since db client might keep it open
        process.exit(0);
    }
}

bulkRename();
