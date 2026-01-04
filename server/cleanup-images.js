import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@libsql/client';

const PLACEHOLDER_SIZE = 1396239;

async function cleanup() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    console.log('🚀 Starting image cleanup on:', url);
    const db = createClient({ url, authToken });

    try {
        const result = await db.execute("SELECT id, name, imageUrl FROM Recipes WHERE imageUrl LIKE '%pollinations.ai%'");
        const recipes = result.rows;
        console.log(`📊 Total Pollinations images to verify: ${recipes.length}`);

        let cleaned = 0;
        let errors = 0;

        for (const recipe of recipes) {
            process.stdout.write(`🔍 Verifying ${recipe.name}... `);
            try {
                const response = await fetch(recipe.imageUrl, { timeout: 10000 });
                const blob = await response.blob();
                const size = blob.size;

                if (size === PLACEHOLDER_SIZE) {
                    console.log(`🚩 Found placeholder (${size} bytes). Clearing URL.`);
                    await db.execute({
                        sql: 'UPDATE Recipes SET imageUrl = "" WHERE id = ?',
                        args: [recipe.id]
                    });
                    cleaned++;
                } else {
                    console.log(`✅ OK (${size} bytes).`);
                }
            } catch (e) {
                console.log(`❌ Failed: ${e.message}`);
                errors++;
            }
        }

        console.log(`\n✨ Cleanup completed!`);
        console.log(`🧹 Cleaned: ${cleaned} placeholders`);
        console.log(`⚠️ Errors: ${errors}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
