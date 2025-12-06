// ============================================
// CONSTANTS
// ============================================

export const APP_NAME = 'AntigraviPizza';
export const DB_NAME = 'AntigraviPizzaDB';
export const DB_VERSION = 2;

// Store names
export const STORES = {
    RECIPES: 'recipes',
    PIZZA_NIGHTS: 'pizzaNights',
    GUESTS: 'guests',
    COMBINATIONS: 'combinations'
};

// Recipe categories/tags
export const RECIPE_TAGS = [
    'Classica',
    'Gourmet',
    'Napoletana',
    'Romana',
    'Contemporanea',
    'Vegetariana',
    'Vegana',
    'Senza Glutine',
    'Fritta',
    'Al Tegamino'
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
    PLANNER: 'planner',
    SHOPPING: 'shopping',
    COMBINATIONS: 'combinations',
    SETTINGS: 'settings'
};

// Navigation items
export const NAV_ITEMS = [
    { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { id: VIEWS.DISCOVERY, label: 'Scopri Ricette', icon: '🔍' },
    { id: VIEWS.LIBRARY, label: 'Pizze', icon: '🍕' },
    { id: VIEWS.COMBINATIONS, label: 'Abbinamenti', icon: '🧪' },
    { id: VIEWS.DOUGHS, label: 'Impasti', icon: '🥣' },
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
