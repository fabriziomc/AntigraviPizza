import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('  GENERAZIONE SCRIPT SQL PER IMPORT');
console.log('========================================\n');

try {
    // Read export file
    const exportPath = path.join(__dirname, '..', 'migration-data.json');
    if (!fs.existsSync(exportPath)) {
        throw new Error('File migration-data.json non trovato!');
    }

    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log(`📁 File caricato: ${data.recipes.length} ricette, ${data.combinations.length} combinazioni\n`);

    let sqlScript = `USE AntigraviPizza;\nGO\n\n`;
    sqlScript += `-- Importazione dati da SQLite\n`;
    sqlScript += `-- Generato il ${new Date().toISOString()}\n\n`;

    // Import Recipes
    console.log('📝 Generazione INSERT per Recipes...');
    for (const recipe of data.recipes) {
        const ingredients = recipe.ingredients.replace(/'/g, "''");
        const instructions = recipe.instructions.replace(/'/g, "''");
        const tags = recipe.tags.replace(/'/g, "''");
        const description = (recipe.description || '').replace(/'/g, "''");
        const imageUrl = (recipe.imageUrl || '').replace(/'/g, "''");

        sqlScript += `INSERT INTO Recipes (id, name, pizzaiolo, source, description, ingredients, instructions, imageUrl, archetype, createdAt, dateAdded, isFavorite, rating, tags)\n`;
        sqlScript += `VALUES ('${recipe.id}', N'${recipe.name}', N'${recipe.pizzaiolo}', N'${recipe.source}', N'${description}', N'${ingredients}', N'${instructions}', N'${imageUrl}', N'${recipe.archetype || ''}', ${recipe.createdAt}, ${recipe.dateAdded}, ${recipe.isFavorite ? 1 : 0}, ${recipe.rating || 0}, N'${tags}');\n`;
    }
    sqlScript += `GO\n\n`;

    // Import Pizza Nights
    console.log('📝 Generazione INSERT per Pizza Nights...');
    for (const night of data.pizzaNights) {
        const selectedPizzas = night.selectedPizzas.replace(/'/g, "''");
        const selectedGuests = night.selectedGuests.replace(/'/g, "''");
        const notes = (night.notes || '').replace(/'/g, "''");

        sqlScript += `INSERT INTO PizzaNights (id, name, date, guestCount, selectedPizzas, selectedGuests, notes, status, createdAt)\n`;
        sqlScript += `VALUES ('${night.id}', N'${night.name}', ${night.date}, ${night.guestCount}, N'${selectedPizzas}', N'${selectedGuests}', N'${notes}', N'${night.status}', ${night.createdAt});\n`;
    }
    if (data.pizzaNights.length > 0) {
        sqlScript += `GO\n\n`;
    }

    // Import Guests
    console.log('📝 Generazione INSERT per Guests...');
    for (const guest of data.guests) {
        sqlScript += `INSERT INTO Guests (id, name, createdAt)\n`;
        sqlScript += `VALUES ('${guest.id}', N'${guest.name}', ${guest.createdAt});\n`;
    }
    if (data.guests.length > 0) {
        sqlScript += `GO\n\n`;
    }

    // Import Combinations
    console.log('📝 Generazione INSERT per Combinations...');
    for (const combo of data.combinations) {
        const ingredients = combo.ingredients.replace(/'/g, "''");

        sqlScript += `INSERT INTO Combinations (id, ingredients, createdAt)\n`;
        sqlScript += `VALUES ('${combo.id}', N'${ingredients}', ${combo.createdAt});\n`;
    }
    sqlScript += `GO\n\n`;

    // Save SQL script
    const sqlPath = path.join(__dirname, 'sql', 'import-data.sql');
    fs.writeFileSync(sqlPath, sqlScript);

    console.log('\n========================================');
    console.log('✅ SCRIPT SQL GENERATO!');
    console.log(`📁 File salvato: ${sqlPath}`);
    console.log('========================================\n');

} catch (err) {
    console.error('❌ Errore:', err.message);
    process.exit(1);
}
