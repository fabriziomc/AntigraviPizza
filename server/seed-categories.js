// Seed Categories - Run this first
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

export async function seedCategories() {
    const db = new Database(dbPath);

    console.log('🌱 Seeding Categories...\n');

    // Check if already seeded
    const existing = db.prepare('SELECT COUNT(*) as count FROM Categories').get();
    if (existing.count > 0) {
        console.log(`⏭️  Categories already seeded (${existing.count} categories exist)`);
        db.close();
        return;
    }

    // Define 10 standard categories
    const categories = [
        {
            id: randomUUID(),
            name: 'Impasti',
            icon: '🌾',
            displayOrder: 1,
            description: 'Farine, lieviti, acqua, sale, olio per impasti'
        },
        {
            id: randomUUID(),
            name: 'Basi e Salse',
            icon: '🍅',
            displayOrder: 2,
            description: 'Salse base, creme, condimenti liquidi'
        },
        {
            id: randomUUID(),
            name: 'Formaggi',
            icon: '🧀',
            displayOrder: 3,
            description: 'Tutti i formaggi (freschi, stagionati, fusi)'
        },
        {
            id: randomUUID(),
            name: 'Latticini',
            icon: '🥛',
            displayOrder: 4,
            description: 'Prodotti lattiero-caseari non formaggi'
        },
        {
            id: randomUUID(),
            name: 'Carni e Salumi',
            icon: '🥓',
            displayOrder: 5,
            description: 'Carni fresche, salumi, affettati'
        },
        {
            id: randomUUID(),
            name: 'Pesce e Frutti di Mare',
            icon: '🐟',
            displayOrder: 6,
            description: 'Pesce fresco, affumicato, conservato'
        },
        {
            id: randomUUID(),
            name: 'Verdure e Ortaggi',
            icon: '🥬',
            displayOrder: 7,
            description: 'Verdure fresche, grigliate, sott\'olio'
        },
        {
            id: randomUUID(),
            name: 'Erbe e Spezie',
            icon: '🌿',
            displayOrder: 8,
            description: 'Aromi, spezie, erbe fresche e secche'
        },
        {
            id: randomUUID(),
            name: 'Frutta e Frutta Secca',
            icon: '🥜',
            displayOrder: 9,
            description: 'Frutta fresca, secca, semi'
        },
        {
            id: randomUUID(),
            name: 'Altro',
            icon: '📦',
            displayOrder: 10,
            description: 'Ingredienti speciali, miele, aceti, etc.'
        }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO Categories (id, name, icon, displayOrder, description, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    categories.forEach(cat => {
        insertStmt.run(
            cat.id,
            cat.name,
            cat.icon,
            cat.displayOrder,
            cat.description,
            Date.now()
        );
        console.log(`✓ ${cat.icon} ${cat.name}`);
    });

    console.log(`\n✅ Seeded ${categories.length} categories`);
    db.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedCategories();
}
