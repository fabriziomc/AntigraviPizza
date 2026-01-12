import DatabaseAdapter from './db-adapter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicUploads = path.join(__dirname, '../public/uploads');

async function checkImages() {
    const db = new DatabaseAdapter();
    console.log('🔌 Connected to DB');

    const recipes = await db.getAllRecipes();
    console.log(`📊 Found ${recipes.length} recipes`);

    const withImages = recipes.filter(r => r.imageUrl);
    console.log(`📸 Recipes with images: ${withImages.length}`);

    console.log('\n--- Image Report ---');

    let base64Count = 0;
    let localFileCount = 0;
    let missingFileCount = 0;
    let otherCount = 0;

    for (const r of withImages) {
        if (r.imageUrl.startsWith('data:image')) {
            console.log(`[Base64] Pizza "${r.name}" (ID: ${r.id})`);
            base64Count++;
        } else if (r.imageUrl.startsWith('/uploads/')) {
            const filename = r.imageUrl.replace('/uploads/', '');
            const filePath = path.join(publicUploads, filename);
            const exists = fs.existsSync(filePath);

            if (exists) {
                console.log(`[OK]     Pizza "${r.name}" (ID: ${r.id}) -> ${r.imageUrl}`);
                localFileCount++;
            } else {
                console.log(`[MISSING] Pizza "${r.name}" (ID: ${r.id}) -> ${r.imageUrl}`);
                missingFileCount++;
            }
        } else {
            console.log(`[OTHER]   Pizza "${r.name}" (ID: ${r.id}) -> ${r.imageUrl}`);
            otherCount++;
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Canvas/Base64 (Generated): ${base64Count}`);
    console.log(`Local File (Exists):       ${localFileCount}`);
    console.log(`Local File (Missing):      ${missingFileCount}`);
    console.log(`Other/External:            ${otherCount}`);

    console.log('\n--- Checking Uploads Directory ---');
    if (fs.existsSync(publicUploads)) {
        const files = fs.readdirSync(publicUploads);
        console.log(`Files in public/uploads: ${files.length}`);
        files.forEach(f => console.log(` - ${f}`));
    } else {
        console.log('WARNING: public/uploads directory does not exist!');
    }
}

checkImages().catch(console.error);
