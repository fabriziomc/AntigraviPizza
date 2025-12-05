import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { query, getPool, closePool } from './db-mssql.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('  IMPORTAZIONE DATI IN SQL SERVER');
console.log(`  Server: ${process.env.DB_SERVER}`);
console.log(`  Database: ${process.env.DB_DATABASE}`);
console.log('========================================\n');

async function importData() {
    try {
        // Read export file
        const exportPath = path.join(__dirname, '..', 'migration-data.json');
        if (!fs.existsSync(exportPath)) {
            throw new Error('File migration-data.json non trovato! Esegui prima export-from-sqlite.js');
        }

        const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
        console.log(`📁 File caricato: ${data.recipes.length} ricette, ${data.pizzaNights.length} pizza nights, ${data.guests.length} ospiti, ${data.combinations.length} combinazioni\n`);

        // Connect to SQL Server
        await getPool();

        let imported = { recipes: 0, pizzaNights: 0, guests: 0, combinations: 0 };
        let errors = [];

        // Import Recipes
        console.log('📦 Importazione Recipes...');
        for (const recipe of data.recipes) {
            try {
                await query(`
                    INSERT INTO Recipes (id, name, pizzaiolo, source, description, ingredients, instructions, imageUrl, archetype, createdAt, dateAdded, isFavorite, rating, tags)
                    VALUES (@id, @name, @pizzaiolo, @source, @description, @ingredients, @instructions, @imageUrl, @archetype, @createdAt, @dateAdded, @isFavorite, @rating, @tags)
                `, {
                    id: recipe.id,
                    name: recipe.name,
                    pizzaiolo: recipe.pizzaiolo || 'Sconosciuto',
                    source: recipe.source || '',
                    description: recipe.description || '',
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                    imageUrl: recipe.imageUrl || '',
                    archetype: recipe.archetype || '',
                    createdAt: recipe.createdAt || Date.now(),
                    dateAdded: recipe.dateAdded || Date.now(),
                    isFavorite: recipe.isFavorite ? 1 : 0,
                    rating: recipe.rating || 0,
                    tags: recipe.tags
                });
                imported.recipes++;
            } catch (err) {
                errors.push(`Recipe ${recipe.name}: ${err.message}`);
            }
        }
        console.log(`   ✅ ${imported.recipes}/${data.recipes.length} ricette importate`);

        // Import Pizza Nights
        console.log('📦 Importazione Pizza Nights...');
        for (const night of data.pizzaNights) {
            try {
                await query(`
                    INSERT INTO PizzaNights (id, name, date, guestCount, selectedPizzas, selectedGuests, notes, status, createdAt)
                    VALUES (@id, @name, @date, @guestCount, @selectedPizzas, @selectedGuests, @notes, @status, @createdAt)
                `, {
                    id: night.id,
                    name: night.name,
                    date: night.date,
                    guestCount: night.guestCount,
                    selectedPizzas: night.selectedPizzas,
                    selectedGuests: night.selectedGuests,
                    notes: night.notes || '',
                    status: night.status,
                    createdAt: night.createdAt
                });
                imported.pizzaNights++;
            } catch (err) {
                errors.push(`Pizza Night ${night.name}: ${err.message}`);
            }
        }
        console.log(`   ✅ ${imported.pizzaNights}/${data.pizzaNights.length} pizza nights importate`);

        // Import Guests
        console.log('📦 Importazione Guests...');
        for (const guest of data.guests) {
            try {
                await query(`
                    INSERT INTO Guests (id, name, createdAt)
                    VALUES (@id, @name, @createdAt)
                `, {
                    id: guest.id,
                    name: guest.name,
                    createdAt: guest.createdAt
                });
                imported.guests++;
            } catch (err) {
                errors.push(`Guest ${guest.name}: ${err.message}`);
            }
        }
        console.log(`   ✅ ${imported.guests}/${data.guests.length} ospiti importati`);

        // Import Combinations
        console.log('📦 Importazione Combinations...');
        for (const combo of data.combinations) {
            try {
                await query(`
                    INSERT INTO Combinations (id, ingredients, createdAt)
                    VALUES (@id, @ingredients, @createdAt)
                `, {
                    id: combo.id,
                    ingredients: combo.ingredients,
                    createdAt: combo.createdAt
                });
                imported.combinations++;
            } catch (err) {
                errors.push(`Combination ${combo.id}: ${err.message}`);
            }
        }
        console.log(`   ✅ ${imported.combinations}/${data.combinations.length} combinazioni importate`);

        console.log('\n========================================');
        console.log('✅ IMPORTAZIONE COMPLETATA!');
        console.log(`📊 Riepilogo:`);
        console.log(`   - Ricette: ${imported.recipes}`);
        console.log(`   - Pizza Nights: ${imported.pizzaNights}`);
        console.log(`   - Ospiti: ${imported.guests}`);
        console.log(`   - Combinazioni: ${imported.combinations}`);

        if (errors.length > 0) {
            console.log(`\n⚠️  ${errors.length} errori riscontrati:`);
            errors.forEach(err => console.log(`   - ${err}`));
        }

        console.log('========================================\n');

        await closePool();

    } catch (err) {
        console.error('❌ Errore durante l\'importazione:', err.message);
        await closePool();
        process.exit(1);
    }
}

importData();
