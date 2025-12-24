/**
 * INGREDIENT TAG MAPPING
 * Mapping completo nome ingrediente → array di tag (Layer 1)
 */

export const INGREDIENT_TAG_MAPPING = {
    // ============================================
    // FORMAGGI
    // ============================================
    'Burrata': ['cheese_fresh'],
    'Stracciatella': ['cheese_fresh'],
    'Mozzarella di bufala': ['cheese_fresh'],
    'Fior di latte': ['cheese_fresh'],
    'Ricotta fresca': ['cheese_fresh'],

    'Parmigiano Reggiano': ['cheese_aged'],
    'Pecorino Romano': ['cheese_aged'],
    'Grana Padano': ['cheese_aged'],
    'Asiago': ['cheese_aged'],

    'Gorgonzola DOP': ['cheese_blue'],
    'Gorgonzola DOP dolce': ['cheese_blue'],
    'Castelmagno': ['cheese_blue'],

    'Taleggio': ['cheese_soft'],
    'Brie': ['cheese_soft'],
    'Robiola': ['cheese_soft'],
    'Stracchino': ['cheese_soft'],
    'Crescenza': ['cheese_soft'],

    'Squacquerone': ['cheese_creamy'],
    'Caprino fresco': ['cheese_creamy'],

    'Provola affumicata': ['cheese_smoked'],
    'Scamorza': ['cheese_smoked'],
    'Caciocavallo': ['cheese_smoked'],
    'Fontina Val d\'Aosta': ['cheese_aged'],

    // ============================================
    // CARNI E SALUMI
    // ============================================
    'Prosciutto crudo di Parma': ['meat_cured_delicate'],
    'Culatello di Zibello': ['meat_cured_delicate'],
    'Bresaola': ['meat_cured_delicate'],
    'Prosciutto di San Daniele': ['meat_cured_delicate'],

    'Speck Alto Adige': ['meat_cured_intense'],
    'Lardo di Colonnata': ['meat_cured_intense'],
    'Coppa di Parma': ['meat_cured_intense'],
    'Capocollo': ['meat_cured_intense'],

    'Nduja calabrese': ['meat_spicy'],
    'Salame piccante': ['meat_spicy'],
    'Salamino piccante': ['meat_spicy'],
    'Ventricina': ['meat_spicy'],
    'Soppressata': ['meat_spicy'],

    'Salsiccia fresca': ['meat_cooked'],
    'Porchetta': ['meat_cooked'],
    'Cotechino': ['meat_cooked'],

    'Guanciale croccante': ['meat_fatty'],
    'Guanciale': ['meat_fatty'],
    'Pancetta': ['meat_fatty'],

    'Prosciutto cotto': ['meat_mild_salumi'],
    'Mortadella': ['meat_mild_salumi'],
    'Finocchiona': ['meat_mild_salumi'],
    'Lonza': ['meat_mild_salumi'],

    // ============================================
    // VERDURE E ORTAGGI
    // ============================================
    'Funghi porcini': ['vegetable_mushrooms'],
    'Funghi champignon': ['vegetable_mushrooms'],
    'Funghi misto': ['vegetable_mushrooms'],

    'Rucola': ['vegetable_leafy'],
    'Spinaci': ['vegetable_leafy'],
    'Bietole': ['vegetable_leafy'],
    'Cavolo nero': ['vegetable_leafy'],

    'Melanzane grigliate': ['vegetable_grilled'],
    'Melanzane': ['vegetable_grilled'],
    'Zucchine': ['vegetable_grilled'],
    'Peperoni': ['vegetable_grilled'],
    'Peperoni rossi': ['vegetable_grilled'],

    'Patate': ['vegetable_root'],
    'Patate dolci': ['vegetable_root'],
    'Patate viola': ['vegetable_root'],
    'Carote': ['vegetable_root'],
    'Barbabietole': ['vegetable_root'],
    'Barbabietole cotte': ['vegetable_root'],

    'Broccoli': ['vegetable_cruciferous'],
    'Cavolfiore': ['vegetable_cruciferous'],
    'Friarielli': ['vegetable_cruciferous'],
    'Catalogna': ['vegetable_cruciferous'],
    'Cavolo cappuccio viola': ['vegetable_cruciferous'],
    'Verza': ['vegetable_cruciferous'],

    'Cipolla caramellata': ['vegetable_onions'],
    'Cipolla': ['vegetable_onions'],
    'Cipolla rossa': ['vegetable_onions'],
    'Porri': ['vegetable_onions'],

    'Carciofi': ['vegetable_artichoke'],
    'Asparagi': ['vegetable_asparagus'],
    'Finocchi': ['vegetable_asparagus'],

    'Pomodorini ciliegino': ['vegetable_tomato_fresh'],
    'Pomodorini datterini': ['vegetable_tomato_fresh'],
    'Pomodori ciliegino': ['vegetable_tomato_fresh'],

    'Radicchio': ['vegetable_bitter'],
    'Cicoria': ['vegetable_bitter'],
    'Puntarelle': ['vegetable_bitter'],
    'Agretti': ['vegetable_bitter'],

    'Olive taggiasche': ['finish_savory'],
    'Capperi': ['finish_savory'],
    'Pomodori secchi': ['finish_savory'],
    'Pomodoro secchi': ['finish_savory'],

    'Sedano': ['vegetable_root'],
    'Carota': ['vegetable_root'],
    'Piselli': ['vegetable_cruciferous'],
    'Fave': ['vegetable_cruciferous'],

    // ============================================
    // PESCE E FRUTTI DI MARE
    // ============================================
    'Gamberi rossi': ['seafood_crustaceans'],
    'Scampi': ['seafood_crustaceans'],

    'Polpo': ['seafood_mollusks'],
    'Cozze': ['seafood_mollusks'],
    'Vongole': ['seafood_mollusks'],
    'Capesante': ['seafood_mollusks'],

    'Tonno fresco': ['seafood_fish'],
    'Tonno': ['seafood_fish'],
    'Baccalà dissalato': ['seafood_fish'],
    'Manzo': ['meat_cooked'],
    'Manzo Fassona': ['meat_cooked'],
    'Anatra': ['meat_cooked'],

    'Salmone affumicato': ['seafood_preserved'],
    'Alici di Cetara': ['seafood_preserved'],
    'Acciughe': ['seafood_preserved'],
    'Bottarga': ['seafood_preserved'],

    // ============================================
    // BASI E SALSE
    // ============================================
    'Pomodoro San Marzano': ['base_tomato'],
    'Passata di pomodoro': ['base_tomato'],
    'Passata': ['base_tomato'],

    'Crema di zucca': ['base_cream_vegetable'],
    'Crema di ceci': ['base_cream_vegetable'],
    'Crema di melanzane': ['base_cream_vegetable'],
    'Crema di peperoni': ['base_cream_vegetable'],

    'Crema di burrata': ['base_cream_cheese'],

    'Crema di pistacchio': ['base_cream_nut'],
    'Crema di noci': ['base_cream_nut'],

    'Pesto di basilico': ['base_pesto'],
    'Pesto di rucola': ['base_pesto'],
    'Pesto rosso': ['base_pesto'],
    'Salsa al pesto di olive': ['base_pesto'],

    'Olio EVO aromatizzato': ['base_oil'],
    'Olio al tartufo': ['premium_truffle', 'base_oil'],
    'Olio EVO': ['base_oil'],

    // ============================================
    // ERBE E SPEZIE
    // ============================================
    'Basilico fresco': ['herb_fresh_delicate'],
    'Basilico': ['herb_fresh_delicate'],
    'Prezzemolo': ['herb_fresh_delicate'],
    'Erba cipollina': ['herb_fresh_delicate'],

    'Rosmarino': ['herb_fresh_aromatic'],
    'Salvia': ['herb_fresh_aromatic'],
    'Timo': ['herb_fresh_aromatic'],
    'Alloro': ['herb_fresh_aromatic'],

    'Limone grattugiato': ['herb_citrus'],
    'Limone': ['herb_citrus'],
    'Lime': ['herb_citrus'],
    'Aneto': ['herb_citrus'],
    'Menta': ['herb_citrus'],

    'Peperoncino fresco': ['spice_hot'],
    'Peperoncino': ['spice_hot'],
    'Paprika affumicata': ['spice_hot'],

    'Origano': ['spice_dried'],
    'Maggiorana': ['spice_dried'],
    'Pepe nero': ['spice_dried'],
    'Pepe bianco': ['spice_dried'],
    'Noce moscata': ['spice_dried'],
    'Sale': ['spice_dried'],
    'Sale Maldon': ['spice_dried'],
    'Aglio': ['herb_fresh_aromatic'],
    'Aglio nero': ['herb_fresh_aromatic'],
    'Zenzero': ['herb_citrus'],

    // ============================================
    // FRUTTA E FRUTTA SECCA
    // ============================================
    'Pere': ['fruit_sweet'],
    'Fichi': ['fruit_sweet'],
    'Ananas': ['fruit_sweet'],
    'Melone': ['fruit_sweet'],

    'Noci': ['nut_creamy'],
    'Pistacchi': ['nut_creamy'],
    'Pistacchi di Bronte': ['nut_creamy'],
    'Nocciole': ['nut_creamy'],

    'Granella di mandorle': ['nut_crunchy'],
    'Pinoli': ['nut_crunchy'],
    'Semi di sesamo': ['nut_crunchy'],
    'Mandorle': ['nut_crunchy'],

    // ============================================
    // CONDIMENTI E FINISH
    // ============================================
    'Miele di acacia': ['finish_sweet'],
    'Miele di castagno': ['finish_sweet'],
    'Miele': ['finish_sweet'],
    'Zucchero': ['finish_sweet'],

    'Aceto balsamico': ['finish_tangy'],
    'Riduzione di balsamico': ['finish_tangy'],
    'Aceto di mele': ['finish_tangy'],

    'Tartufo nero': ['premium_truffle'],
    'Tartufo bianco': ['premium_truffle'],

    'Caviale': ['premium_luxury'],
    'Foie gras': ['premium_luxury'],

    // ============================================
    // LATTICINI E ALTRO
    // ============================================
    'Burro': ['cheese_fresh'],
    'Panna': ['cheese_fresh'],
    'Panna fresca': ['cheese_fresh'],
    'Latte': ['cheese_fresh'],
    'Latte intero': ['cheese_fresh'],
    'Yogurt': ['cheese_fresh'],
    'Uova': ['cheese_fresh'],
    'Tuorlo': ['cheese_fresh'],

    // Altro
    'Brodo': ['base_oil'],
    'Brodo vegetale': ['base_oil'],
    'Vino rosso': ['finish_tangy'],
    'Mirin': ['finish_sweet'],
    'Salsa di soia': ['finish_tangy'],
    'Senape': ['finish_tangy'],
    'Acqua': ['base_oil'],
    'Olio di semi': ['base_oil'],
    'Farina 00': ['base_oil'],
    'Farina di grano saraceno': ['base_oil'],
    'Castagne cotte': ['nut_creamy'],
    'Ceci lessati': ['vegetable_cruciferous'],
    'Zucca': ['vegetable_root'],
    'Scaglie di cioccolato': ['finish_sweet']
};
