// ============================================
// RECIPE GENERATOR - Intelligent Pizza Recipe Creator
// ============================================

import { FAMOUS_PIZZAIOLOS, FLAVOR_COMBINATIONS } from '../utils/constants.js';

// Database di ingredienti autentici per pizza gourmet
const INGREDIENTS_DB = {
    // Basi e impasti
    bases: [
        { name: 'Pomodoro San Marzano', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Pomodorini datterini', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Passata di pomodoro', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Crema di zucca', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Pesto di basilico', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di pistacchio', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di burrata', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Olio EVO aromatizzato', category: 'Oli', phase: 'topping', postBake: true }
    ],

    // Formaggi
    cheeses: [
        { name: 'Mozzarella di bufala', weight: [150, 200], phase: 'topping', postBake: false },
        { name: 'Fior di latte', weight: [120, 180], phase: 'topping', postBake: false },
        { name: 'Burrata', weight: [100, 150], phase: 'topping', postBake: true },
        { name: 'Stracciatella', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Gorgonzola DOP', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Taleggio', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Parmigiano Reggiano', weight: [40, 60], phase: 'topping', postBake: false },
        { name: 'Pecorino Romano', weight: [30, 50], phase: 'topping', postBake: false },
        { name: 'Provola affumicata', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Ricotta fresca', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Scamorza', weight: [100, 140], phase: 'topping', postBake: false },
        { name: 'Caciocavallo', weight: [80, 120], phase: 'topping', postBake: false }
    ],

    // Carni e salumi
    meats: [
        { name: 'Prosciutto crudo di Parma', weight: [60, 80], phase: 'topping', postBake: true },
        { name: 'Prosciutto cotto', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Speck Alto Adige', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Salsiccia fresca', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Guanciale croccante', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Pancetta', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Bresaola', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Salame piccante', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Mortadella', weight: [60, 90], phase: 'topping', postBake: true },
        { name: 'Nduja calabrese', weight: [30, 50], phase: 'topping', postBake: false }
    ],

    // Verdure
    vegetables: [
        { name: 'Funghi porcini', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Funghi champignon', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Melanzane grigliate', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Zucchine', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Peperoni', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Carciofi', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Radicchio', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Rucola', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pomodorini ciliegino', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Olive taggiasche', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Cipolla caramellata', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Friarielli', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Asparagi', weight: [60, 100], phase: 'topping', postBake: false }
    ],

    // Ingredienti premium
    premium: [
        { name: 'Tartufo nero', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Tartufo bianco', weight: [5, 15], phase: 'topping', postBake: true },
        { name: 'Salmone affumicato', weight: [60, 80], phase: 'topping', postBake: true },
        { name: 'Alici di Cetara', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Bottarga', weight: [20, 30], phase: 'topping', postBake: true },
        { name: 'Caviale', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Foie gras', weight: [30, 50], phase: 'topping', postBake: true }
    ],

    // Finishing touches
    finishes: [
        { name: 'Basilico fresco', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Origano', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Rosmarino', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Peperoncino fresco', weight: [5, 15], phase: 'topping', postBake: true },
        { name: 'Limone grattugiato', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Miele di acacia', weight: [15, 30], phase: 'topping', postBake: true },
        { name: 'Noci', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pistacchi', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pere', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Fichi', weight: [50, 80], phase: 'topping', postBake: true },
        { name: 'Olio al tartufo', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Aceto balsamico', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Riduzione di balsamico', weight: [15, 25], phase: 'topping', postBake: true }
    ]
};

// Tipi di impasto
const DOUGH_TYPES = [
    {
        type: 'Napoletana Classica',
        flour: 'Farina tipo 00',
        water: 325,
        yeast: 'Lievito di birra',
        yeastAmount: 2,
        fermentation: '24 ore a temperatura ambiente'
    },
    {
        type: 'Romana Croccante',
        flour: 'Farina tipo 0',
        water: 300,
        yeast: 'Lievito di birra',
        yeastAmount: 3,
        fermentation: '12 ore in frigo'
    },
    {
        type: 'Contemporanea',
        flour: 'Mix farina 00 e integrale',
        water: 350,
        yeast: 'Lievito madre',
        yeastAmount: 100,
        fermentation: '48 ore con doppia lievitazione'
    },
    {
        type: 'Alta Idratazione',
        flour: 'Farina Manitoba',
        water: 380,
        yeast: 'Lievito madre',
        yeastAmount: 80,
        fermentation: '36 ore a temperatura controllata'
    },
    {
        type: 'Integrale',
        flour: 'Farina integrale',
        water: 340,
        yeast: 'Lievito di birra',
        yeastAmount: 2,
        fermentation: '18 ore a temperatura ambiente'
    }
];

// Combinazioni di ingredienti che funzionano bene insieme
// FLAVOR_COMBINATIONS moved to constants.js

// Tags per categorizzare le pizze
const PIZZA_STYLES = [
    'Classica', 'Gourmet', 'Contemporanea', 'Napoletana', 'Romana',
    'Vegetariana', 'Vegana', 'Bianca', 'Rossa', 'Premium'
];

/**
 * Genera un nome creativo per la pizza basato sugli ingredienti
 */
function generatePizzaName(mainIngredients) {
    const templates = [
        `Pizza ${mainIngredients[0]} e ${mainIngredients[1]}`,
        `${mainIngredients[0]} ${mainIngredients[1] ? 'e ' + mainIngredients[1] : ''}`,
        `La ${mainIngredients[0]}`,
        `Speciale ${mainIngredients[0]}`,
        `${mainIngredients[0]} Gourmet`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Seleziona ingredienti casuali da una categoria
 */
function selectRandomIngredients(category, count = 1) {
    const shuffled = [...category].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Genera una ricetta casuale intelligente basata su archetipi
 */
export async function generateRandomRecipe() {
    // Fetch combinations from DB
    const { getAllCombinations } = await import('./database.js');
    const dbCombinations = await getAllCombinations();

    // Use DB combinations if available, otherwise fallback to default
    const combinations = dbCombinations.length > 0
        ? dbCombinations.map(c => c.ingredients)
        : FLAVOR_COMBINATIONS;

    // Scegli se usare una combinazione predefinita o creare una nuova basata su archetipi
    // 40% combinazione predefinita, 60% archetipo
    const usePredefinedCombo = Math.random() > 0.6;

    let ingredients = [];
    let mainIngredientNames = [];
    let pizzaName = '';
    let description = '';
    let doughType = null;

    if (usePredefinedCombo && combinations.length > 0) {
        // Usa una combinazione testata
        const combo = combinations[Math.floor(Math.random() * combinations.length)];
        mainIngredientNames = combo.slice(0, 2);

        // Trova gli ingredienti nel database
        combo.forEach(ingName => {
            const found = findIngredientByName(ingName);
            if (found) ingredients.push(found);
        });

        doughType = DOUGH_TYPES[Math.floor(Math.random() * DOUGH_TYPES.length)];
        pizzaName = generatePizzaName(mainIngredientNames);
        description = `Una ${doughType.type.toLowerCase()} con ${mainIngredientNames.join(' e ').toLowerCase()}, creata secondo la tradizione.`;

    } else {
        // Usa la logica degli ARCHETIPI
        const archetypes = ['dolce_salato', 'terra_bosco', 'fresca_estiva', 'piccante_decisa'];
        const selectedArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];

        switch (selectedArchetype) {
            case 'dolce_salato':
                // Contrasto: Formaggio forte + Frutta/Miele + Croccante
                doughType = DOUGH_TYPES.find(d => d.type === 'Contemporanea') || DOUGH_TYPES[0];

                // Base bianca
                const cheese = selectRandomIngredients(INGREDIENTS_DB.cheeses.filter(c => ['Gorgonzola DOP', 'Taleggio', 'Pecorino Romano'].includes(c.name)), 1)[0];
                const fruit = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => ['Pere', 'Fichi', 'Miele di acacia'].includes(f.name)), 1)[0];
                const crunch = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => ['Noci', 'Pistacchi'].includes(f.name)), 1)[0];

                ingredients.push({ ...cheese, quantity: 80, category: 'Formaggi', phase: 'topping' });
                ingredients.push({ ...fruit, quantity: 60, category: 'Frutta', phase: 'topping', postBake: fruit.name !== 'Pere' });
                ingredients.push({ ...crunch, quantity: 30, category: 'Croccante', phase: 'topping', postBake: true });

                // Aggiungi mozzarella fior di latte come base
                ingredients.unshift({ name: 'Fior di latte', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });

                mainIngredientNames = [cheese.name, fruit.name];
                pizzaName = `Contrasto ${cheese.name.split(' ')[0]}`;
                description = `Un perfetto equilibrio tra la sapidità del ${cheese.name.toLowerCase()} e la dolcezza di ${fruit.name.toLowerCase()}, completata dalla croccantezza di ${crunch.name.toLowerCase()}.`;
                break;

            case 'terra_bosco':
                // Sapori autunnali: Funghi/Tartufo + Salume stagionato + Crema
                doughType = DOUGH_TYPES.find(d => d.type === 'Integrale') || DOUGH_TYPES[0];

                const mushroom = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => v.name.includes('Funghi')), 1)[0];
                const meat = selectRandomIngredients(INGREDIENTS_DB.meats.filter(m => ['Speck Alto Adige', 'Salsiccia fresca', 'Guanciale croccante'].includes(m.name)), 1)[0];
                const cream = selectRandomIngredients(INGREDIENTS_DB.bases.filter(b => b.name.includes('Crema') || b.name.includes('Tartufo')), 1)[0] ||
                    selectRandomIngredients(INGREDIENTS_DB.premium.filter(p => p.name.includes('Tartufo')), 1)[0];

                if (cream) ingredients.push({ ...cream, quantity: cream.category === 'Salsa' ? 80 : 15, category: 'Base', phase: 'topping', postBake: cream.postBake });
                ingredients.push({ ...mushroom, quantity: 100, category: 'Verdure', phase: 'topping', postBake: false });
                ingredients.push({ ...meat, quantity: 80, category: 'Carne', phase: 'topping', postBake: meat.postBake });

                // Base mozzarella
                ingredients.unshift({ name: 'Provola affumicata', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });

                mainIngredientNames = [mushroom.name, meat.name];
                pizzaName = `Bosco ${meat.name.split(' ')[0]}`;
                description = `I profumi del bosco con ${mushroom.name.toLowerCase()} e ${meat.name.toLowerCase()}, su una base rustica.`;
                break;

            case 'fresca_estiva':
                // Base focaccia/rossa + Ingredienti a crudo
                doughType = DOUGH_TYPES.find(d => d.type === 'Alta Idratazione') || DOUGH_TYPES[0];

                const freshBase = Math.random() > 0.5
                    ? { name: 'Pomodorini datterini', quantity: 150, unit: 'g', category: 'Verdure', phase: 'topping', postBake: false }
                    : { name: 'Olio EVO aromatizzato', quantity: 20, unit: 'ml', category: 'Oli', phase: 'topping', postBake: true };

                const freshCheese = selectRandomIngredients(INGREDIENTS_DB.cheeses.filter(c => ['Burrata', 'Stracciatella', 'Mozzarella di bufala'].includes(c.name)), 1)[0];
                const freshMeat = selectRandomIngredients(INGREDIENTS_DB.meats.filter(m => ['Prosciutto crudo di Parma', 'Bresaola', 'Alici di Cetara'].includes(m.name)), 1)[0];
                const freshVeg = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => ['Rucola', 'Pomodorini ciliegino'].includes(v.name)), 1)[0];

                ingredients.push({ ...freshBase });
                ingredients.push({ ...freshCheese, quantity: 120, category: 'Formaggi', phase: 'topping', postBake: true });
                ingredients.push({ ...freshMeat, quantity: 70, category: 'Carne', phase: 'topping', postBake: true });
                ingredients.push({ ...freshVeg, quantity: 50, category: 'Verdure', phase: 'topping', postBake: true });

                // Aggiungi scorza di limone se c'è pesce
                if (freshMeat.name.includes('Alici') || freshMeat.name.includes('Salmone')) {
                    ingredients.push({ name: 'Limone grattugiato', quantity: 5, unit: 'g', category: 'Aromi', phase: 'topping', postBake: true });
                }

                mainIngredientNames = [freshCheese.name, freshMeat.name];
                pizzaName = `Estate ${freshMeat.name.split(' ')[0]}`;
                description = `Freschezza assoluta con ${freshCheese.name.toLowerCase()} e ${freshMeat.name.toLowerCase()} aggiunti a crudo.`;
                break;

            case 'piccante_decisa':
                // Base rossa + Piccante + Contrasto dolce/acido
                doughType = DOUGH_TYPES.find(d => d.type === 'Napoletana Classica') || DOUGH_TYPES[0];

                ingredients.push({ name: 'Pomodoro San Marzano', quantity: 80, unit: 'g', category: 'Salsa', phase: 'topping', postBake: false });
                ingredients.push({ name: 'Fior di latte', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });

                const spicy = selectRandomIngredients(INGREDIENTS_DB.meats.filter(m => ['Nduja calabrese', 'Salame piccante'].includes(m.name)), 1)[0];
                const vegetable = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => ['Cipolla caramellata', 'Olive taggiasche', 'Peperoni'].includes(v.name)), 1)[0];
                const finish = Math.random() > 0.5
                    ? { name: 'Miele di acacia', quantity: 15, unit: 'g', category: 'Salsa', phase: 'topping', postBake: true }
                    : { name: 'Ricotta fresca', quantity: 50, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: true };

                ingredients.push({ ...spicy, quantity: 60, category: 'Carne', phase: 'topping', postBake: false });
                ingredients.push({ ...vegetable, quantity: 50, category: 'Verdure', phase: 'topping', postBake: false });
                ingredients.push({ ...finish });

                mainIngredientNames = [spicy.name, vegetable.name];
                pizzaName = `Fuoco e ${finish.name.split(' ')[0]}`;
                description = `Il carattere deciso della ${spicy.name.toLowerCase()} bilanciato dalla dolcezza di ${finish.name.toLowerCase()}.`;
                break;
        }
    }

    // Aggiungi sempre l'impasto se non è già stato aggiunto
    if (!doughType) doughType = DOUGH_TYPES[Math.floor(Math.random() * DOUGH_TYPES.length)];

    const doughIngredients = [
        { name: doughType.flour, quantity: 500, unit: 'g', category: 'Impasto', phase: 'dough', postBake: false },
        { name: 'Acqua', quantity: doughType.water, unit: 'ml', category: 'Impasto', phase: 'dough', postBake: false },
        { name: 'Sale marino', quantity: 10, unit: 'g', category: 'Impasto', phase: 'dough', postBake: false },
        { name: doughType.yeast, quantity: doughType.yeastAmount, unit: 'g', category: 'Impasto', phase: 'dough', postBake: false }
    ];

    ingredients = [...doughIngredients, ...ingredients];

    // Arrotonda le quantità
    ingredients = ingredients.map(ing => ({
        ...ing,
        quantity: Math.round(ing.quantity)
    }));

    // Genera nome se non esiste
    if (!pizzaName) pizzaName = generatePizzaName(mainIngredientNames);

    // Scegli pizzaiolo casuale
    const pizzaiolo = FAMOUS_PIZZAIOLOS[Math.floor(Math.random() * FAMOUS_PIZZAIOLOS.length)];

    // Genera istruzioni divise per fase
    const instructions = {
        dough: [
            `Preparare l'impasto ${doughType.type.toLowerCase()} con ${doughType.flour.toLowerCase()}, acqua, sale e ${doughType.yeast.toLowerCase()}`,
            `Impastare fino ad ottenere un composto liscio ed elastico`,
            `Lasciare lievitare: ${doughType.fermentation}`,
            `Stendere l'impasto formando un disco di circa 30-35cm di diametro`
        ],
        topping: [
            ...generateCookingInstructions(ingredients),
            `Infornare a ${Math.floor(400 + Math.random() * 80)}°C per ${Math.floor(90 + Math.random() * 90)} secondi`,
            `Servire immediatamente ben calda`
        ]
    };

    // Determina i tags
    const tags = determineTags(ingredients, doughType);

    // Genera URL immagine dinamica
    const imagePrompt = `gourmet pizza ${pizzaName}, toppings: ${mainIngredientNames.join(', ')}, professional food photography, 4k, highly detailed, italian style, rustic background`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`;

    return {
        name: pizzaName,
        pizzaiolo,
        source: 'Generata da AntigraviPizza',
        description,
        ingredients,
        instructions,
        imageUrl,
        tags
    };
}
function findIngredientByName(name) {
    const allIngredients = [
        ...INGREDIENTS_DB.cheeses,
        ...INGREDIENTS_DB.meats,
        ...INGREDIENTS_DB.vegetables,
        ...INGREDIENTS_DB.premium,
        ...INGREDIENTS_DB.finishes,
        ...INGREDIENTS_DB.bases
    ];

    const found = allIngredients.find(ing => ing.name === name);
    if (found) {
        return {
            name: found.name,
            quantity: found.weight ? (found.weight[0] + Math.random() * (found.weight[1] - found.weight[0])) : 50,
            unit: 'g',
            category: categorizeIngredient(found.name),
            phase: 'topping',
            postBake: found.postBake
        };
    }
    return null;
}

/**
 * Categorizza un ingrediente
 */
function categorizeIngredient(name) {
    if (INGREDIENTS_DB.cheeses.some(c => c.name === name)) return 'Formaggi';
    if (INGREDIENTS_DB.meats.some(m => m.name === name)) return 'Carne';
    if (INGREDIENTS_DB.vegetables.some(v => v.name === name)) return 'Verdure';
    if (INGREDIENTS_DB.premium.some(p => p.name === name)) return 'Altro';
    return 'Erbe e Spezie';
}

/**
 * Genera istruzioni di cottura basate sugli ingredienti
 */
function generateCookingInstructions(ingredients) {
    const instructions = [];

    const hasBase = ingredients.some(i => i.category === 'Salsa');
    if (hasBase) {
        const base = ingredients.find(i => i.category === 'Salsa');
        instructions.push(`Distribuire ${base.name.toLowerCase()} sulla base`);
    }

    // Ingredienti da cuocere (non postBake)
    const cookableCheeses = ingredients.filter(i => i.category === 'Formaggi' && !i.postBake);
    if (cookableCheeses.length > 0) {
        instructions.push(`Aggiungere ${cookableCheeses.map(c => c.name.toLowerCase()).join(', ')} a pezzetti`);
    }

    const cookableToppings = ingredients.filter(i => ['Carne', 'Verdure', 'Altro'].includes(i.category) && !i.postBake);
    if (cookableToppings.length > 0) {
        instructions.push(`Distribuire ${cookableToppings.map(t => t.name.toLowerCase()).join(', ')}`);
    }

    // Ingredienti in uscita (postBake)
    const postBakeIngredients = ingredients.filter(i => i.postBake);
    if (postBakeIngredients.length > 0) {
        instructions.push(`All'uscita dal forno, aggiungere: ${postBakeIngredients.map(i => i.name.toLowerCase()).join(', ')}`);
    }

    return instructions;
}

/**
 * Determina i tags appropriati per la pizza
 */
function determineTags(ingredients, doughType) {
    const tags = [];

    // Tag basato sul tipo di impasto
    if (doughType.type.includes('Napoletana')) tags.push('Napoletana');
    if (doughType.type.includes('Romana')) tags.push('Romana');
    if (doughType.type.includes('Contemporanea')) tags.push('Contemporanea');

    // Tag basato sugli ingredienti
    const hasMeat = ingredients.some(i => i.category === 'Carne');
    const hasPremium = ingredients.some(i => ['Tartufo', 'Salmone', 'Caviale', 'Foie gras'].some(p => i.name.includes(p)));
    const hasBase = ingredients.some(i => i.category === 'Salsa' && i.name.includes('Pomodoro'));

    if (!hasMeat) tags.push('Vegetariana');
    if (hasPremium) tags.push('Premium', 'Gourmet');
    if (!hasBase) tags.push('Bianca');
    else tags.push('Rossa');

    // Aggiungi sempre Gourmet se non c'è già
    if (!tags.includes('Gourmet') && Math.random() > 0.5) tags.push('Gourmet');

    // Aggiungi Classica se appropriato
    if (!hasPremium && tags.length < 3) tags.push('Classica');

    return tags.slice(0, 4); // Massimo 4 tags
}

/**
 * Genera multiple ricette casuali
 */
export function generateMultipleRecipes(count = 3) {
    const recipes = [];
    for (let i = 0; i < count; i++) {
        recipes.push(generateRandomRecipe());
    }
    return recipes;
}
