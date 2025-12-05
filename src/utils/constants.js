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
