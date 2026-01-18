import { createClient } from '@libsql/client';
import sqlite3 from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

/**
 * Migration: Add hasSeenOnboarding column to Settings table
 */
async function migrate() {
    console.log('🚀 Starting onboarding migration...');

    // 1. Migrate Local SQLite
    const dbPath = path.join(process.cwd(), 'antigravipizza.db');
    if (fs.existsSync(dbPath)) {
        console.log(`📦 Migrating local SQLite: ${dbPath}`);
        try {
            const db = new sqlite3(dbPath);
            const columns = db.pragma('table_info(Settings)');
            const hasColumn = columns.some(c => c.name === 'hasSeenOnboarding');

            if (!hasColumn) {
                db.prepare('ALTER TABLE Settings ADD COLUMN hasSeenOnboarding BOOLEAN DEFAULT 0').run();
                console.log('✅ Added hasSeenOnboarding to local Settings table');
            } else {
                console.log('ℹ️ Column hasSeenOnboarding already exists in local SQLite');
            }
            db.close();
        } catch (err) {
            console.error('❌ Local SQLite migration failed:', err.message);
        }
    }

    // 2. Migrate Turso (Remote)
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
        console.log('🌍 Migrating Turso database...');
        try {
            const client = createClient({
                url: process.env.TURSO_DATABASE_URL,
                authToken: process.env.TURSO_AUTH_TOKEN,
            });

            // Check if column exists
            const info = await client.execute('PRAGMA table_info(Settings)');
            const hasColumn = info.rows.some(r => r.name === 'hasSeenOnboarding');

            if (!hasColumn) {
                await client.execute('ALTER TABLE Settings ADD COLUMN hasSeenOnboarding BOOLEAN DEFAULT 0');
                console.log('✅ Added hasSeenOnboarding to Turso Settings table');
            } else {
                console.log('ℹ️ Column hasSeenOnboarding already exists in Turso');
            }
        } catch (err) {
            console.error('❌ Turso migration failed:', err.message);
        }
    } else {
        console.log('⏭️ Turso credentials not found, skipping remote migration');
    }

    console.log('🏁 Migration finished');
}

migrate().catch(err => {
    console.error('💥 Migration script crashed:', err);
    process.exit(1);
});
