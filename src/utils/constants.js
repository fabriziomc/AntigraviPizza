// ============================================
// CONSTANTS
// ============================================

export const APP_NAME = 'AntigraviPizza';
export const DB_NAME = 'AntigraviPizzaDB';
export const DB_VERSION = 3;

// Store names
export const STORES = {
    RECIPES: 'recipes',
    PIZZA_NIGHTS: 'pizzaNights',
    GUESTS: 'guests',
    COMBINATIONS: 'combinations',
    PREPARATIONS: 'preparations'
};

// Recipe categories/tags
export const RECIPE_TAGS = [
    'Classica',
    'Gourmet',
    'Napoletana',
    'Romana',
    'Vegetariana',
    'Vegana',
    'Bianca',
    'Rossa'
];

// Famous pizzaiolos
export const FAMOUS_PIZZAIOLOS = [
    'Gabriele Bonci',
    'Franco Pepe',
    'Simone Padoan',
    'Renato Bosco',
    'Enzo Coccia',
    'Tony Gemignani',
    'Chris Bianco',
    'Gino Sorbillo',
    'Pier Daniele Seu',
    'Vincenzo Capuano',
    'Francesco Martucci'
];

// Ingredient categories
export const INGREDIENT_CATEGORIES = {
    DOUGH: 'Impasto',
    SAUCE: 'Salsa',
    CHEESE: 'Formaggi',
    MEAT: 'Carne',
    VEGETABLES: 'Verdure',
    SEAFOOD: 'Pesce',
    HERBS: 'Erbe e Spezie',
    OIL: 'Oli',
    OTHER: 'Altro'
};

// Measurement units
export const UNITS = {
    GRAMS: 'g',
    KILOGRAMS: 'kg',
    MILLILITERS: 'ml',
    LITERS: 'l',
    PIECES: 'pz',
    TABLESPOONS: 'cucchiai',
    TEASPOONS: 'cucchiaini',
    CUPS: 'tazze',
    TO_TASTE: 'q.b.'
};

// Unit conversion to grams (for aggregation)
export const UNIT_TO_GRAMS = {
    [UNITS.GRAMS]: 1,
    [UNITS.KILOGRAMS]: 1000,
    [UNITS.MILLILITERS]: 1, // Approximate for liquids
    [UNITS.LITERS]: 1000,
    [UNITS.TABLESPOONS]: 15,
    [UNITS.TEASPOONS]: 5,
    [UNITS.CUPS]: 240
};

// Pizza night status
export const PIZZA_NIGHT_STATUS = {
    PLANNED: 'planned',
    COMPLETED: 'completed'
};

// Default guest count
export const DEFAULT_GUEST_COUNT = 6;

// Pizzas per person (average)
export const PIZZAS_PER_PERSON = 0.75;

// Views
export const VIEWS = {
    DASHBOARD: 'dashboard',
    DISCOVERY: 'discovery',
    LIBRARY: 'library',
    DOUGHS: 'doughs',
    PREPARATIONS: 'preparations',
    INGREDIENTS: 'ingredients',
    PLANNER: 'planner',
    SHOPPING: 'shopping',
    COMBINATIONS: 'combinations',
    SETTINGS: 'settings'
};

// Navigation items
export const NAV_ITEMS = [
    { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { id: VIEWS.DISCOVERY, label: 'Genera Ricette', icon: '🔍' },
    { id: VIEWS.LIBRARY, label: 'Pizze', icon: '🍕' },
    { id: VIEWS.COMBINATIONS, label: 'Abbinamenti', icon: '🧪' },
    { id: VIEWS.DOUGHS, label: 'Impasti', icon: '🥣' },
    { id: VIEWS.PREPARATIONS, label: 'Preparazioni', icon: '🥫' },
    { id: VIEWS.INGREDIENTS, label: 'Ingredienti', icon: '🥗' },
    { id: VIEWS.PLANNER, label: 'Pianifica Serata', icon: '🎉' },
    { id: VIEWS.SHOPPING, label: 'Lista Spesa', icon: '🛒' },
    { id: VIEWS.SETTINGS, label: 'Impostazioni', icon: '⚙️' }
];

// Combinazioni di ingredienti che funzionano bene insieme
export const FLAVOR_COMBINATIONS = [
    // Combinazioni classiche
    ['Gorgonzola DOP', 'Pere', 'Noci', 'Miele di acacia'],
    ['Burrata', 'Pomodorini ciliegino', 'Basilico fresco'],
    ['Salmone affumicato', 'Ricotta fresca', 'Rucola', 'Limone grattugiato'],
    ['Prosciutto crudo di Parma', 'Rucola', 'Parmigiano Reggiano'],
    ['Tartufo nero', 'Funghi porcini', 'Stracciatella'],
    ['Nduja calabrese', 'Burrata', 'Basilico fresco'],
    ['Speck Alto Adige', 'Taleggio', 'Radicchio'],
    ['Mortadella', 'Pistacchi', 'Stracciatella'],
    ['Salsiccia fresca', 'Friarielli', 'Provola affumicata'],
    ['Bresaola', 'Rucola', 'Parmigiano Reggiano', 'Limone grattugiato'],

    // Combinazioni esistenti migliorate
    ['Crema di zucca', 'Pancetta', 'Gorgonzola DOP', 'Rosmarino'],
    ['Crema di pistacchio', 'Mortadella', 'Burrata', 'Pistacchi'],
    ['Crema di burrata', 'Nduja calabrese', 'Cipolla caramellata'],
    ['Fior di latte', 'Carciofi', 'Guanciale croccante', 'Pecorino Romano'],
    ['Pomodoro San Marzano', 'Melanzane grigliate', 'Ricotta fresca', 'Basilico fresco'],
    ['Fior di latte', 'Zucchine', 'Salmone affumicato', 'Limone grattugiato'],
    ['Provola affumicata', 'Salsiccia fresca', 'Friarielli', 'Peperoncino fresco'],
    ['Taleggio', 'Radicchio', 'Noci', 'Miele di acacia'],
    ['Pomodoro San Marzano', 'Mozzarella di bufala', 'Pesto di basilico'],
    ['Funghi porcini', 'Salsiccia fresca', 'Tartufo nero'],

    // Nuove combinazioni mare
    ['Gamberi rossi', 'Zucchine', 'Limone grattugiato', 'Prezzemolo'],
    ['Polpo', 'Patate', 'Olive taggiasche', 'Pomodorini ciliegino'],
    ['Salmone affumicato', 'Asparagi', 'Burrata', 'Aneto'],
    ['Vongole', 'Aglio', 'Peperoncino fresco', 'Prezzemolo'],
    ['Scampi', 'Rucola', 'Pomodorini ciliegino', 'Limone grattugiato'],
    ['Tonno fresco', 'Cipolla rossa', 'Capperi', 'Olive taggiasche'],
    ['Acciughe', 'Pomodorini datterini', 'Origano', 'Aglio'],
    ['Capesante', 'Crema di zucca', 'Pancetta', 'Salvia'],

    // Nuove combinazioni vegetariane gourmet
    ['Crema di zucca', 'Gorgonzola DOP', 'Noci', 'Salvia'],
    ['Melanzane grigliate', 'Pomodoro San Marzano', 'Ricotta fresca', 'Basilico fresco'],
    ['Carciofi', 'Pecorino Romano', 'Limone grattugiato', 'Menta'],
    ['Asparagi', 'Parmigiano Reggiano', 'Tartufo nero'],
    ['Broccoli', 'Salsiccia fresca', 'Provola affumicata', 'Peperoncino fresco'],
    ['Spinaci', 'Ricotta fresca', 'Parmigiano Reggiano', 'Noce moscata'],
    ['Patate', 'Rosmarino', 'Provola affumicata', 'Pancetta'],
    ['Radicchio', 'Taleggio', 'Speck Alto Adige', 'Noci'],
    ['Zucchine', 'Fiori di zucca', 'Mozzarella di bufala', 'Alici di Cetara'],
    ['Peperoni', 'Cipolla caramellata', 'Olive taggiasche', 'Basilico fresco'],

    // Combinazioni creative e fusion
    ['Brie', 'Fichi', 'Prosciutto crudo di Parma', 'Miele di acacia'],
    ['Caprino fresco', 'Barbabietole', 'Noci', 'Aceto balsamico'],
    ['Fontina Val d\'Aosta', 'Funghi porcini', 'Speck Alto Adige', 'Timo'],
    ['Squacquerone', 'Rucola', 'Prosciutto di San Daniele', 'Fichi'],
    ['Crescenza', 'Radicchio', 'Lardo di Colonnata', 'Miele di castagno'],
    ['Castelmagno', 'Pere', 'Noci', 'Miele di acacia'],
    ['Stracchino', 'Pomodorini ciliegino', 'Basilico fresco', 'Olive taggiasche'],

    // Combinazioni regionali
    ['Porchetta', 'Patate', 'Rosmarino', 'Peperoncino fresco'],
    ['Culatello di Zibello', 'Parmigiano Reggiano', 'Aceto balsamico'],
    ['Finocchiona', 'Pecorino Romano', 'Fichi', 'Miele di acacia'],
    ['Ventricina', 'Peperoni', 'Cipolla caramellata', 'Provola affumicata'],
    ['Cotechino', 'Lenticchie', 'Salvia', 'Parmigiano Reggiano'],

    // Combinazioni dolci-salate
    ['Gorgonzola DOP', 'Mele', 'Noci', 'Miele di castagno'],
    ['Taleggio', 'Pere', 'Speck Alto Adige', 'Noci'],
    ['Brie', 'Marmellata di cipolle', 'Noci', 'Rucola'],
    ['Caprino fresco', 'Miele di acacia', 'Noci', 'Timo'],

    // Combinazioni con ingredienti premium
    ['Tartufo bianco', 'Uovo', 'Parmigiano Reggiano', 'Burro'],
    ['Bottarga', 'Limone grattugiato', 'Olio EVO aromatizzato', 'Prezzemolo'],
    ['Foie gras', 'Fichi', 'Aceto balsamico', 'Pistacchi']
];

// Tipi di impasto (mantenuto per retrocompatibilità)
export const DOUGH_TYPES = [
    { type: 'Napoletana Classica' },
    { type: 'Romana Croccante' },
    { type: 'Contemporanea' },
    { type: 'Alta Idratazione' },
    { type: 'Integrale' },
    { type: 'Toscana alla Pala' }
];

// Ricette complete degli impasti
export const DOUGH_RECIPES = [
    {
        id: 'napoletana-classica',
        type: 'Napoletana Classica',
        description: 'Impasto tradizionale napoletano STG con 24 ore di lievitazione a temperatura ambiente. Perfetto per pizza morbida e bordo alto.',
        hydration: 65,
        temperature: '20-22°C',
        fermentation: '24 ore a temperatura ambiente',
        restTime: '2 ore fuori frigo prima dell\'uso',
        yield: 4,
        difficulty: 'Media',
        ingredients: [
            { name: 'Farina tipo 00', quantity: 1000, unit: 'g', perPizza: 250, category: 'Impasto' },
            { name: 'Acqua', quantity: 650, unit: 'ml', perPizza: 162.5, category: 'Impasto' },
            { name: 'Sale fino', quantity: 25, unit: 'g', perPizza: 6.25, category: 'Impasto' },
            { name: 'Lievito di birra fresco', quantity: 2, unit: 'g', perPizza: 0.5, category: 'Impasto' }
        ],
        instructions: [
            'Sciogliere il lievito in metà dell\'acqua tiepida (25°C)',
            'In una ciotola capiente, versare la farina e creare una fontana',
            'Aggiungere l\'acqua con il lievito al centro e iniziare a impastare',
            'Incorporare gradualmente la farina dai bordi verso il centro',
            'Aggiungere il sale sciolto nella restante acqua',
            'Impastare energicamente per 15-20 minuti fino a ottenere un impasto liscio ed elastico',
            'Formare una palla e lasciar riposare coperto per 2 ore',
            'Dividere in panetti da 250g e formare delle palline',
            'Disporre i panetti in contenitori leggermente oliati',
            'Coprire con pellicola e lasciar lievitare 24 ore a 20-22°C',
            'Prima dell\'uso, lasciare i panetti a temperatura ambiente per 2 ore'
        ],
        tips: [
            'L\'acqua deve essere a 25°C per attivare correttamente il lievito',
            'Non aggiungere mai sale e lievito a diretto contatto',
            'La temperatura ambiente è cruciale: troppo caldo e l\'impasto acidifica',
            'I panetti devono raddoppiare di volume durante la lievitazione'
        ]
    },
    {
        id: 'romana-croccante',
        type: 'Romana Croccante',
        description: 'Impasto romano con lievito madre e 48 ore di maturazione in frigo. Risultato: pizza sottile e croccante.',
        hydration: 70,
        temperature: '4°C (frigo)',
        fermentation: '48 ore in frigorifero',
        restTime: '3 ore fuori frigo prima dell\'uso',
        yield: 4,
        difficulty: 'Alta',
        ingredients: [
            { name: 'Farina tipo 0', quantity: 700, unit: 'g', perPizza: 175, category: 'Impasto' },
            { name: 'Farina tipo 1', quantity: 300, unit: 'g', perPizza: 75, category: 'Impasto' },
            { name: 'Acqua', quantity: 700, unit: 'ml', perPizza: 175, category: 'Impasto' },
            { name: 'Sale fino', quantity: 30, unit: 'g', perPizza: 7.5, category: 'Impasto' },
            { name: 'Lievito madre secco', quantity: 4, unit: 'g', perPizza: 1, category: 'Impasto' },
            { name: 'Olio extravergine d\'oliva', quantity: 40, unit: 'ml', perPizza: 10, category: 'Impasto' }
        ],
        instructions: [
            'Mescolare le due farine in una ciotola',
            'Sciogliere il lievito madre in acqua a temperatura ambiente',
            'Versare l\'acqua nella farina e iniziare a impastare',
            'Dopo 5 minuti, aggiungere il sale',
            'Continuare a impastare per altri 10 minuti',
            'Aggiungere l\'olio e impastare fino a completo assorbimento',
            'Formare una palla e lasciar riposare coperto per 1 ora',
            'Dividere in panetti da 250g',
            'Riporre in contenitore ermetico e mettere in frigo',
            'Lasciar maturare 48 ore a 4°C',
            'Estrarre dal frigo 3 ore prima dell\'uso'
        ],
        tips: [
            'Il lievito madre dona un sapore più complesso',
            'La lunga maturazione in frigo rende l\'impasto più digeribile',
            'L\'olio contribuisce alla croccantezza',
            'Stendere molto sottile per ottenere la classica pizza romana'
        ]
    },
    {
        id: 'contemporanea',
        type: 'Contemporanea',
        description: 'Impasto moderno con farina tipo 1 macinata a pietra e lievito madre liquido. Equilibrio tra tradizione e innovazione.',
        hydration: 75,
        temperature: '18-20°C',
        fermentation: '36 ore (12h ambiente + 24h frigo)',
        restTime: '2-3 ore fuori frigo prima dell\'uso',
        yield: 4,
        difficulty: 'Alta',
        ingredients: [
            { name: 'Farina tipo 1 macinata a pietra', quantity: 1000, unit: 'g', perPizza: 250, category: 'Impasto' },
            { name: 'Acqua', quantity: 750, unit: 'ml', perPizza: 187.5, category: 'Impasto' },
            { name: 'Sale marino integrale', quantity: 25, unit: 'g', perPizza: 6.25, category: 'Impasto' },
            { name: 'Lievito madre liquido', quantity: 100, unit: 'g', perPizza: 25, category: 'Impasto' },
            { name: 'Miele', quantity: 10, unit: 'g', perPizza: 2.5, category: 'Impasto' }
        ],
        instructions: [
            'Rinfrescare il lievito madre liquido 4 ore prima',
            'Mescolare farina e acqua (autolisi) e lasciar riposare 30 minuti',
            'Aggiungere il lievito madre e il miele, impastare 5 minuti',
            'Aggiungere il sale e impastare altri 10 minuti',
            'L\'impasto deve essere morbido ed elastico',
            'Lasciar lievitare coperto per 12 ore a 18-20°C',
            'Dividere in panetti da 250g con delicatezza',
            'Riporre in contenitore e mettere in frigo per 24 ore',
            'Estrarre 2-3 ore prima dell\'uso',
            'Stendere delicatamente per preservare l\'alveolatura'
        ],
        tips: [
            'La farina tipo 1 ha più fibre e nutrienti',
            'Il miele nutre il lievito e dona un leggero sapore',
            'L\'autolisi migliora l\'estensibilità dell\'impasto',
            'Aspettati un bordo molto alveolato e leggero'
        ]
    },
    {
        id: 'alta-idratazione',
        type: 'Alta Idratazione',
        description: 'Impasto con 80% di idratazione e pre-fermento. Richiede tecnica avanzata ma regala una pizza leggerissima e digeribile.',
        hydration: 80,
        temperature: '16-18°C',
        fermentation: '48 ore (24h biga + 24h impasto)',
        restTime: '4 ore fuori frigo prima dell\'uso',
        yield: 4,
        difficulty: 'Molto Alta',
        ingredients: [
            { name: 'Farina Cuor di cereali', quantity: 500, unit: 'g', perPizza: 125, category: 'Impasto' },
            { name: 'Farina tipo 1', quantity: 500, unit: 'g', perPizza: 125, category: 'Impasto' },
            { name: 'Acqua', quantity: 800, unit: 'ml', perPizza: 200, category: 'Impasto' },
            { name: 'Sale fino', quantity: 28, unit: 'g', perPizza: 7, category: 'Impasto' },
            { name: 'Lievito di birra fresco (per biga)', quantity: 1, unit: 'g', perPizza: 0.25, category: 'Impasto' },
            { name: 'Olio extravergine d\'oliva', quantity: 30, unit: 'ml', perPizza: 7.5, category: 'Impasto' }
        ],
        instructions: [
            'BIGA (24h prima): Mescolare 300g farina, 150ml acqua, 1g lievito',
            'Lasciar maturare la biga coperta per 24 ore a 16-18°C',
            'IMPASTO: Sciogliere la biga in 650ml acqua',
            'Aggiungere le farine e impastare 5 minuti',
            'Lasciar riposare 20 minuti (autolisi)',
            'Aggiungere sale e impastare 10 minuti',
            'Aggiungere olio e impastare fino a completo assorbimento',
            'Pieghe: ogni 30 minuti per 3 volte',
            'Lasciar lievitare 6 ore a temperatura ambiente',
            'Dividere delicatamente in panetti da 250g',
            'Mettere in frigo per 18 ore',
            'Estrarre 4 ore prima dell\'uso'
        ],
        tips: [
            'La biga dona complessità aromatica',
            'L\'alta idratazione richiede tecnica: usare le pieghe',
            'Non stendere col mattarello: solo con le mani',
            'L\'impasto sarà molto morbido e appiccicoso: è normale',
            'Usare abbondante farina per stendere'
        ]
    },
    {
        id: 'integrale',
        type: 'Integrale',
        description: 'Impasto 100% integrale con lievito madre solido. Ricco di fibre, nutriente e dal sapore rustico.',
        hydration: 70,
        temperature: '22-24°C',
        fermentation: '24 ore a temperatura controllata',
        restTime: '2 ore fuori frigo prima dell\'uso',
        yield: 4,
        difficulty: 'Media',
        ingredients: [
            { name: 'Farina integrale di grano tenero', quantity: 1000, unit: 'g', perPizza: 250, category: 'Impasto' },
            { name: 'Acqua', quantity: 700, unit: 'ml', perPizza: 175, category: 'Impasto' },
            { name: 'Sale marino integrale', quantity: 25, unit: 'g', perPizza: 6.25, category: 'Impasto' },
            { name: 'Lievito madre solido', quantity: 150, unit: 'g', perPizza: 37.5, category: 'Impasto' },
            { name: 'Olio extravergine d\'oliva', quantity: 40, unit: 'ml', perPizza: 10, category: 'Impasto' },
            { name: 'Malto d\'orzo', quantity: 20, unit: 'g', perPizza: 5, category: 'Impasto' }
        ],
        instructions: [
            'Rinfrescare il lievito madre 4-6 ore prima',
            'Mescolare farina integrale e acqua, lasciar riposare 1 ora (autolisi)',
            'Aggiungere il lievito madre rinfrescato e il malto',
            'Impastare 5 minuti',
            'Aggiungere sale e impastare altri 10 minuti',
            'Aggiungere l\'olio e impastare fino a completo assorbimento',
            'L\'impasto sarà più ruvido e meno elastico: è normale',
            'Lasciar lievitare coperto per 4 ore a 22-24°C',
            'Dividere in panetti da 250g',
            'Lasciar lievitare ancora 20 ore a temperatura controllata',
            'Prima dell\'uso, lasciare a temperatura ambiente per 2 ore'
        ],
        tips: [
            'La farina integrale assorbe più acqua: non spaventarsi',
            'Il malto aiuta la lievitazione e dona colore',
            'Il sapore sarà più rustico e intenso',
            'Ottima con condimenti saporiti e formaggi stagionati',
            'Più nutriente e ricca di fibre rispetto alle altre'
        ]
    },
    {
        id: 'toscana-pala',
        type: 'Toscana alla Pala',
        description: 'Impasto toscano tradizionale per pizza alla pala, sottile e croccante. Bassa idratazione per una lavorazione facile e risultato croccantissimo.',
        hydration: 55,
        temperature: '20-22°C',
        fermentation: '6-8 ore a temperatura ambiente',
        restTime: '1 ora fuori frigo prima dell\'uso',
        yield: 2,
        difficulty: 'Bassa',
        ingredients: [
            { name: 'Farina tipo 0', quantity: 500, unit: 'g', perPizza: 250, category: 'Impasto' },
            { name: 'Acqua', quantity: 275, unit: 'ml', perPizza: 137.5, category: 'Impasto' },
            { name: 'Sale fino', quantity: 12, unit: 'g', perPizza: 6, category: 'Impasto' },
            { name: 'Lievito di birra fresco', quantity: 5, unit: 'g', perPizza: 2.5, category: 'Impasto' },
            { name: 'Olio extravergine d\'oliva toscano', quantity: 30, unit: 'ml', perPizza: 15, category: 'Impasto' }
        ],
        instructions: [
            'Sciogliere il lievito in acqua tiepida (25°C)',
            'In una ciotola, mescolare la farina con il sale',
            'Aggiungere l\'acqua con il lievito al centro della farina',
            'Iniziare a impastare incorporando gradualmente la farina',
            'Dopo 5 minuti, aggiungere l\'olio extravergine',
            'Impastare energicamente per 10-12 minuti',
            'L\'impasto deve risultare liscio, compatto e poco appiccicoso',
            'Formare una palla e lasciar riposare coperto per 1 ora',
            'Dividere in 2 panetti da 400g (per pale grandi)',
            'Lasciar lievitare 6-8 ore a temperatura ambiente',
            'Prima dell\'uso, stendere direttamente sulla pala infarinata',
            'Stendere molto sottile (3-4mm) in forma rettangolare allungata'
        ],
        tips: [
            'La bassa idratazione rende l\'impasto facile da lavorare',
            'Perfetto per chi inizia: non serve grande esperienza',
            'Stendere col mattarello o con le mani, come preferisci',
            'L\'olio toscano dona un sapore caratteristico',
            'Ottima per focacce e schiacciate oltre che per pizza',
            'Cuocere a temperatura molto alta (280-300°C) per 8-10 minuti',
            'Il risultato è sottile, croccante e friabile'
        ]
    }
];

// ============================================
// PREPARATIONS (Sub-Recipes for Compound Ingredients)
// ============================================

export const PREPARATION_CATEGORIES = [
    'Creme',
    'Salse',
    'Condimenti',
    'Basi',
    'Altro'
];

export const PREPARATIONS = [
    {
        id: 'crema-patate',
        name: 'Crema di Patate',
        category: 'Creme',
        description: 'Crema vellutata di patate per pizza bianca',
        yield: 4,
        prepTime: '30 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Patate', quantity: 500, unit: 'g', perPortion: 125, category: 'Verdure' },
            { name: 'Latte intero', quantity: 100, unit: 'ml', perPortion: 25, category: 'Latticini' },
            { name: 'Burro', quantity: 50, unit: 'g', perPortion: 12.5, category: 'Latticini' },
            { name: 'Sale', quantity: 5, unit: 'g', perPortion: 1.25, category: 'Spezie' }
        ],
        instructions: [
            'Lessare le patate in acqua salata per 20-25 minuti',
            'Scolare e passare con lo schiacciapatate',
            'Scaldare latte e burro in un pentolino',
            'Incorporare gradualmente il latte caldo alle patate',
            'Mescolare fino a ottenere una crema liscia',
            'Aggiustare di sale'
        ],
        tips: [
            'Usa patate farinose per una crema più soffice',
            'Non far raffreddare prima di usare',
            'Conserva in frigo max 2 giorni'
        ]
    },
    {
        id: 'crema-zucca',
        name: 'Crema di Zucca',
        category: 'Creme',
        description: 'Crema dolce e vellutata di zucca',
        yield: 4,
        prepTime: '40 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Zucca', quantity: 600, unit: 'g', perPortion: 150, category: 'Verdure' },
            { name: 'Panna fresca', quantity: 80, unit: 'ml', perPortion: 20, category: 'Latticini' },
            { name: 'Noce moscata', quantity: 2, unit: 'g', perPortion: 0.5, category: 'Spezie' },
            { name: 'Sale', quantity: 4, unit: 'g', perPortion: 1, category: 'Spezie' }
        ],
        instructions: [
            'Tagliare la zucca a cubetti',
            'Cuocere al forno a 180°C per 30 minuti',
            'Frullare la zucca con la panna',
            'Aggiungere noce moscata e sale',
            'Frullare fino a ottenere una crema liscia'
        ],
        tips: [
            'La zucca al forno ha più sapore',
            'Regola la consistenza con più o meno panna',
            'Ottima anche fredda'
        ]
    },
    {
        id: 'crema-carciofi',
        name: 'Crema di Carciofi',
        category: 'Creme',
        description: 'Crema delicata di carciofi',
        yield: 4,
        prepTime: '35 min',
        difficulty: 'Media',
        ingredients: [
            { name: 'Carciofi', quantity: 400, unit: 'g', perPortion: 100, category: 'Verdure' },
            { name: 'Aglio', quantity: 8, unit: 'g', perPortion: 2, category: 'Verdure' },
            { name: 'Olio EVO', quantity: 60, unit: 'ml', perPortion: 15, category: 'Oli' },
            { name: 'Limone', quantity: 20, unit: 'ml', perPortion: 5, category: 'Altro' }
        ],
        instructions: [
            'Pulire i carciofi e tagliarli a spicchi',
            'Rosolare l\'aglio nell\'olio',
            'Aggiungere i carciofi e cuocere 20 minuti',
            'Frullare con un po\' di acqua di cottura',
            'Aggiungere succo di limone'
        ],
        tips: [
            'Conserva i carciofi in acqua e limone',
            'Non far scurire i carciofi',
            'Usa carciofi freschi per miglior sapore'
        ]
    },
    {
        id: 'pesto-basilico',
        name: 'Pesto di Basilico',
        category: 'Salse',
        description: 'Classico pesto genovese',
        yield: 4,
        prepTime: '15 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Basilico fresco', quantity: 80, unit: 'g', perPortion: 20, category: 'Erbe' },
            { name: 'Pinoli', quantity: 40, unit: 'g', perPortion: 10, category: 'Frutta Secca' },
            { name: 'Parmigiano Reggiano', quantity: 60, unit: 'g', perPortion: 15, category: 'Formaggi' },
            { name: 'Aglio', quantity: 4, unit: 'g', perPortion: 1, category: 'Verdure' },
            { name: 'Olio EVO', quantity: 120, unit: 'ml', perPortion: 30, category: 'Oli' }
        ],
        instructions: [
            'Lavare e asciugare le foglie di basilico',
            'Tostare leggermente i pinoli',
            'Frullare basilico, pinoli, aglio e parmigiano',
            'Aggiungere l\'olio a filo continuando a frullare',
            'Aggiustare di sale'
        ],
        tips: [
            'Non scaldare il pesto',
            'Conserva coperto d\'olio in frigo',
            'Usa basilico genovese DOP'
        ]
    },
    {
        id: 'salsa-bbq',
        name: 'Salsa BBQ',
        category: 'Salse',
        description: 'Salsa BBQ dolce e affumicata',
        yield: 4,
        prepTime: '25 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Passata di pomodoro', quantity: 200, unit: 'ml', perPortion: 50, category: 'Salsa' },
            { name: 'Miele', quantity: 40, unit: 'g', perPortion: 10, category: 'Altro' },
            { name: 'Aceto di mele', quantity: 30, unit: 'ml', perPortion: 7.5, category: 'Altro' },
            { name: 'Paprika affumicata', quantity: 8, unit: 'g', perPortion: 2, category: 'Spezie' },
            { name: 'Aglio in polvere', quantity: 4, unit: 'g', perPortion: 1, category: 'Spezie' }
        ],
        instructions: [
            'Mescolare tutti gli ingredienti in una pentola',
            'Portare a ebollizione',
            'Abbassare il fuoco e cuocere 15 minuti',
            'Mescolare spesso',
            'Lasciare raffreddare prima dell\'uso'
        ],
        tips: [
            'Più cuoce, più si addensa',
            'Regola dolcezza con miele',
            'Si conserva 1 settimana in frigo'
        ]
    },
    {
        id: 'pesto-rucola',
        name: 'Pesto di Rucola',
        category: 'Salse',
        description: 'Pesto piccante di rucola',
        yield: 4,
        prepTime: '10 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Rucola', quantity: 100, unit: 'g', perPortion: 25, category: 'Verdure' },
            { name: 'Noci', quantity: 50, unit: 'g', perPortion: 12.5, category: 'Frutta Secca' },
            { name: 'Pecorino Romano', quantity: 60, unit: 'g', perPortion: 15, category: 'Formaggi' },
            { name: 'Olio EVO', quantity: 100, unit: 'ml', perPortion: 25, category: 'Oli' }
        ],
        instructions: [
            'Lavare e asciugare la rucola',
            'Frullare rucola, noci e pecorino',
            'Aggiungere olio a filo',
            'Frullare fino a consistenza cremosa'
        ],
        tips: [
            'La rucola deve essere freschissima',
            'Usa subito per evitare ossidazione',
            'Ottimo anche per pasta'
        ]
    },
    {
        id: 'cipolla-caramellata',
        name: 'Cipolla Caramellata',
        category: 'Condimenti',
        description: 'Cipolle dolci e caramellate',
        yield: 4,
        prepTime: '45 min',
        difficulty: 'Media',
        ingredients: [
            { name: 'Cipolle rosse', quantity: 600, unit: 'g', perPortion: 150, category: 'Verdure' },
            { name: 'Zucchero di canna', quantity: 30, unit: 'g', perPortion: 7.5, category: 'Altro' },
            { name: 'Aceto balsamico', quantity: 40, unit: 'ml', perPortion: 10, category: 'Altro' },
            { name: 'Burro', quantity: 30, unit: 'g', perPortion: 7.5, category: 'Latticini' }
        ],
        instructions: [
            'Affettare finemente le cipolle',
            'Rosolare nel burro a fuoco basso',
            'Cuocere 30 minuti mescolando spesso',
            'Aggiungere zucchero e aceto',
            'Cuocere altri 10 minuti fino a caramellatura'
        ],
        tips: [
            'Pazienza: cuocere a fuoco basso',
            'Non far bruciare',
            'Si conserva 5 giorni in frigo'
        ]
    },
    {
        id: 'funghi-trifolati',
        name: 'Funghi Trifolati',
        category: 'Condimenti',
        description: 'Funghi saltati con aglio e prezzemolo',
        yield: 4,
        prepTime: '20 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Funghi champignon', quantity: 500, unit: 'g', perPortion: 125, category: 'Verdure' },
            { name: 'Aglio', quantity: 12, unit: 'g', perPortion: 3, category: 'Verdure' },
            { name: 'Prezzemolo', quantity: 20, unit: 'g', perPortion: 5, category: 'Erbe' },
            { name: 'Olio EVO', quantity: 60, unit: 'ml', perPortion: 15, category: 'Oli' }
        ],
        instructions: [
            'Pulire i funghi con un panno umido',
            'Affettare i funghi',
            'Rosolare l\'aglio nell\'olio',
            'Aggiungere i funghi e cuocere 10 minuti',
            'Aggiungere prezzemolo tritato'
        ],
        tips: [
            'Non lavare i funghi sotto acqua',
            'Cuocere a fuoco alto',
            'Usare subito per miglior sapore'
        ]
    },
    {
        id: 'pomodori-confit',
        name: 'Pomodori Confit',
        category: 'Condimenti',
        description: 'Pomodorini confit al forno',
        yield: 4,
        prepTime: '90 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Pomodorini ciliegino', quantity: 500, unit: 'g', perPortion: 125, category: 'Verdure' },
            { name: 'Olio EVO', quantity: 100, unit: 'ml', perPortion: 25, category: 'Oli' },
            { name: 'Timo', quantity: 8, unit: 'g', perPortion: 2, category: 'Erbe' },
            { name: 'Aglio', quantity: 12, unit: 'g', perPortion: 3, category: 'Verdure' }
        ],
        instructions: [
            'Tagliare i pomodorini a metà',
            'Disporre su teglia con carta forno',
            'Condire con olio, timo e aglio',
            'Cuocere a 120°C per 90 minuti',
            'Lasciare raffreddare'
        ],
        tips: [
            'Temperatura bassa è fondamentale',
            'Si conservano sott\'olio 1 settimana',
            'Ottimi anche per bruschette'
        ]
    },
    {
        id: 'crema-ricotta',
        name: 'Crema di Ricotta',
        category: 'Basi',
        description: 'Crema di ricotta montata',
        yield: 4,
        prepTime: '10 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Ricotta fresca', quantity: 400, unit: 'g', perPortion: 100, category: 'Formaggi' },
            { name: 'Panna fresca', quantity: 80, unit: 'ml', perPortion: 20, category: 'Latticini' },
            { name: 'Sale', quantity: 4, unit: 'g', perPortion: 1, category: 'Spezie' },
            { name: 'Pepe nero', quantity: 2, unit: 'g', perPortion: 0.5, category: 'Spezie' }
        ],
        instructions: [
            'Setacciare la ricotta',
            'Montare la panna a neve morbida',
            'Incorporare delicatamente la ricotta',
            'Aggiungere sale e pepe',
            'Mescolare con movimenti dal basso verso l\'alto'
        ],
        tips: [
            'Usa ricotta di pecora per più sapore',
            'Non montare troppo la panna',
            'Usa subito per miglior consistenza'
        ]
    },
    {
        id: 'crema-pistacchio',
        name: 'Crema di Pistacchio',
        category: 'Creme',
        description: 'Crema vellutata di pistacchi di Bronte',
        yield: 4,
        prepTime: '20 min',
        difficulty: 'Media',
        ingredients: [
            { name: 'Pistacchi di Bronte', quantity: 200, unit: 'g', perPortion: 50, category: 'Frutta Secca' },
            { name: 'Panna fresca', quantity: 150, unit: 'ml', perPortion: 37.5, category: 'Latticini' },
            { name: 'Olio EVO', quantity: 40, unit: 'ml', perPortion: 10, category: 'Oli' },
            { name: 'Sale', quantity: 3, unit: 'g', perPortion: 0.75, category: 'Spezie' }
        ],
        instructions: [
            'Tostare leggermente i pistacchi in padella',
            'Lasciar raffreddare e tritare finemente',
            'Frullare i pistacchi con la panna',
            'Aggiungere l\'olio a filo continuando a frullare',
            'Aggiustare di sale',
            'Frullare fino a ottenere una crema liscia'
        ],
        tips: [
            'I pistacchi di Bronte hanno sapore più intenso',
            'Non tostare troppo i pistacchi',
            'Si conserva 3 giorni in frigo'
        ]
    },
    {
        id: 'crema-burrata',
        name: 'Crema di Burrata',
        category: 'Basi',
        description: 'Crema delicata di burrata pugliese',
        yield: 4,
        prepTime: '10 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Burrata', quantity: 400, unit: 'g', perPortion: 100, category: 'Formaggi' },
            { name: 'Panna fresca', quantity: 60, unit: 'ml', perPortion: 15, category: 'Latticini' },
            { name: 'Olio EVO', quantity: 30, unit: 'ml', perPortion: 7.5, category: 'Oli' },
            { name: 'Sale', quantity: 3, unit: 'g', perPortion: 0.75, category: 'Spezie' }
        ],
        instructions: [
            'Aprire la burrata e raccogliere il cuore cremoso',
            'Frullare il cuore con la panna',
            'Aggiungere l\'olio a filo',
            'Aggiustare di sale',
            'Frullare fino a ottenere una crema liscia'
        ],
        tips: [
            'Usa burrata freschissima',
            'Non conservare: usare subito',
            'Ottima come base per pizze bianche'
        ]
    },
    {
        id: 'salsa-nduja',
        name: 'Salsa di Nduja',
        category: 'Salse',
        description: 'Salsa piccante calabrese',
        yield: 4,
        prepTime: '15 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Nduja calabrese', quantity: 150, unit: 'g', perPortion: 37.5, category: 'Carne' },
            { name: 'Passata di pomodoro', quantity: 200, unit: 'ml', perPortion: 50, category: 'Salsa' },
            { name: 'Olio EVO', quantity: 30, unit: 'ml', perPortion: 7.5, category: 'Oli' },
            { name: 'Aglio', quantity: 8, unit: 'g', perPortion: 2, category: 'Verdure' }
        ],
        instructions: [
            'Rosolare l\'aglio nell\'olio',
            'Aggiungere la nduja e farla sciogliere',
            'Aggiungere la passata di pomodoro',
            'Cuocere a fuoco basso per 10 minuti',
            'Mescolare bene fino a ottenere una salsa omogenea'
        ],
        tips: [
            'La nduja è già molto piccante',
            'Regola la quantità secondo il gusto',
            'Ottima anche fredda'
        ]
    },
    {
        id: 'pesto-pomodori-secchi',
        name: 'Pesto di Pomodori Secchi',
        category: 'Salse',
        description: 'Pesto intenso di pomodori secchi',
        yield: 4,
        prepTime: '15 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Pomodori secchi sott\'olio', quantity: 150, unit: 'g', perPortion: 37.5, category: 'Verdure' },
            { name: 'Mandorle', quantity: 50, unit: 'g', perPortion: 12.5, category: 'Frutta Secca' },
            { name: 'Pecorino Romano', quantity: 50, unit: 'g', perPortion: 12.5, category: 'Formaggi' },
            { name: 'Basilico fresco', quantity: 30, unit: 'g', perPortion: 7.5, category: 'Erbe' },
            { name: 'Olio EVO', quantity: 100, unit: 'ml', perPortion: 25, category: 'Oli' }
        ],
        instructions: [
            'Scolare i pomodori secchi dall\'olio',
            'Tostare leggermente le mandorle',
            'Frullare pomodori, mandorle, pecorino e basilico',
            'Aggiungere l\'olio a filo',
            'Frullare fino a consistenza cremosa'
        ],
        tips: [
            'Usa pomodori secchi di qualità',
            'Le mandorle danno dolcezza',
            'Si conserva 1 settimana in frigo coperto d\'olio'
        ]
    },
    {
        id: 'salsa-tartufo',
        name: 'Salsa al Tartufo',
        category: 'Salse',
        description: 'Salsa cremosa al tartufo nero',
        yield: 4,
        prepTime: '15 min',
        difficulty: 'Media',
        ingredients: [
            { name: 'Funghi champignon', quantity: 300, unit: 'g', perPortion: 75, category: 'Verdure' },
            { name: 'Panna fresca', quantity: 200, unit: 'ml', perPortion: 50, category: 'Latticini' },
            { name: 'Pasta di tartufo nero', quantity: 40, unit: 'g', perPortion: 10, category: 'Altro' },
            { name: 'Burro', quantity: 30, unit: 'g', perPortion: 7.5, category: 'Latticini' },
            { name: 'Sale', quantity: 4, unit: 'g', perPortion: 1, category: 'Spezie' }
        ],
        instructions: [
            'Pulire e affettare i funghi',
            'Rosolare i funghi nel burro',
            'Aggiungere la panna e cuocere 5 minuti',
            'Aggiungere la pasta di tartufo',
            'Frullare fino a ottenere una crema liscia',
            'Aggiustare di sale'
        ],
        tips: [
            'Usa pasta di tartufo di qualità',
            'Non far bollire dopo aver aggiunto il tartufo',
            'Ottima anche per condire pasta'
        ]
    },
    {
        id: 'melanzane-grigliate',
        name: 'Melanzane Grigliate',
        category: 'Condimenti',
        description: 'Melanzane grigliate marinate',
        yield: 4,
        prepTime: '40 min',
        difficulty: 'Media',
        ingredients: [
            { name: 'Melanzane', quantity: 600, unit: 'g', perPortion: 150, category: 'Verdure' },
            { name: 'Olio EVO', quantity: 80, unit: 'ml', perPortion: 20, category: 'Oli' },
            { name: 'Aglio', quantity: 12, unit: 'g', perPortion: 3, category: 'Verdure' },
            { name: 'Basilico fresco', quantity: 20, unit: 'g', perPortion: 5, category: 'Erbe' },
            { name: 'Sale', quantity: 5, unit: 'g', perPortion: 1.25, category: 'Spezie' }
        ],
        instructions: [
            'Tagliare le melanzane a fette di 1 cm',
            'Salare e lasciar riposare 30 minuti',
            'Sciacquare e asciugare le melanzane',
            'Grigliare su piastra calda 3 minuti per lato',
            'Marinare con olio, aglio e basilico',
            'Lasciar riposare 1 ora prima dell\'uso'
        ],
        tips: [
            'Il sale elimina l\'amaro',
            'Non usare troppo olio',
            'Si conservano 3 giorni in frigo'
        ]
    },
    {
        id: 'peperoni-arrosto',
        name: 'Peperoni Arrosto',
        category: 'Condimenti',
        description: 'Peperoni arrostiti e pelati',
        yield: 4,
        prepTime: '50 min',
        difficulty: 'Media',
        ingredients: [
            { name: 'Peperoni rossi', quantity: 600, unit: 'g', perPortion: 150, category: 'Verdure' },
            { name: 'Olio EVO', quantity: 60, unit: 'ml', perPortion: 15, category: 'Oli' },
            { name: 'Aglio', quantity: 8, unit: 'g', perPortion: 2, category: 'Verdure' },
            { name: 'Prezzemolo', quantity: 15, unit: 'g', perPortion: 3.75, category: 'Erbe' },
            { name: 'Sale', quantity: 4, unit: 'g', perPortion: 1, category: 'Spezie' }
        ],
        instructions: [
            'Arrostire i peperoni interi a 220°C per 30 minuti',
            'Girare a metà cottura',
            'Chiudere in un sacchetto di carta per 10 minuti',
            'Pelare i peperoni e togliere semi',
            'Tagliare a listarelle',
            'Condire con olio, aglio, prezzemolo e sale'
        ],
        tips: [
            'La pelle si toglie facilmente dopo il riposo',
            'Non sciacquare: perdi sapore',
            'Si conservano 5 giorni sott\'olio'
        ]
    },
    {
        id: 'pesto-olive',
        name: 'Pesto di Olive Taggiasche',
        category: 'Salse',
        description: 'Pesto intenso di olive liguri',
        yield: 4,
        prepTime: '10 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Olive taggiasche', quantity: 200, unit: 'g', perPortion: 50, category: 'Altro' },
            { name: 'Capperi', quantity: 30, unit: 'g', perPortion: 7.5, category: 'Altro' },
            { name: 'Aglio', quantity: 6, unit: 'g', perPortion: 1.5, category: 'Verdure' },
            { name: 'Olio EVO', quantity: 100, unit: 'ml', perPortion: 25, category: 'Oli' },
            { name: 'Limone', quantity: 15, unit: 'ml', perPortion: 3.75, category: 'Altro' }
        ],
        instructions: [
            'Denocciolate le olive',
            'Dissalare i capperi',
            'Frullare olive, capperi e aglio',
            'Aggiungere olio e succo di limone',
            'Frullare fino a consistenza cremosa'
        ],
        tips: [
            'Le olive taggiasche sono più dolci',
            'Regola il sale: olive e capperi sono già salati',
            'Ottimo anche per bruschette'
        ]
    },
    {
        id: 'crema-gorgonzola',
        name: 'Crema di Gorgonzola',
        category: 'Creme',
        description: 'Crema vellutata di gorgonzola dolce',
        yield: 4,
        prepTime: '15 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Gorgonzola DOP dolce', quantity: 300, unit: 'g', perPortion: 75, category: 'Formaggi' },
            { name: 'Panna fresca', quantity: 150, unit: 'ml', perPortion: 37.5, category: 'Latticini' },
            { name: 'Latte intero', quantity: 50, unit: 'ml', perPortion: 12.5, category: 'Latticini' },
            { name: 'Pepe nero', quantity: 2, unit: 'g', perPortion: 0.5, category: 'Spezie' }
        ],
        instructions: [
            'Tagliare il gorgonzola a pezzetti',
            'Scaldare la panna e il latte a fuoco basso',
            'Aggiungere il gorgonzola',
            'Mescolare fino a completo scioglimento',
            'Aggiungere pepe nero',
            'Frullare per una crema più liscia (facoltativo)'
        ],
        tips: [
            'Usa gorgonzola dolce, non piccante',
            'Non far bollire',
            'Usa tiepida sulla pizza'
        ]
    },
    {
        id: 'salsa-aceto-balsamico',
        name: 'Riduzione di Aceto Balsamico',
        category: 'Salse',
        description: 'Glassa dolce di aceto balsamico',
        yield: 4,
        prepTime: '25 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Aceto balsamico di Modena', quantity: 200, unit: 'ml', perPortion: 50, category: 'Altro' },
            { name: 'Miele', quantity: 30, unit: 'g', perPortion: 7.5, category: 'Altro' }
        ],
        instructions: [
            'Versare l\'aceto in un pentolino',
            'Aggiungere il miele',
            'Portare a ebollizione',
            'Abbassare il fuoco e cuocere 15-20 minuti',
            'Deve ridursi della metà e diventare denso',
            'Lasciar raffreddare prima dell\'uso'
        ],
        tips: [
            'Più cuoce, più diventa denso',
            'Si conserva 1 mese in frigo',
            'Ottima su pizze con gorgonzola e pere'
        ]
    },
    {
        id: 'guanciale-croccante',
        name: 'Guanciale Croccante',
        category: 'Condimenti',
        description: 'Guanciale croccante per topping',
        yield: 4,
        prepTime: '20 min',
        difficulty: 'Facile',
        ingredients: [
            { name: 'Guanciale', quantity: 200, unit: 'g', perPortion: 50, category: 'Carne' }
        ],
        instructions: [
            'Tagliare il guanciale a cubetti di 1 cm',
            'Rosolare in padella antiaderente senza olio',
            'Cuocere a fuoco medio per 15 minuti',
            'Girare spesso per doratura uniforme',
            'Scolare su carta assorbente',
            'Usare tiepido o freddo'
        ],
        tips: [
            'Non serve olio: il guanciale rilascia grasso',
            'Deve essere croccante fuori e morbido dentro',
            'Si conserva 2 giorni in frigo'
        ]
    }
];



