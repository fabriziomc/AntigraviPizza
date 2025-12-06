// ============================================
// RECIPE GENERATOR - Intelligent Pizza Recipe Creator
// ============================================

import { FAMOUS_PIZZAIOLOS, FLAVOR_COMBINATIONS, DOUGH_TYPES, DOUGH_RECIPES } from '../utils/constants.js';

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
        { name: 'Olio EVO aromatizzato', category: 'Oli', phase: 'topping', postBake: true },
        // Nuove basi e salse
        { name: 'Crema di ceci', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Crema di melanzane', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Salsa verde', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di noci', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di peperoni', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Pesto di rucola', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Pesto rosso', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Salsa al pesto di olive', category: 'Salsa', phase: 'topping', postBake: true }
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
        { name: 'Caciocavallo', weight: [80, 120], phase: 'topping', postBake: false },
        // Nuovi formaggi
        { name: 'Fontina Val d\'Aosta', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Asiago', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Castelmagno', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Squacquerone', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Crescenza', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Robiola', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Brie', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Grana Padano', weight: [40, 60], phase: 'topping', postBake: false },
        { name: 'Caprino fresco', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Stracchino', weight: [80, 120], phase: 'topping', postBake: true }
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
        { name: 'Nduja calabrese', weight: [30, 50], phase: 'topping', postBake: false },
        // Nuovi salumi
        { name: 'Culatello di Zibello', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Coppa di Parma', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Lonza', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Porchetta', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Ventricina', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Finocchiona', weight: [50, 80], phase: 'topping', postBake: true },
        { name: 'Soppressata', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Lardo di Colonnata', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Capocollo', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Salamino piccante', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Prosciutto di San Daniele', weight: [60, 80], phase: 'topping', postBake: true },
        { name: 'Cotechino', weight: [80, 120], phase: 'topping', postBake: false }
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
        { name: 'Asparagi', weight: [60, 100], phase: 'topping', postBake: false },
        // Nuove verdure
        { name: 'Spinaci', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Bietole', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Cavolo nero', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Broccoli', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Cavolfiore', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Patate', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Patate dolci', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Pomodori secchi', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Capperi', weight: [20, 40], phase: 'topping', postBake: true },
        { name: 'Sedano', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Carote', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Barbabietole', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Piselli', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Fave', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Cicoria', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Catalogna', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Puntarelle', weight: [50, 80], phase: 'topping', postBake: true },
        { name: 'Agretti', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Cipolla rossa', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Porri', weight: [60, 100], phase: 'topping', postBake: false }
    ],

    // Ingredienti premium
    premium: [
        { name: 'Tartufo nero', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Tartufo bianco', weight: [5, 15], phase: 'topping', postBake: true },
        { name: 'Salmone affumicato', weight: [60, 80], phase: 'topping', postBake: true },
        { name: 'Alici di Cetara', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Bottarga', weight: [20, 30], phase: 'topping', postBake: true },
        { name: 'Caviale', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Foie gras', weight: [30, 50], phase: 'topping', postBake: true },
        // Nuovi ingredienti premium (pesce e frutti di mare)
        { name: 'Scampi', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Gamberi rossi', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Polpo', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Cozze', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Vongole', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Capesante', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Tonno fresco', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Acciughe', weight: [30, 50], phase: 'topping', postBake: true }
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
        { name: 'Riduzione di balsamico', weight: [15, 25], phase: 'topping', postBake: true },
        // Nuovi finishes
        { name: 'Timo', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Salvia', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Maggiorana', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Prezzemolo', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Erba cipollina', weight: [5, 15], phase: 'topping', postBake: true },
        { name: 'Aneto', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Menta', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Zenzero', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Paprika affumicata', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Semi di sesamo', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Granella di mandorle', weight: [20, 40], phase: 'topping', postBake: true },
        { name: 'Nocciole', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pinoli', weight: [20, 40], phase: 'topping', postBake: true },
        { name: 'Miele di castagno', weight: [15, 30], phase: 'topping', postBake: true },
        { name: 'Scaglie di cioccolato', weight: [20, 40], phase: 'topping', postBake: true }
    ]
};

// Tipi di impasto
// DOUGH_TYPES moved to constants.js

// Combinazioni di ingredienti che funzionano bene insieme
// FLAVOR_COMBINATIONS moved to constants.js

// Tags per categorizzare le pizze
const PIZZA_STYLES = [
    'Classica', 'Gourmet', 'Contemporanea', 'Napoletana', 'Romana',
    'Vegetariana', 'Vegana', 'Bianca', 'Rossa', 'Premium'
];

/**
 * Genera un nome creativo e unico per la pizza basato sugli ingredienti
 */
async function generatePizzaName(mainIngredients, existingNames = []) {
    const ing1 = mainIngredients[0] || 'Speciale';
    const ing2 = mainIngredients[1] || '';
    const ing3 = mainIngredients[2] || '';

    // Estrai solo il nome principale (prima parola) per pattern più corti
    const short1 = ing1.split(' ')[0];
    const short2 = ing2 ? ing2.split(' ')[0] : '';
    const short3 = ing3 ? ing3.split(' ')[0] : '';

    // APPROCCIO C: Mix di pattern + ingredienti reali + creatività
    const templates = [
        // === PATTERN CON INGREDIENTI REALI ===

        // Due ingredienti - varie combinazioni
        ing2 ? `Pizza ${short1} e ${short2}` : null,
        ing2 ? `${short1} e ${short2}` : null,
        ing2 ? `${ing1} e ${ing2}` : null,
        ing2 ? `Sapori di ${short1} e ${short2}` : null,
        ing2 ? `Delizia ${short1} e ${short2}` : null,
        ing2 ? `${short1} al ${short2}` : null,
        ing2 ? `${short2} e ${short1}` : null, // Ordine invertito

        // Tre ingredienti - combinazioni ricche
        ing3 ? `Trio ${short1}, ${short2} e ${short3}` : null,
        ing3 ? `${short1}, ${short2} e ${short3}` : null,
        ing3 ? `Pizza ${short1}, ${short2} e ${short3}` : null,
        ing3 ? `Sapori di ${short1}, ${short2} e ${short3}` : null,

        // Un ingrediente - pattern descrittivi
        `La ${short1}`,
        `Pizza ${short1}`,
        `Delizia di ${ing1}`,
        `Profumi di ${short1}`,
        `Tentazione ${short1}`,
        `Armonia di ${short1}`,

        // === PATTERN REGIONALI CON INGREDIENTI ===
        ing2 ? `Napoletana ${short1} e ${short2}` : `Napoletana al ${short1}`,
        ing2 ? `Romana ${short1} e ${short2}` : `Romana con ${short1}`,
        ing2 ? `Focaccia ${short1} e ${short2}` : `Focaccia ${short1}`,

        // === PATTERN CREATIVI ===
        `${short1} Gourmet`,
        `Speciale ${short1}`,
        `${short1} Premium`,
        `Fantasia di ${short1}`,
        ing2 ? `Contrasto ${short1} e ${short2}` : `Contrasto ${short1}`,
        ing2 ? `Equilibrio ${short1} e ${short2}` : `Equilibrio ${short1}`,
        ing2 ? `Sinfonia ${short1} e ${short2}` : null,

        // === PATTERN POETICI ===
        ing2 ? `Incontro di ${short1} e ${short2}` : null,
        ing2 ? `Fusione ${short1} e ${short2}` : null,
        ing2 ? `Dolce ${short1} al ${short2}` : null,
        ing2 ? `${short1} in ${short2}` : null,

        // === PATTERN DESCRITTIVI ===
        ing2 ? `Gusto ${short1} e ${short2}` : `Gusto ${short1}`,
        ing2 ? `Essenza di ${short1} e ${short2}` : `Essenza di ${short1}`,
        ing2 ? `Tradizione ${short1} e ${short2}` : `Tradizione ${short1}`
    ].filter(Boolean); // Rimuovi null

    // Shuffle templates per varietà
    const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);

    // FASE 1: Prova tutti i template base
    for (const template of shuffledTemplates) {
        const pizzaName = template.trim().replace(/\s+/g, ' '); // Normalizza spazi
        if (!existingNames.includes(pizzaName)) {
            return pizzaName;
        }
    }

    // FASE 2: Aggiungi suffissi creativi e descrittivi
    const creativeSuffixes = [
        // Descrittivi di qualità
        'Deluxe',
        'Premium',
        'Speciale',
        'Suprema',
        'Eccellente',

        // Stili
        'Rustica',
        'Contemporanea',
        'Tradizionale',
        'Innovativa',
        'Artigianale',
        'Classica',
        'Moderna',
        'Autentica',
        'Originale',
        'Raffinata',

        // Regionali
        'Napoletana',
        'Romana',
        'Toscana',
        'Siciliana',
        'Pugliese',

        // Creativi
        'Gourmet',
        'Signature',
        'Chef',
        'Esclusiva',
        'Unica'
    ];

    const shuffledSuffixes = [...creativeSuffixes].sort(() => Math.random() - 0.5);

    // Prova con suffissi su vari template
    for (let i = 0; i < Math.min(3, shuffledTemplates.length); i++) {
        for (const suffix of shuffledSuffixes) {
            const nameWithSuffix = `${shuffledTemplates[i]} ${suffix}`.trim().replace(/\s+/g, ' ');
            if (!existingNames.includes(nameWithSuffix)) {
                return nameWithSuffix;
            }
        }
    }

    // FASE 3: Combinazioni creative con ingredienti secondari
    if (ing3) {
        const secondaryPatterns = [
            `${short1} e ${short2} al ${short3}`,
            `${short1} con ${short3}`,
            `${short2} e ${short3} Speciale`,
            `Trio ${short1} e ${short3}`
        ];

        for (const pattern of secondaryPatterns) {
            if (!existingNames.includes(pattern)) {
                return pattern;
            }
        }
    }

    // FASE 4: Numeri descrittivi
    const baseTemplate = shuffledTemplates[0];
    const numberedPrefixes = ['Ricetta', 'Variante', 'Versione', 'Edizione'];

    for (const prefix of numberedPrefixes) {
        for (let counter = 1; counter < 100; counter++) {
            const nameWithNumber = `${baseTemplate} ${prefix} ${counter}`;
            if (!existingNames.includes(nameWithNumber)) {
                return nameWithNumber;
            }
        }
    }

    // FASE 5: GARANZIA ASSOLUTA con timestamp
    const timestamp = Date.now().toString().slice(-6);
    const uniqueName = `${baseTemplate} #${timestamp}`;

    if (existingNames.includes(uniqueName)) {
        // Fallback estremo (praticamente impossibile)
        return `${baseTemplate} #${timestamp}-${Math.floor(Math.random() * 1000)}`;
    }

    return uniqueName;
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
    return await generateRandomRecipeWithNames([]);
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
 * Genera multiple ricette casuali con nomi garantiti unici
 */
export async function generateMultipleRecipes(count = 3) {
    const recipes = [];
    const generatedNames = []; // Track names generated in this batch

    for (let i = 0; i < count; i++) {
        // Pass previously generated names to avoid duplicates in this batch
        const recipe = await generateRandomRecipeWithNames(generatedNames);
        recipes.push(recipe);
        generatedNames.push(recipe.name);
    }

    return recipes;
}

/**
 * Internal function that accepts additional names to avoid
 */
async function generateRandomRecipeWithNames(additionalNames = []) {
    // Fetch combinations and existing recipe names from DB
    const { getAllCombinations, getAllRecipes } = await import('./database.js');
    const dbCombinations = await getAllCombinations();
    const existingRecipes = await getAllRecipes();

    // Combine existing DB names with names generated in current batch
    const existingNames = [...existingRecipes.map(r => r.name), ...additionalNames];

    // Use DB combinations if available, otherwise fallback to default
    const combinations = dbCombinations.length > 0
        ? dbCombinations.map(c => c.ingredients)
        : FLAVOR_COMBINATIONS;

    // Rest of the generation logic (same as generateRandomRecipe)
    const usePredefinedCombo = Math.random() > 0.7;

    let ingredients = [];
    let mainIngredientNames = [];
    let pizzaName = '';
    let description = '';
    let doughType = null;

    if (usePredefinedCombo && combinations.length > 0) {
        const combo = combinations[Math.floor(Math.random() * combinations.length)];
        mainIngredientNames = combo.slice(0, 2);

        combo.forEach(ingName => {
            const found = findIngredientByName(ingName);
            if (found) ingredients.push(found);
        });

        doughType = DOUGH_TYPES[Math.floor(Math.random() * DOUGH_TYPES.length)];
        pizzaName = await generatePizzaName(mainIngredientNames, existingNames);
        description = `Una ${doughType.type.toLowerCase()} con ${mainIngredientNames.join(' e ').toLowerCase()}, creata secondo la tradizione.`;

    } else {
        const archetypes = ['dolce_salato', 'terra_bosco', 'fresca_estiva', 'piccante_decisa', 'mare', 'vegana', 'fusion'];
        const selectedArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];

        switch (selectedArchetype) {
            case 'dolce_salato':
                doughType = DOUGH_TYPES.find(d => d.type === 'Contemporanea') || DOUGH_TYPES[0];
                const cheese = selectRandomIngredients(INGREDIENTS_DB.cheeses.filter(c => ['Gorgonzola DOP', 'Taleggio', 'Pecorino Romano'].includes(c.name)), 1)[0];
                const fruit = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => ['Pere', 'Fichi', 'Miele di acacia'].includes(f.name)), 1)[0];
                const crunch = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => ['Noci', 'Pistacchi'].includes(f.name)), 1)[0];

                ingredients.push({ ...cheese, quantity: 80, category: 'Formaggi', phase: 'topping' });
                ingredients.push({ ...fruit, quantity: 60, category: 'Frutta', phase: 'topping', postBake: fruit.name !== 'Pere' });
                ingredients.push({ ...crunch, quantity: 30, category: 'Croccante', phase: 'topping', postBake: true });
                ingredients.unshift({ name: 'Fior di latte', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });

                mainIngredientNames = [cheese.name, fruit.name, crunch.name];
                description = `Un perfetto equilibrio tra la sapidità del ${cheese.name.toLowerCase()} e la dolcezza di ${fruit.name.toLowerCase()}, completata dalla croccantezza di ${crunch.name.toLowerCase()}.`;
                break;

            case 'terra_bosco':
                doughType = DOUGH_TYPES.find(d => d.type === 'Integrale') || DOUGH_TYPES[0];
                const mushroom = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => v.name.includes('Funghi')), 1)[0];
                const meat = selectRandomIngredients(INGREDIENTS_DB.meats.filter(m => ['Speck Alto Adige', 'Salsiccia fresca', 'Guanciale croccante'].includes(m.name)), 1)[0];
                const cream = selectRandomIngredients(INGREDIENTS_DB.bases.filter(b => b.name.includes('Crema') || b.name.includes('Tartufo')), 1)[0] ||
                    selectRandomIngredients(INGREDIENTS_DB.premium.filter(p => p.name.includes('Tartufo')), 1)[0];

                if (cream) ingredients.push({ ...cream, quantity: cream.category === 'Salsa' ? 80 : 15, category: 'Base', phase: 'topping', postBake: cream.postBake });
                ingredients.push({ ...mushroom, quantity: 100, category: 'Verdure', phase: 'topping', postBake: false });
                ingredients.push({ ...meat, quantity: 80, category: 'Carne', phase: 'topping', postBake: meat.postBake });
                ingredients.unshift({ name: 'Provola affumicata', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });

                mainIngredientNames = [mushroom.name, meat.name];
                description = `I profumi del bosco con ${mushroom.name.toLowerCase()} e ${meat.name.toLowerCase()}, su una base rustica.`;
                break;

            case 'fresca_estiva':
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

                if (freshMeat.name.includes('Alici') || freshMeat.name.includes('Salmone')) {
                    ingredients.push({ name: 'Limone grattugiato', quantity: 5, unit: 'g', category: 'Aromi', phase: 'topping', postBake: true });
                }

                mainIngredientNames = [freshCheese.name, freshMeat.name, freshVeg.name];
                description = `Freschezza assoluta con ${freshCheese.name.toLowerCase()} e ${freshMeat.name.toLowerCase()} aggiunti a crudo.`;
                break;

            case 'piccante_decisa':
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

                mainIngredientNames = [spicy.name, vegetable.name, finish.name];
                description = `Il carattere deciso della ${spicy.name.toLowerCase()} bilanciato dalla dolcezza di ${finish.name.toLowerCase()}.`;
                break;

            case 'mare':
                doughType = DOUGH_TYPES.find(d => d.type === 'Alta Idratazione') || DOUGH_TYPES[0];
                const seafood = selectRandomIngredients(INGREDIENTS_DB.premium.filter(p => ['Gamberi rossi', 'Scampi', 'Polpo', 'Vongole', 'Capesante', 'Tonno fresco'].includes(p.name)), 1)[0];
                const seaVeg = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => ['Zucchine', 'Pomodorini ciliegino', 'Rucola', 'Asparagi'].includes(v.name)), 1)[0];
                const citrus = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => f.name === 'Limone grattugiato'), 1)[0];
                const herb = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => ['Prezzemolo', 'Aneto', 'Basilico fresco'].includes(f.name)), 1)[0];

                if (Math.random() > 0.5) {
                    ingredients.push({ name: 'Pomodorini datterini', quantity: 100, unit: 'g', category: 'Verdure', phase: 'topping', postBake: false });
                }
                ingredients.push({ name: 'Fior di latte', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });
                ingredients.push({ ...seafood, quantity: 100, category: 'Pesce', phase: 'topping', postBake: false });
                ingredients.push({ ...seaVeg, quantity: 80, category: 'Verdure', phase: 'topping', postBake: false });
                if (citrus) ingredients.push({ ...citrus, quantity: 5, category: 'Aromi', phase: 'topping', postBake: true });
                if (herb) ingredients.push({ ...herb, quantity: 10, category: 'Erbe', phase: 'topping', postBake: true });

                mainIngredientNames = [seafood.name, seaVeg.name];
                description = `I sapori del mare con ${seafood.name.toLowerCase()} e ${seaVeg.name.toLowerCase()}, esaltati da agrumi e erbe fresche.`;
                break;

            case 'vegana':
                doughType = DOUGH_TYPES.find(d => d.type === 'Integrale') || DOUGH_TYPES[0];
                const veganBase = selectRandomIngredients(INGREDIENTS_DB.bases.filter(b => ['Crema di ceci', 'Crema di melanzane', 'Crema di zucca', 'Pesto di rucola'].includes(b.name)), 1)[0];
                const veganVeg1 = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => ['Melanzane grigliate', 'Zucchine', 'Spinaci', 'Funghi champignon', 'Broccoli'].includes(v.name)), 1)[0];
                const veganVeg2 = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => ['Pomodorini ciliegino', 'Rucola', 'Radicchio', 'Olive taggiasche'].includes(v.name)), 1)[0];
                const seeds = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => ['Semi di sesamo', 'Pinoli', 'Noci'].includes(f.name)), 1)[0];

                if (veganBase) ingredients.push({ ...veganBase, quantity: 80, category: 'Base', phase: 'topping', postBake: false });
                ingredients.push({ ...veganVeg1, quantity: 100, category: 'Verdure', phase: 'topping', postBake: false });
                ingredients.push({ ...veganVeg2, quantity: 60, category: 'Verdure', phase: 'topping', postBake: true });
                if (seeds) ingredients.push({ ...seeds, quantity: 20, category: 'Semi', phase: 'topping', postBake: true });
                ingredients.push({ name: 'Basilico fresco', quantity: 10, unit: 'g', category: 'Erbe', phase: 'topping', postBake: true });

                mainIngredientNames = [veganVeg1.name, veganVeg2.name];
                description = `Una pizza completamente vegetale con ${veganVeg1.name.toLowerCase()} e ${veganVeg2.name.toLowerCase()}, ricca di sapori naturali.`;
                break;

            case 'fusion':
                doughType = DOUGH_TYPES.find(d => d.type === 'Contemporanea') || DOUGH_TYPES[0];
                const fusionCheese = selectRandomIngredients(INGREDIENTS_DB.cheeses.filter(c => ['Brie', 'Caprino fresco', 'Squacquerone', 'Crescenza'].includes(c.name)), 1)[0];
                const fusionMeat = selectRandomIngredients(INGREDIENTS_DB.meats.filter(m => ['Porchetta', 'Lardo di Colonnata', 'Finocchiona'].includes(m.name)), 1)[0];
                const fusionVeg = selectRandomIngredients(INGREDIENTS_DB.vegetables.filter(v => ['Barbabietole', 'Patate dolci', 'Cavolo nero'].includes(v.name)), 1)[0];
                const fusionFinish = selectRandomIngredients(INGREDIENTS_DB.finishes.filter(f => ['Miele di castagno', 'Aceto balsamico', 'Granella di mandorle'].includes(f.name)), 1)[0];

                ingredients.push({ ...fusionCheese, quantity: 100, category: 'Formaggi', phase: 'topping', postBake: false });
                ingredients.push({ ...fusionMeat, quantity: 70, category: 'Carne', phase: 'topping', postBake: true });
                ingredients.push({ ...fusionVeg, quantity: 80, category: 'Verdure', phase: 'topping', postBake: false });
                if (fusionFinish) ingredients.push({ ...fusionFinish, quantity: 20, category: 'Finish', phase: 'topping', postBake: true });

                mainIngredientNames = [fusionCheese.name, fusionMeat.name, fusionVeg.name];
                description = `Un'interpretazione contemporanea con ${fusionCheese.name.toLowerCase()}, ${fusionMeat.name.toLowerCase()} e ${fusionVeg.name.toLowerCase()}.`;
                break;
        }
    }

    // Select suggested dough type (no longer generating dough ingredients)
    if (!doughType) doughType = DOUGH_TYPES[Math.floor(Math.random() * DOUGH_TYPES.length)];
    const suggestedDough = doughType.type;

    ingredients = ingredients.map(ing => ({
        ...ing,
        quantity: Math.round(ing.quantity),
        unit: ing.unit || (['Olio', 'Aceto', 'Riduzione'].some(x => ing.name.includes(x)) ? 'ml' : 'g')
    }));

    if (!pizzaName) pizzaName = await generatePizzaName(mainIngredientNames, existingNames);

    const pizzaiolo = FAMOUS_PIZZAIOLOS[Math.floor(Math.random() * FAMOUS_PIZZAIOLOS.length)];

    // Generate only topping instructions (dough instructions are in DOUGH_RECIPES)
    const instructions = {
        topping: [
            ...generateCookingInstructions(ingredients),
            `Infornare a ${Math.floor(400 + Math.random() * 80)}°C per ${Math.floor(90 + Math.random() * 90)} secondi`,
            `Servire immediatamente ben calda`
        ]
    };

    const tags = determineTags(ingredients, doughType);

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
        suggestedDough,
        tags
    };
}
