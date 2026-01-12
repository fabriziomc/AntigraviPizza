
import DatabaseAdapter from './server/db-adapter.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkPlaceholders() {
    const db = new DatabaseAdapter();
    console.log('Checking database for placeholders...');

    try {
        const recipes = await db.getAllRecipes();
        const placeholderRecipes = recipes.filter(r => r.imageUrl && r.imageUrl.includes('via.placeholder.com'));

        console.log(`Found ${placeholderRecipes.length} recipes with placeholder URLs.`);

        if (placeholderRecipes.length > 0) {
            console.log('Sample IDs:', placeholderRecipes.slice(0, 3).map(r => r.id));

            // Fix them
            console.log('Fixing...');
            const SVG_DATA_URI = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23333" width="800" height="600"/%3E%3Ctext fill="%23777" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E';

            for (const recipe of placeholderRecipes) {
                await db.updateRecipe(recipe.id, { imageUrl: SVG_DATA_URI });
                console.log(`Updated recipe ${recipe.id}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

checkPlaceholders();
