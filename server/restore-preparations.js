// Restore preparations from backup
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');
const backupDir = path.join(__dirname, '../backups');

const db = new Database(dbPath);

console.log('📦 Restoring preparations from backup...\n');

// Find the most recent backup file
const backupFiles = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('preparations-backup-'))
    .sort()
    .reverse();

if (backupFiles.length === 0) {
    console.error('❌ No backup file found!');
    process.exit(1);
}

const backupFile = path.join(backupDir, backupFiles[0]);
console.log(`Using backup: ${backupFile}\n`);

const preparations = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

console.log(`Found ${preparations.length} preparations in backup\n`);

const insertStmt = db.prepare(`
    INSERT INTO Preparations (id, name, category, description, yield, prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let restored = 0;
preparations.forEach(prep => {
    try {
        insertStmt.run(
            prep.id,
            prep.name,
            prep.category,
            prep.description || '',
            prep.yield || 4,
            prep.prepTime || '',
            prep.difficulty || 'Media',
            prep.ingredients, // Already JSON string
            prep.instructions, // Already JSON string
            prep.tips, // Already JSON string
            prep.dateAdded || Date.now(),
            prep.isCustom !== undefined ? prep.isCustom : 1
        );
        console.log(`✓ Restored: ${prep.name}`);
        restored++;
    } catch (error) {
        console.error(`❌ Error restoring ${prep.name}:`, error.message);
    }
});

console.log(`\n✅ Restored ${restored}/${preparations.length} preparations`);

db.close();
