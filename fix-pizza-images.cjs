const Database = require('better-sqlite3').default || require('better-sqlite3');
const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== RIGENERAZIONE URL IMMAGINI PIZZE ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

function generateImageUrl(pizzaName, baseIngredients, tags) {
    try {
        const ingredients = typeof baseIngredients === 'string'
            ? JSON.parse(baseIngredients)
            : baseIngredients;

        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

        const mainIngredients = ingredients.slice(0, 3).map(i => i.name);
        const hasTomato = ingredients.some(ing =>
            ing.name.toLowerCase().includes('pomodor') ||
            ing.name.toLowerCase().includes('salsa') ||
            ing.name.toLowerCase().includes('passata')
        );

        const pizzaStyle = hasTomato
            ? 'pizza with red tomato sauce base'
            : 'pizza bianca, white pizza with NO tomato sauce, white base with olive oil';

        const imagePrompt = `gourmet ${pizzaStyle}, ${pizzaName}, toppings: ${mainIngredients.join(', ')}, professional food photography, 4k, highly detailed, italian style, rustic background`;

        return `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?model=turbo&width=800&height=600&nologo=true`;
    } catch (e) {
        console.error(`  ❌ Errore generazione URL per ${pizzaName}:`, e.message);
        return null;
    }
}

async function fixTursoImages() {
    console.log('📍 TURSO (Produzione)\n');

    const turso = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    try {
        // Cerca pizze senza imageUrl o con vecchio URL pollinations
        const result = await turso.execute({
            sql: `SELECT id, name, baseIngredients, tags, imageUrl 
            FROM Recipes 
            WHERE imageUrl IS NULL 
               OR imageUrl = '' 
               OR (imageUrl LIKE '%pollinations%' AND imageUrl NOT LIKE '%model=turbo%')
            LIMIT 30`,
            args: []
        });

        console.log(`Trovate ${result.rows.length} pizze da aggiornare\n`);

        let updated = 0;

        for (const pizza of result.rows) {
            const newImageUrl = generateImageUrl(pizza.name, pizza.baseIngredients, pizza.tags);

            if (newImageUrl) {
                await turso.execute({
                    sql: 'UPDATE Recipes SET imageUrl = ? WHERE id = ?',
                    args: [newImageUrl, pizza.id]
                });

                updated++;
                console.log(`  ✅ ${updated}. ${pizza.name}`);
            }
        }

        console.log(`\n✅ Turso: Aggiornate ${updated} pizze con nuovo URL immagini\n`);

    } catch (error) {
        console.error('❌ Errore Turso:', error.message);
    }
}

function fixSQLiteImages() {
    console.log('📍 SQLite (Locale)\n');

    const db = new Database('./antigravipizza.db');

    try {
        const pizzas = db.prepare(`
      SELECT id, name, baseIngredients, tags, imageUrl 
      FROM Recipes 
      WHERE imageUrl IS NULL 
         OR imageUrl = '' 
         OR (imageUrl LIKE '%pollinations%' AND imageUrl NOT LIKE '%model=turbo%')
    `).all();

        console.log(`Trovate ${pizzas.length} pizze da aggiornare\n`);

        let updated = 0;

        db.prepare('BEGIN').run();

        for (const pizza of pizzas) {
            const newImageUrl = generateImageUrl(pizza.name, pizza.baseIngredients, pizza.tags);

            if (newImageUrl) {
                db.prepare('UPDATE Recipes SET imageUrl = ? WHERE id = ?').run(newImageUrl, pizza.id);
                updated++;
                console.log(`  ✅ ${updated}. ${pizza.name}`);
            }
        }

        db.prepare('COMMIT').run();
        console.log(`\n✅ SQLite: Aggiornate ${updated} pizze con nuovo URL immagini\n`);

        db.close();

    } catch (error) {
        db.prepare('ROLLBACK').run();
        db.close();
        console.error('❌ Errore SQLite:', error.message);
    }
}

async function main() {
    fixSQLiteImages();
    await fixTursoImages();

    console.log('='.repeat(80));
    console.log('\n🎉 COMPLETATO!');
    console.log('   Tutte le pizze dovrebbero ora avere immagini funzionanti.\n');
    console.log('='.repeat(80) + '\n');
}

main();
