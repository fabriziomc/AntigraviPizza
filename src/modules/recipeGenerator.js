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
 * Genera una ricetta casuale intelligente
 */
export async function generateRandomRecipe() {
    // Fetch combinations from DB
    const { getAllCombinations } = await import('./database.js');
    const dbCombinations = await getAllCombinations();

    // Use DB combinations if available, otherwise fallback to default
    const combinations = dbCombinations.length > 0
        ? dbCombinations.map(c => c.ingredients)
        : FLAVOR_COMBINATIONS;

    // Scegli se usare una combinazione predefinita o creare una nuova
    const usePredefinedCombo = Math.random() > 0.5;

    let ingredients = [];
    let mainIngredientNames = [];

    if (usePredefinedCombo && combinations.length > 0) {
        // Usa una combinazione testata
        const combo = combinations[Math.floor(Math.random() * combinations.length)];
        mainIngredientNames = combo.slice(0, 2);

        // Trova gli ingredienti nel database
        combo.forEach(ingName => {
            const found = findIngredientByName(ingName);
            if (found) ingredients.push(found);
        });
    } else {
        // Crea una combinazione nuova
        const hasBase = Math.random() > 0.3;
        if (hasBase) {
            const base = selectRandomIngredients(INGREDIENTS_DB.bases, 1)[0];
            ingredients.push({
                name: base.name,
                quantity: 200,
                unit: 'g',
                category: base.category,
                phase: 'topping',
                postBake: base.postBake
            });
        }

        // Aggiungi formaggio principale
        const mainCheese = selectRandomIngredients(INGREDIENTS_DB.cheeses, 1)[0];
        ingredients.push({
            name: mainCheese.name,
            quantity: mainCheese.weight[0] + Math.random() * (mainCheese.weight[1] - mainCheese.weight[0]),
            unit: 'g',
            category: 'Formaggi',
            phase: 'topping',
            postBake: mainCheese.postBake
        });
        mainIngredientNames.push(mainCheese.name);

        // Decidi il tipo di pizza (carne, vegetariana, premium)
        const pizzaType = Math.random();

        if (pizzaType < 0.4) {
            // Pizza con carne
            const meat = selectRandomIngredients(INGREDIENTS_DB.meats, 1)[0];
            ingredients.push({
                name: meat.name,
                quantity: meat.weight[0] + Math.random() * (meat.weight[1] - meat.weight[0]),
                unit: 'g',
                category: 'Carne',
                phase: 'topping',
                postBake: meat.postBake
            });
            mainIngredientNames.push(meat.name);
        } else if (pizzaType < 0.7) {
            // Pizza vegetariana
            const veggies = selectRandomIngredients(INGREDIENTS_DB.vegetables, 2);
            veggies.forEach(veg => {
                ingredients.push({
                    name: veg.name,
                    quantity: veg.weight[0] + Math.random() * (veg.weight[1] - veg.weight[0]),
                    unit: 'g',
                    category: 'Verdure',
                    phase: 'topping',
                    postBake: veg.postBake
                });
            });
            mainIngredientNames.push(veggies[0].name);
        } else {
            // Pizza premium
            const premium = selectRandomIngredients(INGREDIENTS_DB.premium, 1)[0];
            ingredients.push({
                name: premium.name,
                quantity: premium.weight[0] + Math.random() * (premium.weight[1] - premium.weight[0]),
                unit: 'g',
                category: 'Altro',
                phase: 'topping',
                postBake: premium.postBake
            });
            mainIngredientNames.push(premium.name);
        }

        // Aggiungi finishing touches
        const finishes = selectRandomIngredients(INGREDIENTS_DB.finishes, Math.random() > 0.5 ? 2 : 1);
        finishes.forEach(finish => {
            ingredients.push({
                name: finish.name,
                quantity: finish.weight[0] + Math.random() * (finish.weight[1] - finish.weight[0]),
                unit: finish.name.includes('Olio') || finish.name.includes('Aceto') || finish.name.includes('Miele') ? 'ml' : 'g',
                category: 'Erbe e Spezie',
                phase: 'topping',
                postBake: finish.postBake
            });
        });
    }

    // Aggiungi sempre l'impasto
    const doughType = DOUGH_TYPES[Math.floor(Math.random() * DOUGH_TYPES.length)];
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

    // Genera nome
    const name = generatePizzaName(mainIngredientNames);

    // Scegli pizzaiolo casuale
    const pizzaiolo = FAMOUS_PIZZAIOLOS[Math.floor(Math.random() * FAMOUS_PIZZAIOLOS.length)];

    // Genera descrizione
    const description = `Una ${doughType.type.toLowerCase()} con ${mainIngredientNames.join(' e ').toLowerCase()}, creata secondo la tradizione ${doughType.type.includes('Napoletana') ? 'napoletana' : doughType.type.includes('Romana') ? 'romana' : 'contemporanea'}.`;

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
    const imagePrompt = `gourmet pizza ${name}, toppings: ${mainIngredientNames.join(', ')}, professional food photography, 4k, highly detailed, italian style, rustic background`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`;

    return {
        name,
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
