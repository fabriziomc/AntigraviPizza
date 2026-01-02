/**
 * MIGRATE INGREDIENT METADATA
 * Popola i campi season e allergens per ingredienti esistenti
 */

import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// MAPPING CONFIGURATIONS
// ============================================

// Stagionalità per categoria (null = tutto l'anno)
const CATEGORY_SEASON_MAPPING = {
    'Impasti': null,
    'Basi e Salse': null,
    'Formaggi/Latticini': null,
    'Salumi e Carni': null,
    'Verdure': ['primavera', 'estate', 'autunno'],
    'Pesce e Frutti di Mare': null,
    'Condimenti e Spezie': null,
    'Altro': null
};

// Allergeni per categoria
const CATEGORY_ALLERGEN_MAPPING = {
    'Impasti': ['glutine'],
    'Basi e Salse': [],
    'Formaggi/Latticini': ['lattosio'],
    'Salumi e Carni': [],
    'Verdure': [],
    'Pesce e Frutti di Mare': ['pesce'],
    'Condimenti e Spezie': [],
    'Altro': []
};

// Override specifici per ingrediente (nome ingrediente → { season?, allergens? })
const INGREDIENT_SPECIFIC_MAPPING = {
    // Impasti e farine
    'Farina 00': { allergens: ['glutine'] },
    'Farina di grano saraceno': { allergens: ['glutine'] },

    // Latticini e uova
    'Uova': { allergens: ['uova', 'lattosio'] },
    'Tuorlo': { allergens: ['uova'] },
    'Burro': { allergens: ['lattosio'] },
    'Panna': { allergens: ['lattosio'] },
    'Panna fresca': { allergens: ['lattosio'] },
    'Latte': { allergens: ['lattosio'] },
    'Latte intero': { allergens: ['lattosio'] },
    'Yogurt': { allergens: ['lattosio'] },

    // Formaggi
    'Mozzarella di bufala': { allergens: ['lattosio'] },
    'Fior di latte': { allergens: ['lattosio'] },
    'Burrata': { allergens: ['lattosio'] },
    'Stracciatella': { allergens: ['lattosio'] },
    'Ricotta fresca': { allergens: ['lattosio'] },
    'Parmigiano Reggiano': { allergens: ['lattosio'] },
    'Pecorino Romano': { allergens: ['lattosio'] },
    'Grana Padano': { allergens: ['lattosio'] },
    'Gorgonzola DOP': { allergens: ['lattosio'] },
    'Taleggio': { allergens: ['lattosio'] },
    'Fontina Val d\'Aosta': { allergens: ['lattosio'] },
    'Provola affumicata': { allergens: ['lattosio'] },
    'Scamorza': { allergens: ['lattosio'] },
    'Caprino fresco': { allergens: ['lattosio'] },

    // Frutta secca
    'Noci': { allergens: ['frutta_secca'] },
    'Pistacchi': { allergens: ['frutta_secca'] },
    'Pistacchi di Bronte': { allergens: ['frutta_secca'] },
    'Nocciole': { allergens: ['frutta_secca'] },
    'Mandorle': { allergens: ['frutta_secca'] },
    'Granella di mandorle': { allergens: ['frutta_secca'] },
    'Pinoli': { allergens: ['frutta_secca'] },

    // Pesce e frutti di mare
    'Tonno': { allergens: ['pesce'] },
    'Tonno fresco': { allergens: ['pesce'] },
    'Salmone affumicato': { allergens: ['pesce'] },
    'Alici di Cetara': { allergens: ['pesce'] },
    'Acciughe': { allergens: ['pesce'] },
    'Baccalà dissalato': { allergens: ['pesce'] },
    'Bottarga': { allergens: ['pesce'] },
    'Gamberi rossi': { allergens: ['crostacei'] },
    'Scampi': { allergens: ['crostacei'] },
    'Polpo': { allergens: ['pesce'] },
    'Cozze': { allergens: ['pesce'] },
    'Vongole': { allergens: ['pesce'] },
    'Capesante': { allergens: ['pesce'] },

    // Verdure stagionali - PRIMAVERA
    'Asparagi': { season: ['primavera'] },
    'Fave': { season: ['primavera', 'estate'] },
    'Piselli': { season: ['primavera', 'estate'] },

    // Verdure stagionali - ESTATE
    'Pomodorini ciliegino': { season: ['estate', 'autunno'] },
    'Pomodorini datterini': { season: ['estate', 'autunno'] },
    'Zucchine': { season: ['estate'] },
    'Melanzane': { season: ['estate', 'autunno'] },
    'Melanzane grigliate': { season: ['estate', 'autunno'] },
    'Peperoni': { season: ['estate', 'autunno'] },
    'Peperoni rossi': { season: ['estate', 'autunno'] },

    // Verdure stagionali - AUTUNNO
    'Funghi porcini': { season: ['autunno'] },
    'Zucca': { season: ['autunno', 'inverno'] },
    'Castagne cotte': { season: ['autunno', 'inverno'], allergens: ['frutta_secca'] },

    // Verdure stagionali - INVERNO
    'Cavolo nero': { season: ['inverno', 'primavera'] },
    'Verza': { season: ['inverno'] },
    'Radicchio': { season: ['inverno'] },
    'Catalogna': { season: ['inverno', 'primavera'] },
    'Carciofi': { season: ['inverno', 'primavera'] },
    'Friarielli': { season: ['inverno', 'primavera'] },

    // Verdure tutto l'anno
    'Rucola': { season: null },
    'Spinaci': { season: null },
    'Cipolla': { season: null },
    'Cipolla rossa': { season: null },
    'Cipolla caramellata': { season: null },
    'Funghi champignon': { season: null },
    'Patate': { season: null },
    'Carote': { season: null },

    // Sedano
    'Sedano': { allergens: ['sedano'] },

    // Soia
    'Salsa di soia': { allergens: ['soia', 'glutine'] }
};

// ============================================
// DATABASE ADAPTERS
// ============================================

class SQLiteAdapter {
    constructor() {
        this.db = new Database('antigravipizza.db');
    }

    getAllIngredients() {
        const rows = this.db.prepare('SELECT * FROM Ingredients').all();
        return rows.map(row => ({
            ...row,
            season: row.season ? JSON.parse(row.season) : null,
            allergens: row.allergens ? JSON.parse(row.allergens) : null
        }));
    }

    getCategory(categoryId) {
        return this.db.prepare('SELECT * FROM Categories WHERE id = ?').get(categoryId);
    }

    updateIngredient(id, season, allergens) {
        const seasonJson = season ? JSON.stringify(season) : null;
        const allergensJson = allergens ? JSON.stringify(allergens) : null;

        this.db.prepare(
            'UPDATE Ingredients SET season = ?, allergens = ? WHERE id = ?'
        ).run(seasonJson, allergensJson, id);
    }

    close() {
        this.db.close();
    }
}

class TursoAdapter {
    constructor() {
        this.client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }

    async getAllIngredients() {
        const result = await this.client.execute('SELECT * FROM Ingredients');
        return result.rows.map(row => ({
            ...row,
            season: row.season ? JSON.parse(row.season) : null,
            allergens: row.allergens ? JSON.parse(row.allergens) : null
        }));
    }

    async getCategory(categoryId) {
        const result = await this.client.execute({
            sql: 'SELECT * FROM Categories WHERE id = ?',
            args: [categoryId]
        });
        return result.rows[0];
    }

    async updateIngredient(id, season, allergens) {
        const seasonJson = season ? JSON.stringify(season) : null;
        const allergensJson = allergens ? JSON.stringify(allergens) : null;

        await this.client.execute({
            sql: 'UPDATE Ingredients SET season = ?, allergens = ? WHERE id = ?',
            args: [seasonJson, allergensJson, id]
        });
    }

    close() {
        // Turso client doesn't need explicit close
    }
}

// ============================================
// MIGRATION LOGIC
// ============================================

function determineMetadata(ingredient, category) {
    const categoryName = category?.name || 'Altro';

    // Check for specific override
    const specificMapping = INGREDIENT_SPECIFIC_MAPPING[ingredient.name];

    let season = null;
    let allergens = [];

    // Determine season
    if (specificMapping?.season !== undefined) {
        season = specificMapping.season;
    } else {
        season = CATEGORY_SEASON_MAPPING[categoryName] || null;
    }

    // Determine allergens
    if (specificMapping?.allergens) {
        allergens = specificMapping.allergens;
    } else {
        allergens = CATEGORY_ALLERGEN_MAPPING[categoryName] || [];
    }

    return {
        season: season && season.length > 0 ? season : null,
        allergens: allergens.length > 0 ? allergens : null
    };
}

async function migrateDatabase(dbType) {
    console.log(`\n========================================`);
    console.log(`🔄 Migrating ${dbType.toUpperCase()} database...`);
    console.log(`========================================\n`);

    const adapter = dbType === 'sqlite' ? new SQLiteAdapter() : new TursoAdapter();

    try {
        // Get all ingredients
        const ingredients = dbType === 'sqlite'
            ? adapter.getAllIngredients()
            : await adapter.getAllIngredients();

        console.log(`📊 Found ${ingredients.length} ingredients\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const ingredient of ingredients) {
            // Skip if already has values
            if (ingredient.season !== null || ingredient.allergens !== null) {
                console.log(`⏭️  Skipping "${ingredient.name}" (already has metadata)`);
                skippedCount++;
                continue;
            }

            // Get category
            const category = dbType === 'sqlite'
                ? adapter.getCategory(ingredient.categoryId)
                : await adapter.getCategory(ingredient.categoryId);

            // Determine metadata
            const { season, allergens } = determineMetadata(ingredient, category);

            // Update
            if (dbType === 'sqlite') {
                adapter.updateIngredient(ingredient.id, season, allergens);
            } else {
                await adapter.updateIngredient(ingredient.id, season, allergens);
            }

            const seasonStr = season ? season.map(s => `🌸${s}`).join(', ') : '—';
            const allergensStr = allergens ? allergens.join(', ') : '—';
            console.log(`✅ Updated "${ingredient.name}"`);
            console.log(`   Category: ${category?.name || 'Unknown'}`);
            console.log(`   Season: ${seasonStr}`);
            console.log(`   Allergens: ${allergensStr}\n`);

            updatedCount++;
        }

        console.log(`\n========================================`);
        console.log(`📈 Migration complete!`);
        console.log(`   ✅ Updated: ${updatedCount}`);
        console.log(`   ⏭️  Skipped: ${skippedCount}`);
        console.log(`   📊 Total: ${ingredients.length}`);
        console.log(`========================================\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        adapter.close();
    }
}

// ============================================
// MAIN
// ============================================

async function main() {
    const args = process.argv.slice(2);
    const dbType = args.find(arg => arg.startsWith('--db='))?.split('=')[1] || 'sqlite';

    if (!['sqlite', 'turso'].includes(dbType)) {
        console.error('❌ Invalid database type. Use --db=sqlite or --db=turso');
        process.exit(1);
    }

    try {
        await migrateDatabase(dbType);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
