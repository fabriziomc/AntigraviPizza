import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');
const db = new Database(dbPath);

console.log('📊 STATISTICHE DATABASE DOPO PULIZIA\n');
console.log('='.repeat(60));

// Totale ingredienti
const totalIngredients = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
console.log(`\nTotale ingredienti: ${totalIngredients.count}`);

// Con tag
const withTags = db.prepare("SELECT COUNT(*) as count FROM Ingredients WHERE tags IS NOT NULL AND tags != '[]'").get();
console.log(`Con tag: ${withTags.count}`);

// Senza tag
const withoutTags = totalIngredients.count - withTags.count;
console.log(`Senza tag: ${withoutTags}`);

// Coverage
const coverage = (withTags.count / totalIngredients.count * 100).toFixed(1);
console.log(`\n✅ Coverage: ${coverage}%`);

// Totale preparazioni
const totalPreps = db.prepare('SELECT COUNT(*) as count FROM Preparations').get();
const prepsWithTags = db.prepare("SELECT COUNT(*) as count FROM Preparations WHERE tags IS NOT NULL AND tags != '[]'").get();
console.log(`\n📦 Preparazioni: ${prepsWithTags.count}/${totalPreps.count} con tag (${(prepsWithTags.count / totalPreps.count * 100).toFixed(1)}%)`);

console.log('\n' + '='.repeat(60));

db.close();
