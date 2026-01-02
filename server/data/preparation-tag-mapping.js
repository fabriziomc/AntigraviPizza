/**
 * PREPARATION TAG MAPPING
 * Mapping completo nome preparazione → array di tag (4 layers)
 * 
 * Formato: [Layer1_base, Layer2_elaboration, Layer3_function, Layer4_character]
 */

export const PREPARATION_TAG_MAPPING = {
    // ============================================
    // VERDURE PREPARATE
    // ============================================
    'Funghi trifolati': ['vegetable_mushrooms', 'prep_sauteed', 'pizza_topping', 'flavor_umami'],
    'Funghi Trifolati': ['vegetable_mushrooms', 'prep_sauteed', 'pizza_topping', 'flavor_umami'],

    'Melanzane Grigliate': ['vegetable_grilled', 'prep_grilled', 'pizza_topping', 'flavor_umami'],
    'Melanzane grigliate': ['vegetable_grilled', 'prep_grilled', 'pizza_topping', 'flavor_umami'],

    'Peperoni Arrosto': ['vegetable_grilled', 'prep_grilled', 'pizza_topping', 'flavor_sweet'],

    'Pomodori Confit': ['vegetable_tomato_fresh', 'prep_confit', 'pizza_topping', 'flavor_sweet'],
    'Pomodorini confit': ['vegetable_tomato_fresh', 'prep_confit', 'pizza_topping', 'flavor_sweet'],

    'Cipolla Caramellata': ['vegetable_onions', 'prep_caramelized', 'pizza_topping', 'flavor_sweet'],
    'Cipolla caramellata': ['vegetable_onions', 'prep_caramelized', 'pizza_topping', 'flavor_sweet'],

    'Finocchi grigliati': ['vegetable_asparagus', 'prep_grilled', 'pizza_topping', 'flavor_delicate'],
    'Cavolo nero stufato': ['vegetable_leafy', 'prep_sauteed', 'pizza_topping', 'flavor_umami'],
    'Dadolata di patate': ['vegetable_root', 'prep_sauteed', 'pizza_topping', 'flavor_delicate'],
    'Patate in crosta': ['vegetable_root', 'prep_sauteed', 'pizza_topping', 'flavor_delicate'],
    'Verza e Patate': ['vegetable_cruciferous', 'prep_sauteed', 'pizza_topping', 'flavor_delicate'],

    // ============================================
    // CREME VEGETALI
    // ============================================
    'Crema di Patate': ['vegetable_root', 'prep_creamed', 'pizza_base', 'flavor_delicate'],
    'Crema di patate': ['vegetable_root', 'prep_creamed', 'pizza_base', 'flavor_delicate'],
    'Crema di patate viola': ['vegetable_root', 'prep_creamed', 'pizza_base', 'flavor_delicate'],

    'Crema di Zucca': ['vegetable_root', 'prep_creamed', 'pizza_base', 'flavor_sweet'],

    'Crema di ceci': ['vegetable_cruciferous', 'prep_creamed', 'pizza_base', 'flavor_umami'],

    'Crema di Carciofi': ['vegetable_artichoke', 'prep_creamed', 'pizza_base', 'flavor_delicate'],

    'Crema di friarielli': ['vegetable_cruciferous', 'prep_creamed', 'pizza_base', 'flavor_umami'],

    'Crema di barbabietola': ['vegetable_root', 'prep_creamed', 'pizza_base', 'flavor_sweet'],

    'Crema di Melone': ['fruit_sweet', 'prep_creamed', 'pizza_base', 'flavor_sweet'],

    'Crema di piselli': ['vegetable_cruciferous', 'prep_creamed', 'pizza_base', 'flavor_delicate'],

    'Crema di zucchine': ['vegetable_grilled', 'prep_creamed', 'pizza_base', 'flavor_delicate'],

    'Crema di castagne': ['nut_creamy', 'prep_creamed', 'pizza_base', 'flavor_sweet'],

    // ============================================
    // CREME DI FORMAGGIO
    // ============================================
    'Crema di Burrata': ['cheese_fresh', 'prep_creamed', 'pizza_base', 'flavor_delicate'],

    'Crema di Gorgonzola': ['cheese_blue', 'prep_creamed', 'pizza_base', 'flavor_rich'],

    'Crema di Ricotta': ['cheese_fresh', 'prep_creamed', 'pizza_base', 'flavor_delicate'],

    'Crema di Pistacchio': ['nut_creamy', 'prep_creamed', 'pizza_base', 'flavor_rich'],

    'Crema di pecorino': ['cheese_aged', 'prep_creamed', 'pizza_base', 'flavor_rich'],

    // ============================================
    // PESTI E SALSE A CRUDO
    // ============================================
    'Pesto di Basilico': ['herb_fresh_delicate', 'prep_pesto', 'pizza_drizzle', 'flavor_fresh'],

    'Pesto di Rucola': ['vegetable_leafy', 'prep_pesto', 'pizza_drizzle', 'flavor_fresh'],
    'Pesto di rucola': ['vegetable_leafy', 'prep_pesto', 'pizza_drizzle', 'flavor_fresh'],

    'Pesto di Olive Taggiasche': ['finish_savory', 'prep_pesto', 'pizza_drizzle', 'flavor_umami'],

    'Pesto di Pomodori Secchi': ['finish_savory', 'prep_pesto', 'pizza_drizzle', 'flavor_umami'],
    'Pomodori secchi (crema)': ['finish_savory', 'prep_pesto', 'pizza_drizzle', 'flavor_umami'],

    // ============================================
    // SALSE COTTE
    // ============================================
    'Salsa di Nduja': ['meat_spicy', 'prep_sauce', 'pizza_sauce', 'flavor_spicy'],

    'Salsa BBQ': ['base_tomato', 'prep_sauce', 'pizza_sauce', 'flavor_sweet'],

    'Salsa al Tartufo': ['premium_truffle', 'prep_sauce', 'pizza_drizzle', 'flavor_rich'],

    'Salsa di pistacchi': ['nut_creamy', 'prep_sauce', 'pizza_drizzle', 'flavor_rich'],

    'Riduzione di Aceto Balsamico': ['finish_tangy', 'prep_sauce', 'pizza_drizzle', 'flavor_sweet'],

    'Pomodoro stracotto': ['base_tomato', 'prep_sauce', 'pizza_base', 'flavor_umami'],

    'Salsa aioli': ['base_oil', 'prep_sauce', 'pizza_sauce', 'flavor_rich'],

    'Salsa al mango': ['fruit_sweet', 'prep_sauce', 'pizza_sauce', 'flavor_sweet'],

    'Guacamole': ['vegetable_grilled', 'prep_pesto', 'pizza_sauce', 'flavor_fresh'],

    'Maionese al wasabi': ['base_oil', 'prep_sauce', 'pizza_sauce', 'flavor_spicy'],

    'Emulsione di aglio nero': ['herb_fresh_aromatic', 'prep_sauce', 'pizza_drizzle', 'flavor_umami'],

    'Gel di agrumi': ['herb_citrus', 'prep_sauce', 'pizza_drizzle', 'flavor_fresh'],

    'Ragù napoletano': ['meat_cooked', 'prep_sauce', 'pizza_base', 'flavor_rich'],

    // ============================================
    // CARNI PREPARATE
    // ============================================
    'Guanciale Croccante': ['meat_fatty', 'prep_sauteed', 'pizza_topping', 'flavor_rich'],

    'Manzo marinato': ['meat_cooked', 'prep_raw_marinade', 'pizza_topping', 'flavor_umami'],

    'Stracotto di manzo': ['meat_cooked', 'prep_sauce', 'pizza_topping', 'flavor_rich'],

    'Tartare di Fassona': ['meat_cooked', 'prep_raw_marinade', 'pizza_topping', 'flavor_delicate'],

    'Anatra': ['meat_cooked', 'prep_sauteed', 'pizza_topping', 'flavor_rich'],

    // ============================================
    // PESCE PREPARATO
    // ============================================
    'Tartare di Gamberi': ['seafood_crustaceans', 'prep_raw_marinade', 'pizza_topping', 'flavor_fresh'],

    'Tonno Tataki': ['seafood_fish', 'prep_raw_marinade', 'pizza_topping', 'flavor_umami'],

    'Baccalà in vasocottura': ['seafood_fish', 'prep_confit', 'pizza_topping', 'flavor_delicate'],

    'Baccalà mantecato': ['seafood_fish', 'prep_creamed', 'pizza_base', 'flavor_delicate'],

    // ============================================
    // DOLCI E ALTRO
    // ============================================
    'Composta pere e zenzero': ['fruit_sweet', 'prep_sauce', 'pizza_drizzle', 'flavor_sweet'],
    'Comp.pere e zenzero': ['fruit_sweet', 'prep_sauce', 'pizza_drizzle', 'flavor_sweet'],

    'Ananas caramellato': ['fruit_sweet', 'prep_caramelized', 'pizza_topping', 'flavor_sweet'],

    'Chips di grano saraceno': ['nut_crunchy', 'prep_sauteed', 'pizza_topping', 'flavor_delicate'],

    'Coralli viola': ['vegetable_root', 'prep_sauteed', 'pizza_topping', 'flavor_delicate'],

    'Uova strapazzate': ['cheese_fresh', 'prep_sauteed', 'pizza_topping', 'flavor_delicate'],

    'Uovo marinato': ['cheese_fresh', 'prep_raw_marinade', 'pizza_topping', 'flavor_umami'],

    'Misto Pesce paella': ['seafood_mollusks', 'prep_sauteed', 'pizza_topping', 'flavor_umami']
};
