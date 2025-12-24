/**
 * TAG DEFINITIONS - Sistema di tagging a 4 layer per ingredienti e preparazioni
 * 
 * Layer 1: Tag Base (Ingredienti + Preparazioni)
 * Layer 2: Elaborazione (Solo Preparazioni)
 * Layer 3: Funzione (Solo Preparazioni)
 * Layer 4: Carattere (Solo Preparazioni)
 */

// ============================================
// LAYER 1: TAG BASE (per ingredienti e preparazioni)
// ============================================

export const CHEESE_TAGS = {
    cheese_fresh: {
        description: 'Formaggi freschi e cremosi',
        examples: ['Burrata', 'Stracciatella', 'Mozzarella di bufala', 'Fior di latte', 'Ricotta fresca']
    },
    cheese_aged: {
        description: 'Formaggi stagionati',
        examples: ['Parmigiano Reggiano', 'Pecorino Romano', 'Grana Padano', 'Asiago']
    },
    cheese_blue: {
        description: 'Formaggi erborinati',
        examples: ['Gorgonzola DOP', 'Castelmagno']
    },
    cheese_soft: {
        description: 'Formaggi a pasta molle',
        examples: ['Taleggio', 'Brie', 'Robiola', 'Stracchino', 'Crescenza']
    },
    cheese_creamy: {
        description: 'Formaggi cremosi spalmabili',
        examples: ['Squacquerone', 'Caprino fresco', 'Crescenza']
    },
    cheese_smoked: {
        description: 'Formaggi affumicati',
        examples: ['Provola affumicata', 'Scamorza']
    }
};

export const MEAT_TAGS = {
    meat_cured_delicate: {
        description: 'Salumi stagionati delicati',
        examples: ['Prosciutto crudo di Parma', 'Culatello', 'Bresaola', 'Prosciutto di San Daniele']
    },
    meat_cured_intense: {
        description: 'Salumi stagionati dal sapore intenso',
        examples: ['Speck Alto Adige', 'Lardo di Colonnata', 'Coppa di Parma']
    },
    meat_spicy: {
        description: 'Carni e salumi piccanti',
        examples: ['Nduja calabrese', 'Salame piccante', 'Ventricina', 'Soppressata']
    },
    meat_cooked: {
        description: 'Carni cotte fresche',
        examples: ['Salsiccia fresca', 'Porchetta', 'Cotechino']
    },
    meat_fatty: {
        description: 'Carni grasse saporite',
        examples: ['Guanciale', 'Pancetta', 'Lardo']
    },
    meat_mild_salumi: {
        description: 'Salumi dal sapore delicato',
        examples: ['Prosciutto cotto', 'Mortadella', 'Finocchiona']
    }
};

export const VEGETABLE_TAGS = {
    vegetable_mushrooms: {
        description: 'Funghi di ogni tipo',
        examples: ['Funghi porcini', 'Funghi champignon', 'Funghi misti']
    },
    vegetable_leafy: {
        description: 'Verdure a foglia',
        examples: ['Rucola', 'Spinaci', 'Bietole', 'Cavolo nero']
    },
    vegetable_grilled: {
        description: 'Verdure da grigliare',
        examples: ['Melanzane', 'Zucchine', 'Peperoni']
    },
    vegetable_root: {
        description: 'Tuberi e radici',
        examples: ['Patate', 'Patate dolci', 'Carote', 'Barbabietole']
    },
    vegetable_cruciferous: {
        description: 'Crucifere',
        examples: ['Broccoli', 'Cavolfiore', 'Friarielli', 'Catalogna']
    },
    vegetable_onions: {
        description: 'Cipolle e famiglia',
        examples: ['Cipolla caramellata', 'Cipolla rossa', 'Porri']
    },
    vegetable_artichoke: {
        description: 'Carciofi',
        examples: ['Carciofi']
    },
    vegetable_asparagus: {
        description: 'Asparagi',
        examples: ['Asparagi']
    },
    vegetable_tomato_fresh: {
        description: 'Pomodori freschi',
        examples: ['Pomodorini ciliegino', 'Pomodorini datterini']
    },
    vegetable_bitter: {
        description: 'Verdure amare',
        examples: ['Radicchio', 'Cicoria', 'Puntarelle']
    }
};

export const SEAFOOD_TAGS = {
    seafood_crustaceans: {
        description: 'Crostacei',
        examples: ['Gamberi rossi', 'Scampi']
    },
    seafood_mollusks: {
        description: 'Molluschi',
        examples: ['Polpo', 'Cozze', 'Vongole', 'Capesante']
    },
    seafood_fish: {
        description: 'Pesce fresco',
        examples: ['Tonno fresco']
    },
    seafood_preserved: {
        description: 'Pesce conservato/affumicato',
        examples: ['Salmone affumicato', 'Alici di Cetara', 'Acciughe', 'Bottarga']
    }
};

export const BASE_TAGS = {
    base_tomato: {
        description: 'Basi di pomodoro',
        examples: ['Pomodoro San Marzano', 'Passata di pomodoro', 'Pomodorini datterini']
    },
    base_cream_vegetable: {
        description: 'Creme vegetali',
        examples: ['Crema di zucca', 'Crema di ceci', 'Crema di melanzane', 'Crema di peperoni']
    },
    base_cream_cheese: {
        description: 'Creme di formaggio',
        examples: ['Crema di burrata']
    },
    base_cream_nut: {
        description: 'Creme di frutta secca',
        examples: ['Crema di pistacchio', 'Crema di noci']
    },
    base_pesto: {
        description: 'Pesti',
        examples: ['Pesto di basilico', 'Pesto di rucola', 'Pesto rosso']
    },
    base_oil: {
        description: 'Oli aromatizzati',
        examples: ['Olio EVO aromatizzato', 'Olio al tartufo']
    }
};

export const HERB_TAGS = {
    herb_fresh_delicate: {
        description: 'Erbe fresche delicate',
        examples: ['Basilico', 'Prezzemolo', 'Erba cipollina']
    },
    herb_fresh_aromatic: {
        description: 'Erbe fresche aromatiche',
        examples: ['Rosmarino', 'Salvia', 'Timo']
    },
    herb_citrus: {
        description: 'Erbe e agrumi',
        examples: ['Limone grattugiato', 'Aneto', 'Menta']
    },
    spice_hot: {
        description: 'Spezie piccanti',
        examples: ['Peperoncino fresco', 'Paprika affumicata']
    },
    spice_dried: {
        description: 'Spezie secche',
        examples: ['Origano', 'Maggiorana']
    }
};

export const FRUIT_TAGS = {
    fruit_sweet: {
        description: 'Frutta dolce',
        examples: ['Pere', 'Fichi']
    },
    nut_creamy: {
        description: 'Frutta secca cremosa',
        examples: ['Noci', 'Pistacchi', 'Nocciole']
    },
    nut_crunchy: {
        description: 'Frutta secca croccante',
        examples: ['Granella di mandorle', 'Pinoli', 'Semi di sesamo']
    }
};

export const CONDIMENT_TAGS = {
    finish_sweet: {
        description: 'Condimenti dolci',
        examples: ['Miele di acacia', 'Miele di castagno']
    },
    finish_tangy: {
        description: 'Condimenti aspri/acidi',
        examples: ['Aceto balsamico', 'Riduzione di balsamico']
    },
    finish_savory: {
        description: 'Condimenti saporiti',
        examples: ['Olive taggiasche', 'Capperi', 'Pomodori secchi']
    },
    premium_truffle: {
        description: 'Tartufo e derivati',
        examples: ['Tartufo nero', 'Tartufo bianco', 'Olio al tartufo']
    },
    premium_luxury: {
        description: 'Ingredienti di lusso',
        examples: ['Caviale', 'Foie gras', 'Bottarga']
    }
};

// ============================================
// LAYER 2: TAG ELABORAZIONE (solo preparazioni)
// ============================================

export const PREP_ELABORATION_TAGS = {
    prep_grilled: {
        description: 'Grigliato/arrostito',
        examples: ['Melanzane grigliate', 'Peperoni arrosto', 'Finocchi grigliati']
    },
    prep_sauteed: {
        description: 'Saltato in padella',
        examples: ['Funghi trifolati', 'Cavolo nero stufato']
    },
    prep_creamed: {
        description: 'Ridotto a crema',
        examples: ['Crema di patate', 'Crema di burrata', 'Crema di ceci']
    },
    prep_confit: {
        description: 'Cottura lenta in grasso',
        examples: ['Pomodori confit']
    },
    prep_caramelized: {
        description: 'Caramellato',
        examples: ['Cipolla caramellata', 'Ananas caramellato']
    },
    prep_pesto: {
        description: 'Pestato/frullato a crudo',
        examples: ['Pesto basilico', 'Pesto rucola', 'Pesto olive']
    },
    prep_sauce: {
        description: 'Salsa cotta/ridotta',
        examples: ['Salsa nduja', 'Salsa BBQ', 'Riduzione balsamico']
    },
    prep_raw_marinade: {
        description: 'Marinato a crudo',
        examples: ['Tartare', 'Manzo marinato']
    }
};

// ============================================
// LAYER 3: TAG FUNZIONE (solo preparazioni)
// ============================================

export const PREP_FUNCTION_TAGS = {
    pizza_base: {
        description: 'Sostituisce la base rossa/bianca',
        examples: ['Crema di patate', 'Crema di zucca', 'Pomodoro stracotto']
    },
    pizza_topping: {
        description: 'Condimento principale',
        examples: ['Funghi trifolati', 'Melanzane grigliate', 'Guanciale croccante']
    },
    pizza_drizzle: {
        description: 'Finish a filo',
        examples: ['Pesto', 'Riduzione balsamico', 'Olio al tartufo']
    },
    pizza_sauce: {
        description: 'Salsa di accompagnamento',
        examples: ['Salsa BBQ', 'Salsa aioli']
    }
};

// ============================================
// LAYER 4: TAG CARATTERE (solo preparazioni)
// ============================================

export const PREP_FLAVOR_TAGS = {
    flavor_delicate: {
        description: 'Sapore delicato',
        examples: ['Crema di burrata', 'Crema di ricotta']
    },
    flavor_rich: {
        description: 'Sapore ricco',
        examples: ['Crema di gorgonzola', 'Salsa al tartufo']
    },
    flavor_spicy: {
        description: 'Piccante',
        examples: ['Salsa nduja', 'Peperoncino']
    },
    flavor_sweet: {
        description: 'Dolce',
        examples: ['Cipolla caramellata', 'Composta pere']
    },
    flavor_umami: {
        description: 'Sapido/umami',
        examples: ['Funghi trifolati', 'Pesto olive', 'Pomodoro stracotto']
    },
    flavor_fresh: {
        description: 'Fresco/acidulo',
        examples: ['Pesto basilico', 'Limone', 'Pesto rucola']
    }
};

// ============================================
// EXPORT CONSOLIDATO
// ============================================

export const ALL_TAGS = {
    // Layer 1
    ...CHEESE_TAGS,
    ...MEAT_TAGS,
    ...VEGETABLE_TAGS,
    ...SEAFOOD_TAGS,
    ...BASE_TAGS,
    ...HERB_TAGS,
    ...FRUIT_TAGS,
    ...CONDIMENT_TAGS,

    // Layer 2-4
    ...PREP_ELABORATION_TAGS,
    ...PREP_FUNCTION_TAGS,
    ...PREP_FLAVOR_TAGS
};

// Helper per validare tag
export function isValidTag(tag) {
    return tag in ALL_TAGS;
}

// Helper per ottenere descrizione tag
export function getTagDescription(tag) {
    return ALL_TAGS[tag]?.description || 'Unknown tag';
}

// Helper per ottenere esempi tag
export function getTagExamples(tag) {
    return ALL_TAGS[tag]?.examples || [];
}
