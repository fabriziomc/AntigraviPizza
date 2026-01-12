import DatabaseAdapter from './db-adapter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicUploads = path.join(__dirname, '../public/uploads');

async function fixImageLinks() {
    const db = new DatabaseAdapter();
    console.log('🔌 Connected to DB');

    const recipes = await db.getAllRecipes();
    const withImages = recipes.filter(r => r.imageUrl && r.imageUrl.startsWith('/uploads/'));

    console.log(`🔍 Checking ${withImages.length} recipes with uploaded images...`);

    let fixedCount = 0;

    // Cache existing files for faster lookup
    const existingFiles = fs.existsSync(publicUploads) ? fs.readdirSync(publicUploads) : [];
    console.log(`📂 Found ${existingFiles.length} files in uploads directory`);

    for (const r of withImages) {
        const currentFilename = r.imageUrl.replace('/uploads/', '');
        const currentFilePath = path.join(publicUploads, currentFilename);

        if (!fs.existsSync(currentFilePath)) {
            console.log(`⚠️  MISSING: ${currentFilename} (Recipe: ${r.name})`);

            // Try to find a matching file by Recipe ID
            // r.id format is typically "recipe-TIMESTAMP-RANDOM"
            // File format is often "pizza-RECIPEID-TIMESTAMP.jpg"

            // Search strategy: Look for file containing the recipe ID
            const match = existingFiles.find(f => f.includes(r.id));

            if (match) {
                console.log(`   ✅ FOUND MATCH: ${match}`);
                const newUrl = `/uploads/${match}`;

                // Update DB
                await db.updateRecipe(r.id, { imageUrl: newUrl });
                console.log(`   💾 Updated DB link for "${r.name}"`);
                fixedCount++;
            } else {
                console.log(`   ❌ NO MATCH FOUND for ID: ${r.id}`);
            }
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Processed: ${withImages.length}`);
    console.log(`Fixed:     ${fixedCount}`);
}

fixImageLinks().catch(console.error);
