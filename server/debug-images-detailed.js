import DatabaseAdapter from './db-adapter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicUploads = path.join(__dirname, '../public/uploads');

async function checkImages() {
    const db = new DatabaseAdapter();
    const recipes = await db.getAllRecipes();
    const withImages = recipes.filter(r => r.imageUrl && r.imageUrl.startsWith('/uploads/'));

    console.log('--- Missing Files Detail ---');
    for (const r of withImages) {
        const filename = r.imageUrl.replace('/uploads/', '');
        const filePath = path.join(publicUploads, filename);
        if (!fs.existsSync(filePath)) {
            console.log(`MISSING: ${filename} (DB ID: ${r.id})`);
        }
    }

    console.log('\n--- Existing Files Detail ---');
    if (fs.existsSync(publicUploads)) {
        fs.readdirSync(publicUploads).forEach(f => console.log(`FOUND:   ${f}`));
    }
}

checkImages().catch(console.error);
