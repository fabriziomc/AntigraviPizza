import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('🔧 Adding missing columns to Recipes table...\n');

try {
    // Check if columns already exist
    const schema = db.prepare("PRAGMA table_info(Recipes)").all();
    const columnNames = schema.map(col => col.name);

    console.log('Current columns:', columnNames.join(', '));

    // Add recipeSource column if it doesn't exist
    if (!columnNames.includes('recipeSource')) {
        console.log('\n➕ Adding recipeSource column...');
        db.prepare("ALTER TABLE Recipes ADD COLUMN recipeSource TEXT").run();
        console.log('✅ recipeSource column added');
    } else {
        console.log('\n✓ recipeSource column already exists');
    }

    // Add archetypeUsed column if it doesn't exist
    if (!columnNames.includes('archetypeUsed')) {
        console.log('➕ Adding archetypeUsed column...');
        db.prepare("ALTER TABLE Recipes ADD COLUMN archetypeUsed TEXT").run();
        console.log('✅ archetypeUsed column added');
    } else {
        console.log('✓ archetypeUsed column already exists');
    }

    // Verify the changes
    console.log('\n📊 Updated schema:');
    const updatedSchema = db.prepare("PRAGMA table_info(Recipes)").all();
    updatedSchema.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log(`Total columns: ${updatedSchema.length}`);

} catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err.stack);
} finally {
    db.close();
}
