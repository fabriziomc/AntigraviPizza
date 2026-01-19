// ============================================
// RECIPE GENERATOR - Intelligent Pizza Recipe Creator
// ============================================

import { FAMOUS_PIZZAIOLOS, FLAVOR_COMBINATIONS, DOUGH_TYPES, DOUGH_RECIPES, PREPARATIONS } from '../utils/constants.js';
import { getAllIngredients, getArchetypeWeights } from './database.js';

// Cache for ingredients loaded from database
let INGREDIENTS_CACHE = null;

// Cache for archetype weights
let ARCHETYPE_WEIGHTS_CACHE = null;

// Configuration for generation rules
const MAX_TOTAL_INGREDIENTS = 5;

/**
 * Load ingredients from database and organize by category
 */
async function loadIngredientsFromDB() {
    // Return cached ingredients if available
    if (INGREDIENTS_CACHE) {
        return INGREDIENTS_CACHE;
    }

    try {
        const allIngredients = await getAllIngredients();

        // Organize ingredients by category for easy access
        // Using NEW category names from hierarchical structure
        const organized = {
            bases: allIngredients.filter(i => i.category === 'Basi e Salse'),
            cheeses: allIngredients.filter(i => i.category === 'Formaggi'),
            meats: allIngredients.filter(i => i.category === 'Carni e Salumi'),
            vegetables: allIngredients.filter(i => i.category === 'Verdure e Ortaggi'),
            premium: allIngredients.filter(i => i.category === 'Pesce e Frutti di Mare' || i.tags?.includes('premium')),
            finishes: allIngredients.filter(i => i.category === 'Erbe e Spezie' || i.category === 'Frutta e Frutta Secca')
        };

        // Cache the result
        INGREDIENTS_CACHE = organized;
        return organized;
    } catch (error) {
        console.error('Error loading ingredients from DB:', error);
        // Return empty structure as fallback
        return {
            bases: [],
            cheeses: [],
            meats: [],
            vegetables: [],
            premium: [],
            finishes: []
        };
    }
}

/**
 * Load archetype weights from database
 */
async function loadArchetypeWeights() {
    if (ARCHETYPE_WEIGHTS_CACHE) {
        return ARCHETYPE_WEIGHTS_CACHE;
    }

    try {
        const weights = await getArchetypeWeights('default');

        // Convert to object
        const weightsObj = {};
        weights.forEach(w => {
            weightsObj[w.archetype] = w.weight;
        });

        ARCHETYPE_WEIGHTS_CACHE = weightsObj;
        return weightsObj;
    } catch (error) {
        console.error('Error loading archetype weights:', error);
        // Fallback to defaults
        return {
            'combinazioni_db': 30,
            'classica': 28,
            'tradizionale': 21,
            'terra_bosco': 7,
            'fresca_estiva': 7,
            'piccante_decisa': 4,
            'mare': 2,
            'vegana': 1
        };
    }
}

/**
 * Select archetype based on weights
 */
function selectWeightedArchetype(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    for (const [archetype, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            return archetype;
        }
    }

    return 'classica'; // fallback
}

// DEPRECATED: Old hardcoded database - kept for reference only
// Will be replaced by loadIngredientsFromDB()
const INGREDIENTS_DB = {
    // Basi e impasti
    bases: [
        { name: 'Pomodoro San Marzano', category: 'Basi e Salse', phase: 'topping', postBake: false },
        { name: 'Pomodorini datterini', category: 'Basi e Salse', phase: 'topping', postBake: false },
        { name: 'Passata di pomodoro', category: 'Basi e Salse', phase: 'topping', postBake: false },
        { name: 'Crema di zucca', category: 'Basi e Salse', phase: 'topping', postBake: false },
        { name: 'Pesto di basilico', category: 'Basi e Salse', phase: 'topping', postBake: true },
        { name: 'Crema di pistacchio', category: 'Basi e Salse', phase: 'topping', postBake: true },
        { name: 'Crema di burrata', category: 'Basi e Salse', phase: 'topping', postBake: true },
        { name: 'Olio EVO aromatizzato', category: 'Altro', phase: 'topping', postBake: true },
        // Nuove basi e salse
        { name: 'Crema di ceci', category: 'Basi e Salse', phase: 'topping', postBake: false },
        { name: 'Crema di melanzane', category: 'Basi e Salse', phase: 'topping', postBake: false },
        { name: 'Salsa verde', category: 'Basi e Salse', phase: 'topping', postBake: true },
        { name: 'Crema di noci', category: 'Basi e Salse', phase: 'topping', postBake: true },
        { name: 'Crema di peperoni', category: 'Basi e Salse', phase: 'topping', postBake: false },
        { name: 'Pesto di rucola', category: 'Basi e Salse', phase: 'topping', postBake: true },
        { name: 'Pesto rosso', category: 'Basi e Salse', phase: 'topping', postBake: true },
        { name: 'Salsa al pesto di olive', category: 'Basi e Salse', phase: 'topping', postBake: true }
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
 * Estrae un "nome breve" intelligente da un ingrediente, preservando i nomi composti
 * @param {string} fullName - Nome completo dell'ingrediente
 * @returns {string} Nome breve ottimizzato per i titoli
 */
function getSmartShortName(fullName) {
    if (!fullName || fullName === 'Speciale') return fullName;

    // Normalizzazione
    let name = fullName.trim();

    // Lista di termini di "rumore" o descrittori comuni da rimuovere se non sono l'unica parola
    const noiseWords = [
        'Fresco', 'Fresca', 'San Marzano', 'di Cetara', 'di bufala',
        'del Cilento', 'DOP', 'IGP', 'Bio', 'Biologico', 'Selezionato',
        'di Parma', 'di Norcia', 'Affumicato', 'Affumicata', 'Naturale'
    ];

    // Rimuovi noise words (case insensitive)
    noiseWords.forEach(word => {
        const regex = new RegExp(`\\s+${word}`, 'gi');
        name = name.replace(regex, '');
    });

    // Se contiene preposizioni di giunzione, manteniamo il composto (es. Crema di ceci)
    const compoundConnectors = [' di ', ' al ', ' alla ', ' alle ', ' con ', ' e '];
    const hasConnector = compoundConnectors.some(conn => name.toLowerCase().includes(conn));

    if (hasConnector) {
        // Se è un composto, limitiamo a 3 parole per evitare nomi chilometrici
        const words = name.split(' ');
        if (words.length > 3) {
            // Filtra per trovare dove finisce il composto principale
            return words.slice(0, 3).join(' ');
        }
        return name;
    }

    // Altrimenti prendi la prima parola (vecchio comportamento migliorato)
    return name.split(' ')[0];
}

/**
 * Genera un nome creativo e unico per la pizza basato sugli ingredienti
 */
async function generatePizzaName(mainIngredients, existingNames = []) {
    const ing1 = mainIngredients[0] || 'Speciale';
    const ing2 = mainIngredients[1] || '';
    const ing3 = mainIngredients[2] || '';

    // Estrai nomi brevi intelligenti
    const short1 = getSmartShortName(ing1);
    const short2 = getSmartShortName(ing2);
    const short3 = getSmartShortName(ing3);

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
 * Seleziona ingredienti casuali da una categoria in modo sicuro
 */
function selectRandomIngredients(category, count = 1) {
    if (!category || category.length === 0) return [];
    const shuffled = [...category].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).filter(Boolean);
}

/**
 * Seleziona ingredienti con fallback se la ricerca per tag fallisce
 */
/**
 * Seleziona ingredienti con fallback opzionale
 * @param {string[]} tags - Tag richiesti
 * @param {string} categoryName - Categoria di fallback
 * @param {Object} INGREDIENTS_DB - DB ingredienti
 * @param {number} count - Numero di ingredienti
 * @param {boolean} strict - Se true, non usa fallbacks se i tag non matchano
 * @param {string[]} excludeNames - Nomi di ingredienti da escludere
 * @returns {Array} Ingredienti selezionati
 */
function selectIngredientWithFallback(tags, categoryName, INGREDIENTS_DB, count = 1, strict = false, excludeNames = []) {
    // Normalize excludeNames for better matching
    const normalizedExcludes = excludeNames.map(name => name.toLowerCase().trim());

    // 1. Prova con i tag
    let results = getAllIngredientsByTags(tags, INGREDIENTS_DB);

    // Filtra per nomi da escludere
    if (normalizedExcludes.length > 0) {
        results = results.filter(ing => !normalizedExcludes.includes(ing.name.toLowerCase().trim()));
    }

    // 2. Se non ci sono risultati e non siamo in strict mode, fallback alla categoria
    if (results.length === 0 && !strict) {
        console.warn(`Fallback: nessun ingrediente trovato per i tag [${tags.join(', ')}]. Uso categoria: ${categoryName}`);
        const categoryMap = {
            'Basi e Salse': INGREDIENTS_DB.bases,
            'Formaggi': INGREDIENTS_DB.cheeses,
            'Carni e Salumi': INGREDIENTS_DB.meats,
            'Verdure e Ortaggi': INGREDIENTS_DB.vegetables,
            'Pesce e Frutti di Mare': INGREDIENTS_DB.premium,
            'Erbe e Spezie': INGREDIENTS_DB.finishes,
            'Altro': INGREDIENTS_DB.premium,
            'Frutta e Frutta Secca': INGREDIENTS_DB.finishes
        };
        let fallbackResults = categoryMap[categoryName] || [];

        // Filtra anche il fallback
        if (normalizedExcludes.length > 0) {
            fallbackResults = fallbackResults.filter(ing => !normalizedExcludes.includes(ing.name.toLowerCase().trim()));
        }
        results = fallbackResults;
    }

    const selected = selectRandomIngredients(results, count);

    // 3. Fallback estremo solo se NON siamo in strict mode
    if (selected.length === 0 && !strict) {
        let allIngredients = [
            ...INGREDIENTS_DB.bases,
            ...INGREDIENTS_DB.cheeses,
            ...INGREDIENTS_DB.meats,
            ...INGREDIENTS_DB.vegetables,
            ...INGREDIENTS_DB.premium,
            ...INGREDIENTS_DB.finishes
        ];

        // Filtra anche l'estremo fallback
        if (normalizedExcludes.length > 0) {
            allIngredients = allIngredients.filter(ing => !normalizedExcludes.includes(ing.name.toLowerCase().trim()));
        }

        return selectRandomIngredients(allIngredients, count);
    }

    return selected;
}

/**
 * Seleziona ingredienti o preparazioni in base ai tag
 * @param {string[]} tags - Array di tag da cercare
 * @param {Object} INGREDIENTS_DB - Database ingredienti organizzato per categoria
 * @param {boolean} matchAll - Se true, richiede TUTTI i tag. Se false, almeno uno.
 * @returns {Array} Ingredienti/preparazioni che matchano i tag
 */
function getAllIngredientsByTags(tags, INGREDIENTS_DB, matchAll = false) {
    // Combina tutti gli ingredienti da tutte le categorie
    const allItems = [
        ...(INGREDIENTS_DB.bases || []),
        ...(INGREDIENTS_DB.cheeses || []),
        ...(INGREDIENTS_DB.meats || []),
        ...(INGREDIENTS_DB.vegetables || []),
        ...(INGREDIENTS_DB.premium || []),
        ...(INGREDIENTS_DB.finishes || [])
    ];

    return allItems.filter(item => {
        // Skip se non ha tag (backward compatibility)
        if (!item.tags || item.tags.length === 0) {
            return false;
        }

        // Converti tags a array se è una stringa JSON
        const itemTags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;

        if (matchAll) {
            // Richiede TUTTI i tag
            return tags.every(tag => itemTags.includes(tag));
        } else {
            // Richiede ALMENO UN tag
            return tags.some(tag => itemTags.includes(tag));
        }
    });
}

/**
 * Seleziona preparazioni in base ai tag
 * @param {string[]} tags - Array di tag da cercare
 * @param {Array} preparations - Array di tutte le preparazioni
 * @param {boolean} matchAll - Se true, richiede TUTTI i tag. Se false, almeno uno.
 * @returns {Array} Preparazioni che matchano i tag
 */
function getPreparationsByTags(tags, preparations, matchAll = false) {
    return preparations.filter(prep => {
        if (!prep.tags || prep.tags.length === 0) {
            return false;
        }

        const prepTags = typeof prep.tags === 'string' ? JSON.parse(prep.tags) : prep.tags;

        if (matchAll) {
            return tags.every(tag => prepTags.includes(tag));
        } else {
            return tags.some(tag => prepTags.includes(tag));
        }
    });
}



/**
 * Genera una ricetta casuale intelligente basata su archetipi
 */
export async function generateRandomRecipe_legacy() {
    return await generateRandomRecipe([]);
}

function findIngredientByName(name, INGREDIENTS_DB) {
    const allIngredients = [
        ...(INGREDIENTS_DB.cheeses || []),
        ...(INGREDIENTS_DB.meats || []),
        ...(INGREDIENTS_DB.vegetables || []),
        ...(INGREDIENTS_DB.premium || []),
        ...(INGREDIENTS_DB.finishes || []),
        ...(INGREDIENTS_DB.bases || [])
    ];

    const found = allIngredients.find(ing => ing.name === name);
    if (found) {
        return {
            ...found,
            quantity: found.minWeight && found.maxWeight
                ? Math.round(found.minWeight + Math.random() * (found.maxWeight - found.minWeight))
                : 50,
            unit: found.defaultUnit || 'g',
            phase: found.phase || 'topping'
        };
    }
    return null;
}

/**
 * Trova un ingrediente per ID nel database locale
 */
function findIngredientById(id, INGREDIENTS_DB) {
    const allIngredients = [
        ...(INGREDIENTS_DB.cheeses || []),
        ...(INGREDIENTS_DB.meats || []),
        ...(INGREDIENTS_DB.vegetables || []),
        ...(INGREDIENTS_DB.premium || []),
        ...(INGREDIENTS_DB.finishes || []),
        ...(INGREDIENTS_DB.bases || [])
    ];

    const found = allIngredients.find(ing => ing.id === id);
    if (found) {
        return {
            ...found,
            quantity: found.minWeight && found.maxWeight
                ? Math.round(found.minWeight + Math.random() * (found.maxWeight - found.minWeight))
                : 50,
            unit: found.defaultUnit || 'g',
            phase: found.phase || 'topping'
        };
    }
    return null;
}

/**
 * Categorizza un ingrediente
 */
function categorizeIngredient(name, INGREDIENTS_DB) {
    if (INGREDIENTS_DB.cheeses.some(c => c.name === name)) return 'Formaggi';
    if (INGREDIENTS_DB.meats.some(m => m.name === name)) return 'Carni e Salumi';
    if (INGREDIENTS_DB.vegetables.some(v => v.name === name)) return 'Verdure e Ortaggi';
    if (INGREDIENTS_DB.premium.some(p => p.name === name)) return 'Altro';
    return 'Frutta e Frutta Secca';
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

    const cookableToppings = ingredients.filter(i =>
        i.category !== 'Formaggi' &&
        i.category !== 'Latticini' &&
        i.category !== 'Salsa' &&
        i.category !== 'Basi e Salse' &&
        !i.postBake
    );
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
function determineTags(ingredients, doughType, archetypeUsed = null) {
    const tags = [];

    // Tag basato sul tipo di impasto
    if (doughType.type.includes('Napoletana')) tags.push('Napoletana');
    if (doughType.type.includes('Romana')) tags.push('Romana');
    if (doughType.type.includes('Contemporanea')) tags.push('Contemporanea');

    // Tag basato sugli ingredienti
    const hasMeat = ingredients.some(i => i.category === 'Carne' || i.category === 'Carni e Salumi');
    const hasDairy = ingredients.some(i => i.category === 'Formaggi' || i.category === 'Latticini');
    const hasPremium = ingredients.some(i => ['Tartufo', 'Salmone', 'Caviale', 'Foie gras'].some(p => i.name.includes(p)));
    const hasBase = ingredients.some(i =>
        (i.category === 'Salsa' || i.category === 'Basi e Salse') &&
        (i.name.includes('Pomodoro') || i.name.includes('pomodoro'))
    );

    // Tag dieta: Vegana vs Vegetariana
    if (!hasMeat && !hasDairy) {
        tags.push('Vegana');
    } else if (!hasMeat) {
        tags.push('Vegetariana');
    }

    // Sincronizza tag con archetipo (precauzione per consistency)
    if (archetypeUsed === 'vegana' && !tags.includes('Vegana')) {
        tags.push('Vegana');
        // Rimuovi Vegetariana se presente, dato che Vegana è più specifico
        const vegIndex = tags.indexOf('Vegetariana');
        if (vegIndex > -1) tags.splice(vegIndex, 1);
    }

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
 * Seleziona preparazioni intelligenti dal database basate sugli ingredienti e tipo pizza
 * Rimuove gli ingredienti base quando viene aggiunta la preparazione corrispondente
 * @returns {Object} { preparations: Array, cleanedIngredients: Array }
 */
async function selectPreparationsForPizza(ingredients, tags) {
    // Carica tutte le preparazioni dal database
    const { getAllPreparations } = await import('./database.js');
    const allPreparations = await getAllPreparations();

    if (!allPreparations || allPreparations.length === 0) {
        return { preparations: [], cleanedIngredients: ingredients };
    }

    const preparations = [];
    let cleanedIngredients = [...ingredients]; // Copia per non modificare l'originale

    const hasTomato = ingredients.some(i => i.name.toLowerCase().includes('pomodoro'));
    const hasMeat = ingredients.some(i => i.category === 'Carne');
    const hasVegetables = ingredients.some(i => i.category === 'Verdure');
    const isPremium = tags.includes('Premium') || tags.includes('Gourmet');
    const isVegetarian = tags.includes('Vegetariana');

    // Estrai nomi ingredienti per matching
    const ingredientNames = ingredients.map(i => i.name.toLowerCase());

    // Helper function per rimuovere ingrediente base quando si aggiunge preparazione
    const addPreparationAndRemoveBase = (prep, quantity, timing, baseIngredientKeyword) => {
        preparations.push({
            id: prep.id,
            quantity,
            unit: 'g',
            timing
        });
        // Rimuovi l'ingrediente base che contiene la keyword
        cleanedIngredients = cleanedIngredients.filter(ing =>
            !ing.name.toLowerCase().includes(baseIngredientKeyword)
        );
    };

    // STRATEGIA 1: Matching per ingredienti specifici (priorità alta)
    const ingredientMatches = [];

    // Funghi -> Funghi trifolati (rimuove funghi base)
    if (ingredientNames.some(n => n.includes('funghi'))) {
        const prep = allPreparations.find(p => p.id === 'funghi-trifolati');
        if (prep && Math.random() > 0.4) {
            addPreparationAndRemoveBase(
                prep,
                Math.floor(60 + Math.random() * 40),
                'before',
                'funghi'
            );
        }
    }

    // Patate -> Crema di patate (rimuove patate base)
    if (ingredientNames.some(n => n.includes('patate') || n.includes('patata'))) {
        const options = allPreparations.filter(p =>
            p.id.includes('patate') && p.category === 'Creme'
        );
        if (options.length > 0 && Math.random() > 0.5) {
            const selected = options[Math.floor(Math.random() * options.length)];
            addPreparationAndRemoveBase(
                selected,
                Math.floor(80 + Math.random() * 40),
                'before',
                'patate'
            );
        }
    }

    // Nduja/Piccante -> Salsa nduja (rimuove nduja base)
    if (ingredientNames.some(n => n.includes('nduja') || n.includes('piccante'))) {
        const prep = allPreparations.find(p => p.id === 'salsa-nduja');
        if (prep && Math.random() > 0.6) {
            addPreparationAndRemoveBase(
                prep,
                Math.floor(40 + Math.random() * 30),
                'before',
                'nduja'
            );
        }
    }

    // STRATEGIA 2: Matching per stile pizza (se non abbiamo già troppe preparazioni e non superiamo il limite totale)
    if (preparations.length < 2 && (preparations.length + cleanedIngredients.length < MAX_TOTAL_INGREDIENTS)) {
        // Pizza Bianca -> Creme
        if (!hasTomato && Math.random() > 0.4) {
            const creamOptions = allPreparations.filter(p =>
                p.category === 'Creme' &&
                !preparations.some(prep => prep.id === p.id) // Evita duplicati
            );

            if (creamOptions.length > 0) {
                const selected = creamOptions[Math.floor(Math.random() * creamOptions.length)];
                preparations.push({
                    id: selected.id,
                    quantity: Math.floor(80 + Math.random() * 40), // 80-120g
                    unit: 'g',
                    timing: 'before'
                });
            }
        }

        // Pizza con Carne -> Salse saporite
        if (hasMeat && Math.random() > 0.5) {
            const sauceOptions = allPreparations.filter(p =>
                (p.category === 'Salse' || p.category === 'Condimenti') &&
                !p.name.toLowerCase().includes('pesto') && // Escludi pesti per carne
                !preparations.some(prep => prep.id === p.id)
            );

            if (sauceOptions.length > 0) {
                const selected = sauceOptions[Math.floor(Math.random() * sauceOptions.length)];
                preparations.push({
                    id: selected.id,
                    quantity: Math.floor(50 + Math.random() * 30), // 50-80g
                    unit: 'g',
                    timing: Math.random() > 0.5 ? 'before' : 'after'
                });
            }
        }

        // Pizza Vegetariana -> Pesti e creme vegetali
        if (isVegetarian && hasVegetables && Math.random() > 0.5) {
            const pestoOptions = allPreparations.filter(p =>
                (p.name.toLowerCase().includes('pesto') ||
                    (p.category === 'Creme' && !p.name.toLowerCase().includes('carne'))) &&
                !preparations.some(prep => prep.id === p.id)
            );

            if (pestoOptions.length > 0) {
                const selected = pestoOptions[Math.floor(Math.random() * pestoOptions.length)];
                preparations.push({
                    id: selected.id,
                    quantity: Math.floor(40 + Math.random() * 30), // 40-70g
                    unit: 'g',
                    timing: 'after' // Pesti meglio a crudo
                });
            }
        }

        // Pizza Premium/Gourmet -> Preparazioni raffinate
        if (isPremium && Math.random() > 0.5) {
            const premiumOptions = allPreparations.filter(p =>
                (p.name.toLowerCase().includes('tartufo') ||
                    p.name.toLowerCase().includes('pistacchio') ||
                    p.name.toLowerCase().includes('balsamico') ||
                    p.name.toLowerCase().includes('gorgonzola')) &&
                !preparations.some(prep => prep.id === p.id)
            );

            if (premiumOptions.length > 0) {
                const selected = premiumOptions[Math.floor(Math.random() * premiumOptions.length)];
                preparations.push({
                    id: selected.id,
                    quantity: Math.floor(30 + Math.random() * 30), // 30-60g
                    unit: 'g',
                    timing: 'after'
                });
            }
        }
    }

    // STRATEGIA 3: Matching per categoria verdure specifiche (se non superiamo il limite totale)
    if (preparations.length < 2 && (preparations.length + cleanedIngredients.length < MAX_TOTAL_INGREDIENTS)) {
        // Melanzane -> Melanzane grigliate (rimuove melanzane base)
        if (ingredientNames.some(n => n.includes('melanzane'))) {
            const prep = allPreparations.find(p => p.id === 'melanzane-grigliate' || p.id === 'prep-melanzane-grigliate');
            if (prep && Math.random() > 0.6) {
                addPreparationAndRemoveBase(
                    prep,
                    Math.floor(60 + Math.random() * 40),
                    'before',
                    'melanzane'
                );
            }
        }

        // Cipolla -> Cipolla caramellata (rimuove cipolla base)
        if (ingredientNames.some(n => n.includes('cipolla'))) {
            const prep = allPreparations.find(p => p.id === 'cipolla-caramellata' || p.id === 'prep-cipolla-caramellata');
            if (prep && Math.random() > 0.6) {
                addPreparationAndRemoveBase(
                    prep,
                    Math.floor(50 + Math.random() * 30),
                    'before',
                    'cipolla'
                );
            }
        }

        // Pomodorini -> Pomodori confit (rimuove pomodorini base)
        if (ingredientNames.some(n => n.includes('pomodorini'))) {
            const prep = allPreparations.find(p => p.id === 'pomodori-confit' || p.id === 'prep-pomodorini-confit');
            if (prep && Math.random() > 0.7) {
                addPreparationAndRemoveBase(
                    prep,
                    Math.floor(60 + Math.random() * 40),
                    'before',
                    'pomodorini'
                );
            }
        }
    }

    // Limita a massimo 2 preparazioni per pizza
    return {
        preparations: preparations.slice(0, 2),
        cleanedIngredients
    };
}

/**
 * Genera multiple ricette casuali con nomi garantiti unici
 */
export async function generateMultipleRecipes(count = 3, suggestedIngredients = []) {
    const recipes = [];
    const generatedNames = []; // Track names generated in this batch

    for (let i = 0; i < count; i++) {
        // Pass previously generated names to avoid duplicates in this batch
        const recipe = await generateRandomRecipe(generatedNames, suggestedIngredients);
        recipes.push(recipe);
        generatedNames.push(recipe.name);
    }

    return recipes;
}

/**
 * Genera una ricetta casuale (usata pubblicamente)
 */
export async function generateRandomRecipe(additionalNames = [], suggestedIngredients = []) {
    // Load ingredients from database
    const INGREDIENTS_DB = await loadIngredientsFromDB();

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

    // Load archetype weights for selection
    const archetypeWeights = await loadArchetypeWeights();

    // Select generation method based on weighted archetype
    const selectedArchetype = selectWeightedArchetype(archetypeWeights);

    return await generateRecipe(selectedArchetype, combinations, INGREDIENTS_DB, existingNames, suggestedIngredients);
}

/**
 * Helper per aggiungere un ingrediente alla lista assicurando l'unicità
 * @param {Array} list - La lista di ingredienti esistenti
 * @param {Array} namesList - La lista di nomi principali per il titolo
 * @param {Object} ingredient - L'ingrediente da aggiungere
 * @param {Object} options - Opzioni aggiuntive (quantity, phase, postBake, category)
 * @returns {boolean} true se aggiunto, false se già presente
 */
function addIngredientUniquely(list, namesList, ingredient, options = {}) {
    if (!ingredient) return false;

    const normalizedName = ingredient.name.toLowerCase().trim();

    // Controlla se è già presente per ID o Nome (case-insensitive)
    const isDuplicate = list.some(item =>
        (item.id && ingredient.id && item.id === ingredient.id) ||
        (item.name && item.name.toLowerCase().trim() === normalizedName)
    );

    if (isDuplicate) return false;

    // Prepara l'oggetto finale
    const entry = {
        ...ingredient,
        quantity: options.quantity !== undefined ? options.quantity : (ingredient.quantity || 50),
        unit: options.unit || ingredient.unit || 'g',
        phase: options.phase || ingredient.phase || 'topping',
        postBake: options.postBake !== undefined ? options.postBake : (ingredient.postBake || false)
    };

    if (options.category) entry.category = options.category;

    list.push(entry);

    // Aggiungi ai nomi principali se non presente
    if (namesList && namesList.includes && !namesList.some(name => name.toLowerCase().trim() === normalizedName)) {
        namesList.push(ingredient.name);
    }

    return true;
}

/**
 * Check if ingredients array already contains an ingredient from a specific category or with specific tags
 * Used to avoid adding redundant ingredients when user provides forced/suggested ingredients
 */
function checkIfCategoryAlreadyCovered(ingredientsList, category = null, tags = []) {
    if (!ingredientsList || ingredientsList.length === 0) return false;

    // Check by category
    if (category) {
        const hasCategoryMatch = ingredientsList.some(ing =>
            ing.category && ing.category.toLowerCase() === category.toLowerCase()
        );
        if (hasCategoryMatch) return true;
    }

    // Check by tags
    if (tags && tags.length > 0) {
        return ingredientsList.some(ing => {
            if (!ing.tags || !Array.isArray(ing.tags)) return false;
            return tags.some(tag => ing.tags.includes(tag));
        });
    }

    return false;
}

/**
 * Funzione core di generazione (esportata per test e uso diretto)
 */
export async function generateRecipe(selectedArchetype, combinations = [], INGREDIENTS_DB = null, existingNames = [], suggestedIngredients = []) {
    // If no DB provided, load it
    if (!INGREDIENTS_DB) INGREDIENTS_DB = await loadIngredientsFromDB();

    const usePredefinedCombo = selectedArchetype === 'combinazioni_db';

    let ingredients = [];
    let mainIngredientNames = [];
    let missingSlots = [];
    let pizzaName = '';
    let description = '';
    let doughType = null;
    let recipeSource = null;
    let archetypeUsed = null;

    // PRE-INJECT Suggested Ingredients if any
    if (suggestedIngredients && suggestedIngredients.length > 0) {
        suggestedIngredients.forEach(suggestion => {
            // Can be ID or name
            const found = findIngredientById(suggestion, INGREDIENTS_DB) ||
                findIngredientByName(suggestion, INGREDIENTS_DB);

            if (found) {
                // Ensure we don't add the same ingredient twice
                addIngredientUniquely(ingredients, mainIngredientNames, found);
            }
        });
    }

    if (usePredefinedCombo && combinations.length > 0) {
        // Using predefined combination from database
        let combo;
        if (suggestedIngredients && suggestedIngredients.length > 0) {
            // Find combos that match suggestions
            const bestMatches = combinations.filter(c =>
                suggestedIngredients.some(si => c.includes(si))
            );

            if (bestMatches.length > 0) {
                // Pick one of the best matches
                combo = bestMatches[Math.floor(Math.random() * bestMatches.length)];
            } else {
                combo = combinations[Math.floor(Math.random() * combinations.length)];
            }
        } else {
            combo = combinations[Math.floor(Math.random() * combinations.length)];
        }

        // Add combo ingredients (avoiding duplicates from pre-injection)
        if (mainIngredientNames.length === 0) {
            mainIngredientNames = combo.slice(0, 2);
        }

        doughType = DOUGH_TYPES[Math.floor(Math.random() * DOUGH_TYPES.length)];
        pizzaName = await generatePizzaName(mainIngredientNames, existingNames);

        // Mark as combination-based
        recipeSource = 'combination';
        archetypeUsed = 'combinazioni_db';

    } else {
        // Using archetype-based generation
        const archetypeName = selectedArchetype;
        recipeSource = 'archetype';
        archetypeUsed = archetypeName;

        switch (selectedArchetype) {
            case 'dolce_salato':
                doughType = DOUGH_TYPES.find(d => d.type === 'Contemporanea') || DOUGH_TYPES[0];
                // Tag-based selection: formaggi sapidi, frutta dolce, frutta secca
                const cheeseArr = selectIngredientWithFallback(['cheese_blue', 'cheese_soft', 'cheese_aged'], 'Formaggi', INGREDIENTS_DB, 1, true, mainIngredientNames);
                const fruitArr = selectIngredientWithFallback(['fruit_sweet', 'finish_sweet'], 'Frutta e Frutta Secca', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(cheeseArr[0] ? [cheeseArr[0].name] : [])]);
                const crunchArr = selectIngredientWithFallback(['nut_creamy', 'nut_crunchy'], 'Frutta e Frutta Secca', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(cheeseArr[0] ? [cheeseArr[0].name] : []), ...(fruitArr[0] ? [fruitArr[0].name] : [])]);

                const cheese = cheeseArr[0];
                const fruit = fruitArr[0];
                const crunch = crunchArr[0];

                // Only add cheese if not already covered by forced ingredients
                if (!checkIfCategoryAlreadyCovered(ingredients, 'Formaggi', ['cheese_blue', 'cheese_soft', 'cheese_aged'])) {
                    if (cheese) {
                        addIngredientUniquely(ingredients, mainIngredientNames, cheese, { quantity: 80, category: 'Formaggi', phase: 'topping' });
                    } else missingSlots.push('Formaggio sapido');
                }

                // Fruit is usually needed for this archetype
                if (fruit) {
                    addIngredientUniquely(ingredients, mainIngredientNames, fruit, { quantity: 60, category: 'Frutta e Frutta Secca', phase: 'topping', postBake: fruit.name !== 'Pere' });
                } else missingSlots.push('Frutta dolce');

                if (crunch) {
                    addIngredientUniquely(ingredients, mainIngredientNames, crunch, { quantity: 30, category: 'Frutta e Frutta Secca', phase: 'topping', postBake: true });
                } else missingSlots.push('Elemento croccante');

                addIngredientUniquely(ingredients, null, { name: 'Fior di latte', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });
                break;

            case 'terra_bosco':
                doughType = DOUGH_TYPES.find(d => d.type === 'Integrale') || DOUGH_TYPES[0];
                // Tag-based selection: funghi, carni intense/cotte/grasse, tartufo
                const mushroomArr = selectIngredientWithFallback(['vegetable_mushrooms'], 'Verdure e Ortaggi', INGREDIENTS_DB, 1, true, mainIngredientNames);
                const meatArr = selectIngredientWithFallback(['meat_cured_intense', 'meat_cooked', 'meat_fatty'], 'Carni e Salumi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(mushroomArr[0] ? [mushroomArr[0].name] : [])]);
                const creamArr = selectIngredientWithFallback(['premium_truffle', 'base_cream_vegetable'], 'Basi e Salse', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(mushroomArr[0] ? [mushroomArr[0].name] : []), ...(meatArr[0] ? [meatArr[0].name] : [])]);

                const mushroom = mushroomArr[0];
                const meat = meatArr[0];
                const cream = creamArr[0];

                if (cream) {
                    addIngredientUniquely(ingredients, mainIngredientNames, cream, { quantity: (cream.category === 'Salsa' || cream.category === 'Basi e Salse') ? 80 : 15, category: 'Basi e Salse', phase: 'topping', postBake: cream.postBake });
                } else missingSlots.push('Crema/Tartufo');

                // Only add mushrooms if not already covered
                if (!checkIfCategoryAlreadyCovered(ingredients, 'Verdure e Ortaggi', ['vegetable_mushrooms'])) {
                    if (mushroom) {
                        addIngredientUniquely(ingredients, mainIngredientNames, mushroom, { quantity: 100, category: 'Verdure e Ortaggi', phase: 'topping', postBake: false });
                    } else missingSlots.push('Funghi');
                }

                // Only add meat if not already covered by forced ingredients  
                if (!checkIfCategoryAlreadyCovered(ingredients, 'Carni e Salumi', ['meat_cured_intense', 'meat_cooked', 'meat_fatty'])) {
                    if (meat) {
                        addIngredientUniquely(ingredients, mainIngredientNames, meat, { quantity: 80, category: 'Carni e Salumi', phase: 'topping', postBake: meat.postBake });
                    } else missingSlots.push('Carne intensa');
                }

                addIngredientUniquely(ingredients, null, { name: 'Provola affumicata', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });
                break;

            case 'fresca_estiva':
                doughType = DOUGH_TYPES.find(d => d.type === 'Alta Idratazione') || DOUGH_TYPES[0];
                // Tag-based selection: formaggi freschi, carni delicate, verdure a foglia
                const freshBaseArr = selectIngredientWithFallback(['vegetable_tomato_fresh', 'base_oil'], 'Basi e Salse', INGREDIENTS_DB, 1, true, mainIngredientNames);
                const freshCheeseArr = selectIngredientWithFallback(['cheese_fresh'], 'Formaggi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(freshBaseArr[0] ? [freshBaseArr[0].name] : [])]);
                const freshMeatArr = selectIngredientWithFallback(['meat_cured_delicate', 'seafood_preserved'], 'Carni e Salumi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(freshBaseArr[0] ? [freshBaseArr[0].name] : []), ...(freshCheeseArr[0] ? [freshCheeseArr[0].name] : [])]);
                const freshVegArr = selectIngredientWithFallback(['vegetable_leafy', 'vegetable_tomato_fresh'], 'Verdure e Ortaggi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(freshBaseArr[0] ? [freshBaseArr[0].name] : []), ...(freshCheeseArr[0] ? [freshCheeseArr[0].name] : []), ...(freshMeatArr[0] ? [freshMeatArr[0].name] : [])]);

                const freshBase = freshBaseArr[0];
                const freshCheese = freshCheeseArr[0];
                const freshMeat = freshMeatArr[0];
                const freshVeg = freshVegArr[0];

                if (freshBase) {
                    addIngredientUniquely(ingredients, mainIngredientNames, freshBase);
                } else missingSlots.push('Base fresca');

                if (freshCheese) {
                    addIngredientUniquely(ingredients, mainIngredientNames, freshCheese, { quantity: 120, category: 'Formaggi', phase: 'topping', postBake: true });
                } else missingSlots.push('Formaggio fresco');

                if (freshMeat) {
                    addIngredientUniquely(ingredients, mainIngredientNames, freshMeat, { quantity: 70, category: 'Carni e Salumi', phase: 'topping', postBake: true });
                } else missingSlots.push('Salume/Pesce');

                if (freshVeg) {
                    addIngredientUniquely(ingredients, mainIngredientNames, freshVeg, { quantity: 50, category: 'Verdure e Ortaggi', phase: 'topping', postBake: true });
                } else missingSlots.push('Verdura fresca');

                if (freshMeat?.name && (freshMeat.name.includes('Alici') || freshMeat.name.includes('Salmone'))) {
                    addIngredientUniquely(ingredients, null, { name: 'Limone grattugiato', quantity: 5, unit: 'g', category: 'Erbe e Spezie', phase: 'topping', postBake: true });
                }
                break;

            case 'piccante_decisa':
                doughType = DOUGH_TYPES.find(d => d.type === 'Napoletana Classica') || DOUGH_TYPES[0];
                addIngredientUniquely(ingredients, null, { name: 'Pomodoro San Marzano', quantity: 80, unit: 'g', category: 'Basi e Salse', phase: 'topping', postBake: false });
                addIngredientUniquely(ingredients, null, { name: 'Fior di latte', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });

                // Tag-based selection: carni piccanti, verdure + contrasto dolce
                const spicyArr = selectIngredientWithFallback(['meat_spicy'], 'Carni e Salumi', INGREDIENTS_DB, 1, true, mainIngredientNames);
                const vegetableArr = selectIngredientWithFallback(['vegetable_onions', 'finish_savory', 'vegetable_grilled'], 'Verdure e Ortaggi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(spicyArr[0] ? [spicyArr[0].name] : [])]);
                const finishArr = selectIngredientWithFallback(['finish_sweet', 'cheese_fresh'], 'Basi e Salse', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(spicyArr[0] ? [spicyArr[0].name] : []), ...(vegetableArr[0] ? [vegetableArr[0].name] : [])]);

                const spicy = spicyArr[0];
                const vegetable = vegetableArr[0];
                const finish = finishArr[0];

                if (spicy) {
                    addIngredientUniquely(ingredients, mainIngredientNames, spicy, { quantity: 60, category: 'Carni e Salumi', phase: 'topping', postBake: false });
                } else missingSlots.push('Salume piccante');

                if (vegetable) {
                    addIngredientUniquely(ingredients, mainIngredientNames, vegetable, { quantity: 50, category: 'Verdure e Ortaggi', phase: 'topping', postBake: false });
                } else missingSlots.push('Verdura');

                if (finish) {
                    addIngredientUniquely(ingredients, mainIngredientNames, finish);
                } else missingSlots.push('Tocco finale');
                break;

            case 'mare':
                doughType = DOUGH_TYPES.find(d => d.type === 'Alta Idratazione') || DOUGH_TYPES[0];
                // Tag-based selection: pesce, verdure marine, agrumi ed erbe
                const seafoodArr = selectIngredientWithFallback(['seafood_crustaceans', 'seafood_mollusks', 'seafood_fish'], 'Pesce e Frutti di Mare', INGREDIENTS_DB, 1, true, mainIngredientNames);
                const seaVegArr = selectIngredientWithFallback(['vegetable_grilled', 'vegetable_tomato_fresh', 'vegetable_leafy', 'vegetable_asparagus'], 'Verdure e Ortaggi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(seafoodArr[0] ? [seafoodArr[0].name] : [])]);
                const citrusArr = selectIngredientWithFallback(['herb_citrus'], 'Erbe e Spezie', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(seafoodArr[0] ? [seafoodArr[0].name] : []), ...(seaVegArr[0] ? [seaVegArr[0].name] : [])]);
                const herbArr = selectIngredientWithFallback(['herb_fresh_delicate', 'herb_citrus'], 'Erbe e Spezie', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(seafoodArr[0] ? [seafoodArr[0].name] : []), ...(seaVegArr[0] ? [seaVegArr[0].name] : []), ...(citrusArr[0] ? [citrusArr[0].name] : [])]);

                const seafood = seafoodArr[0];
                const seaVeg = seaVegArr[0];
                const citrus = citrusArr[0];
                const herb = herbArr[0];

                if (Math.random() > 0.5) {
                    addIngredientUniquely(ingredients, null, { name: 'Pomodorini datterini', quantity: 100, unit: 'g', category: 'Verdure e Ortaggi', phase: 'topping', postBake: false });
                }
                addIngredientUniquely(ingredients, null, { name: 'Fior di latte', quantity: 100, unit: 'g', category: 'Formaggi', phase: 'topping', postBake: false });

                if (seafood) {
                    addIngredientUniquely(ingredients, mainIngredientNames, seafood, { quantity: 100, category: 'Pesce e Frutti di Mare', phase: 'topping', postBake: false });
                } else missingSlots.push('Pesce/Crostacei');

                if (seaVeg) {
                    addIngredientUniquely(ingredients, mainIngredientNames, seaVeg, { quantity: 80, category: 'Verdure e Ortaggi', phase: 'topping', postBake: false });
                } else missingSlots.push('Vegana di mare');

                if (citrus) addIngredientUniquely(ingredients, null, citrus, { quantity: 5, category: 'Erbe e Spezie', phase: 'topping', postBake: true });
                if (herb) addIngredientUniquely(ingredients, null, herb, { quantity: 10, category: 'Erbe e Spezie', phase: 'topping', postBake: true });
                break;

            case 'vegana':
                doughType = DOUGH_TYPES.find(d => d.type === 'Integrale') || DOUGH_TYPES[0];
                // Tag-based selection: creme vegetali, verdure, frutta secca
                const veganBaseArr = selectIngredientWithFallback(['base_cream_vegetable', 'base_pesto'], 'Basi e Salse', INGREDIENTS_DB, 1, true, mainIngredientNames);
                const veganVeg1Arr = selectIngredientWithFallback(['vegetable_grilled', 'vegetable_leafy', 'vegetable_cruciferous', 'vegetable_mushrooms'], 'Verdure e Ortaggi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(veganBaseArr[0] ? [veganBaseArr[0].name] : [])]);
                const veganVeg2Arr = selectIngredientWithFallback(['vegetable_tomato_fresh', 'vegetable_leafy', 'vegetable_bitter', 'finish_savory'], 'Verdure e Ortaggi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(veganBaseArr[0] ? [veganBaseArr[0].name] : []), ...(veganVeg1Arr[0] ? [veganVeg1Arr[0].name] : [])]);
                const seedsArr = selectIngredientWithFallback(['nut_crunchy', 'nut_creamy'], 'Frutta e Frutta Secca', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(veganBaseArr[0] ? [veganBaseArr[0].name] : []), ...(veganVeg1Arr[0] ? [veganVeg1Arr[0].name] : []), ...(veganVeg2Arr[0] ? [veganVeg2Arr[0].name] : [])]);

                const veganBase = veganBaseArr[0];
                const veganVeg1 = veganVeg1Arr[0];
                const veganVeg2 = veganVeg2Arr[0];
                const seeds = seedsArr[0];

                if (veganBase) {
                    addIngredientUniquely(ingredients, mainIngredientNames, veganBase, { quantity: 80, category: 'Basi e Salse', phase: 'topping', postBake: false });
                } else missingSlots.push('Base vegetale');

                if (veganVeg1) {
                    addIngredientUniquely(ingredients, mainIngredientNames, veganVeg1, { quantity: 100, category: 'Verdure e Ortaggi', phase: 'topping', postBake: false });
                } else missingSlots.push('Verdura 1');

                if (veganVeg2) {
                    addIngredientUniquely(ingredients, mainIngredientNames, veganVeg2, { quantity: 60, category: 'Verdure e Ortaggi', phase: 'topping', postBake: true });
                } else missingSlots.push('Verdura 2');

                if (seeds) {
                    addIngredientUniquely(ingredients, mainIngredientNames, seeds, { quantity: 20, category: 'Frutta e Frutta Secca', phase: 'topping', postBake: true });
                } else missingSlots.push('Semi/Granella');

                addIngredientUniquely(ingredients, null, { name: 'Basilico fresco', quantity: 10, unit: 'g', category: 'Erbe e Spezie', phase: 'topping', postBake: true });
                break;

            case 'fusion':
            case 'classica':
            case 'tradizionale':
            default:
                doughType = DOUGH_TYPES.find(d => d.type === 'Contemporanea') || DOUGH_TYPES[0];
                // Tag-based selection: mix creativo di categorie per pizza fusion/contemporanea
                const fusionCheeseArr = selectIngredientWithFallback(['cheese_soft', 'cheese_creamy'], 'Formaggi', INGREDIENTS_DB, 1, true, mainIngredientNames);
                const fusionMeatArr = selectIngredientWithFallback(['meat_cured_delicate', 'meat_cured_intense', 'meat_mild_salumi'], 'Carni e Salumi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(fusionCheeseArr[0] ? [fusionCheeseArr[0].name] : [])]);
                const fusionVegArr = selectIngredientWithFallback(['vegetable_root', 'vegetable_cruciferous', 'vegetable_leafy'], 'Verdure e Ortaggi', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(fusionCheeseArr[0] ? [fusionCheeseArr[0].name] : []), ...(fusionMeatArr[0] ? [fusionMeatArr[0].name] : [])]);
                const fusionFinishArr = selectIngredientWithFallback(['finish_sweet', 'finish_tangy', 'nut_creamy'], 'Altro', INGREDIENTS_DB, 1, true, [...mainIngredientNames, ...(fusionCheeseArr[0] ? [fusionCheeseArr[0].name] : []), ...(fusionMeatArr[0] ? [fusionMeatArr[0].name] : []), ...(fusionVegArr[0] ? [fusionVegArr[0].name] : [])]);

                const fusionCheese = fusionCheeseArr[0];
                const fusionMeat = fusionMeatArr[0];
                const fusionVeg = fusionVegArr[0];
                const fusionFinish = fusionFinishArr[0];

                if (fusionCheese) {
                    addIngredientUniquely(ingredients, mainIngredientNames, fusionCheese, { quantity: 100, category: 'Formaggi', phase: 'topping', postBake: false });
                } else missingSlots.push('Formaggio fusion');

                if (fusionMeat) {
                    addIngredientUniquely(ingredients, mainIngredientNames, fusionMeat, { quantity: 70, category: 'Carni e Salumi', phase: 'topping', postBake: true });
                } else missingSlots.push('Salume fusion');

                if (fusionVeg) {
                    addIngredientUniquely(ingredients, mainIngredientNames, fusionVeg, { quantity: 80, category: 'Verdure e Ortaggi', phase: 'topping', postBake: false });
                } else missingSlots.push('Verdura fusion');

                if (fusionFinish) {
                    addIngredientUniquely(ingredients, mainIngredientNames, fusionFinish, { quantity: 20, category: 'Altro', phase: 'topping', postBake: true });
                } else missingSlots.push('Tocco fusion');
                break;
        }
    }

    // Select suggested dough type (no longer generating dough ingredients)
    if (!doughType) doughType = DOUGH_TYPES[Math.floor(Math.random() * DOUGH_TYPES.length)];
    const suggestedDough = doughType.type;

    // Check if pizza is incomplete (missing mandatory ingredients and NOT combinations-based)
    let isIncomplete = false;
    let missingInfo = '';

    if (!usePredefinedCombo) {
        if (missingSlots.length > 0) {
            isIncomplete = true;
            missingInfo = ` (Mancano: ${missingSlots.join(', ')})`;
            pizzaName = `Pizza Incompleta${missingInfo}`;
            description = `Questa ricetta non ha potuto essere generata completamente perché non sono stati trovati nel database ingredienti corrispondenti ai criteri richiesti: ${missingSlots.join(', ')}.`;
        }
    }

    ingredients = ingredients.map(ing => ({
        ...ing,
        quantity: Math.round(ing.quantity),
        unit: ing.unit || (['Olio', 'Aceto', 'Riduzione'].some(x => ing.name.includes(x)) ? 'ml' : 'g')
    }));

    if (!pizzaName) pizzaName = await generatePizzaName(mainIngredientNames, existingNames);

    const pizzaiolo = FAMOUS_PIZZAIOLOS[Math.floor(Math.random() * FAMOUS_PIZZAIOLOS.length)];

    const tags = determineTags(ingredients, doughType, archetypeUsed);

    // Se superiamo il limite totale di 5 ingredienti (base + preparazioni), riduciamo gli ingredienti base
    // prima di calcolare le preparazioni, per fare spazio.
    if (ingredients.length > MAX_TOTAL_INGREDIENTS) {
        console.log(`⚠️ Too many ingredients (${ingredients.length}). Truncating to ${MAX_TOTAL_INGREDIENTS}.`);
        ingredients = ingredients.slice(0, MAX_TOTAL_INGREDIENTS);
    }

    // Seleziona preparazioni intelligenti e rimuovi ingredienti base sostituiti
    const { preparations, cleanedIngredients } = await selectPreparationsForPizza(ingredients, tags);

    // Controllo finale di sicurezza: se la somma di ingredienti e preparazioni supera ancora il limite
    // (potrebbe succedere se selectPreparationsForPizza aggiunge qualcosa senza rimuovere)
    let finalIngredients = cleanedIngredients;
    let finalPreparations = preparations;

    if (finalIngredients.length + finalPreparations.length > MAX_TOTAL_INGREDIENTS) {
        const excess = (finalIngredients.length + finalPreparations.length) - MAX_TOTAL_INGREDIENTS;
        console.log(`⚠️ Final count still too high (${finalIngredients.length + finalPreparations.length}). Removing ${excess} base ingredients.`);
        // Rimuoviamo gli ultimi ingredienti base per far spazio alle preparazioni
        finalIngredients = finalIngredients.slice(0, finalIngredients.length - excess);
    }

    // Detect if pizza is white (no tomato) or red (with tomato)
    const hasTomato = ingredients.some(ing =>
        ing.name.toLowerCase().includes('pomodor') ||
        ing.name.toLowerCase().includes('salsa') ||
        ing.name.toLowerCase().includes('passata')
    );

    const pizzaStyle = hasTomato
        ? 'pizza with red tomato sauce base'
        : 'pizza bianca, white pizza with NO tomato sauce, white base with olive oil';

    // Use placeholder image immediately - images will be generated in background
    // This makes recipe generation instant instead of waiting 3-5 seconds per image
    const imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23333" width="800" height="600"/%3E%3Ctext fill="%23777" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E';

    // --- FINAL SAFETY DEDUPLICATION ---
    // Ensure baseIngredients and preparations are internally and mutually unique
    // Enhanced to check for ingredients that are part of preparations
    const seenNames = new Set();
    const seenIngredientIds = new Set();

    // 1. Process preparations first (they are usually more specific/important)
    const uniquePreparations = [];
    finalPreparations.forEach(prep => {
        const name = (prep.name || '').toLowerCase().trim();
        if (name && !seenNames.has(name)) {
            seenNames.add(name);
            uniquePreparations.push(prep);

            // Track ingredient IDs from this preparation to avoid duplicates
            if (prep.ingredients && Array.isArray(prep.ingredients)) {
                prep.ingredients.forEach(ing => {
                    if (ing.id) seenIngredientIds.add(ing.id);
                    // Also track by name for safety
                    if (ing.name) seenNames.add(ing.name.toLowerCase().trim());
                });
            }
        }
    });

    // 2. Process baseIngredients, removing duplicates and ingredients already in preparations
    const uniqueBaseIngredients = [];
    finalIngredients.forEach(ing => {
        const name = (ing.name || '').toLowerCase().trim();
        const id = ing.id;

        // Skip if name already seen OR if this ingredient ID is part of a preparation
        if (name && !seenNames.has(name) && !seenIngredientIds.has(id)) {
            seenNames.add(name);
            uniqueBaseIngredients.push(ing);
        }
    });

    // --- DESCRIPTION FINALIZATION ---
    // Generate description based on FINAL ingredients list after truncation and deduplication
    // FIX: Never use preparation IDs in descriptions - only include preparations with names
    const finalAllNames = [
        ...uniquePreparations.filter(p => p.name).map(p => p.name),
        ...uniqueBaseIngredients.filter(i => !['Fior di latte', 'Provola affumicata', 'Mozzarella', 'Pomodoro San Marzano'].includes(i.name)).map(i => i.name)
    ].slice(0, 3);

    if (usePredefinedCombo || !description || description.includes('Pizza Incompleta')) {
        // For predefined combos or incomplete, we already have a specialized logic or name
        if (!description || usePredefinedCombo) {
            description = `Una ${suggestedDough.toLowerCase()} con ${finalAllNames.join(' e ').toLowerCase()}, creata secondo la tradizione.`;
        }
    } else {
        // For archetypes, we regenerate the description to ensure only final ingredients are mentioned
        description = generateArchetypeDescription(archetypeUsed, uniqueBaseIngredients, uniquePreparations, suggestedDough);
    }

    // --- VALIDATION ---
    // Ensure recipe has at least some ingredients
    if (uniqueBaseIngredients.length === 0 && uniquePreparations.length === 0) {
        console.warn('⚠️ Generated recipe has no ingredients! Adding fallback base ingredient.');
        // Add a fallback base ingredient
        uniqueBaseIngredients.push({
            name: 'Fior di latte',
            quantity: 100,
            unit: 'g',
            category: 'Formaggi',
            phase: 'topping',
            postBake: false
        });
    }

    // --- INSTRUCTIONS GENERATION ---
    // Generate instructions based on FINAL ingredients after deduplication
    const instructions = {
        topping: [
            ...generateCookingInstructions(uniqueBaseIngredients),
            `Infornare a ${Math.floor(400 + Math.random() * 80)}°C per ${Math.floor(90 + Math.random() * 90)} secondi`,
            `Servire immediatamente ben calda`
        ]
    };

    return {
        name: pizzaName,
        pizzaiolo,
        source: 'Generata da AntigraviPizza',
        description,
        baseIngredients: uniqueBaseIngredients,
        preparations: uniquePreparations,
        instructions,
        imageUrl,
        imageGenerationPending: true,  // Flag to indicate image needs to be generated
        imageGenerationData: {  // Data needed for background image generation
            pizzaName,
            mainIngredientNames,
            hasTomato
        },
        suggestedDough,
        tags,
        recipeSource,
        archetypeUsed,
        isIncomplete
    };
}

/**
 * Genera una descrizione basata sull'archetipo e sugli ingredienti EFFETTIVI rimasti
 */
function generateArchetypeDescription(archetype, ingredients, preparations, doughType) {
    const all = [...preparations, ...ingredients];
    // FIX: Only include items with names (no IDs)
    const getNames = (count = 2) => all
        .filter(i => i.name && !['Fior di latte', 'Provola affumicata', 'Mozzarella', 'Pomodoro San Marzano'].includes(i.name))
        .map(i => i.name)
        .slice(0, count);

    const names = getNames(3);
    const ingredientsStr = names.length > 1
        ? names.slice(0, -1).join(', ') + ' e ' + names.slice(-1)
        : names[0] || 'ingredienti selezionati';

    switch (archetype) {
        case 'dolce_salato':
            return `Un perfetto equilibrio tra sapidità e dolcezza con ${ingredientsStr.toLowerCase()}, su base ${doughType.toLowerCase()}.`;
        case 'terra_bosco':
            return `I profumi del bosco e della terra con ${ingredientsStr.toLowerCase()}, su una base rustica di tipo ${doughType.toLowerCase()}.`;
        case 'fresca_estiva':
            return `Freschezza assoluta con ${ingredientsStr.toLowerCase()} aggiunti a crudo su una ${doughType.toLowerCase()}.`;
        case 'piccante_decisa':
            return `Il carattere deciso e piccante di ${ingredientsStr.toLowerCase()} bilanciato con cura.`;
        case 'mare':
            return `I sapori del mare con ${ingredientsStr.toLowerCase()}, esaltati da aromi freschi su base ${doughType.toLowerCase()}.`;
        case 'vegana':
            return `Una pizza completamente vegetale con ${ingredientsStr.toLowerCase()}, ricca di sapori naturali.`;
        case 'fusion':
        case 'classica':
        case 'tradizionale':
        default:
            return `Un'interpretazione contemporanea con ${ingredientsStr.toLowerCase()} su impasto ${doughType.toLowerCase()}.`;
    }
}
