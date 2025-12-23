import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

// Test query Category
try {
    console.log('\nTesting Categories table...');
    const categories = db.prepare('SELECT * FROM Categories').all();
    console.log('Categories found:', categories.length);
    categories.forEach(cat => {
        console.log(`  -`, cat);
    });
} catch (error) {
    console.error('Error querying Categories:', error.message);
}

// Test query Ingredients
try {
    console.log('\nTesting Ingredients table...');
    const count = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
    console.log('Ingredients count:', count.count);

    const sample = db.prepare('SELECT * FROM Ingredients LIMIT 3').all();
    console.log('Sample ingredients:');
    sample.forEach(ing => {
        console.log(`  -`, ing);
    });
} catch (error) {
    console.error('Error querying Ingredients:', error.message);
}

db.close();
console.log('\n✓ Debug complete');
