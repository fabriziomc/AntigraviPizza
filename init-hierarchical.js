
import { query } from './server/db-mssql.js';

async function initHierarchicalTables() {
    try {
        console.log('🔄 Initializing Hierarchical Tables in SQL Server...');

        const tables = [
            {
                name: 'Preparations',
                sql: `
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Preparations')
                    BEGIN
                        CREATE TABLE Preparations (
                            id NVARCHAR(50) PRIMARY KEY,
                            name NVARCHAR(255) NOT NULL,
                            category NVARCHAR(100),
                            description NVARCHAR(MAX),
                            [yield] INT DEFAULT 4,
                            prepTime NVARCHAR(50),
                            difficulty NVARCHAR(50),
                            ingredients NVARCHAR(MAX), 
                            instructions NVARCHAR(MAX), 
                            tips NVARCHAR(MAX), 
                            dateAdded BIGINT,
                            isCustom BIT DEFAULT 1
                        );
                    END`
            },
            {
                name: 'Categories',
                sql: `
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
                    BEGIN
                        CREATE TABLE Categories (
                            id NVARCHAR(50) PRIMARY KEY,
                            name NVARCHAR(255) NOT NULL UNIQUE,
                            icon NVARCHAR(50),
                            displayOrder INT,
                            description NVARCHAR(MAX),
                            createdAt BIGINT NOT NULL
                        );
                    END`
            },
            {
                name: 'Ingredients',
                sql: `
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ingredients')
                    BEGIN
                        CREATE TABLE Ingredients (
                            id NVARCHAR(50) PRIMARY KEY,
                            name NVARCHAR(255) NOT NULL UNIQUE,
                            categoryId NVARCHAR(50) NOT NULL,
                            subcategory NVARCHAR(100),
                            minWeight INT,
                            maxWeight INT,
                            defaultUnit NVARCHAR(50) DEFAULT 'g',
                            postBake BIT DEFAULT 0,
                            phase NVARCHAR(50) DEFAULT 'topping',
                            season NVARCHAR(MAX), 
                            allergens NVARCHAR(MAX), 
                            tags NVARCHAR(MAX), 
                            isCustom BIT DEFAULT 0,
                            dateAdded BIGINT NOT NULL,
                            CONSTRAINT FK_Ingredients_Category FOREIGN KEY (categoryId) REFERENCES Categories(id)
                        );
                    END`
            },
            {
                name: 'ArchetypeWeights',
                sql: `
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ArchetypeWeights')
                    BEGIN
                        CREATE TABLE ArchetypeWeights (
                            id NVARCHAR(50) PRIMARY KEY,
                            userId NVARCHAR(50) DEFAULT 'default',
                            archetype NVARCHAR(100) NOT NULL,
                            weight INT NOT NULL,
                            description NVARCHAR(MAX),
                            dateModified BIGINT NOT NULL,
                            CONSTRAINT UC_ArchetypeWeights UNIQUE (userId, archetype)
                        );
                    END`
            }
        ];

        for (const table of tables) {
            console.log(` ⏳ Creating ${table.name}...`);
            await query(table.sql);
            console.log(` ✅ ${table.name} ready.`);
        }

        console.log('🚀 All hierarchical tables initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('💥 Critical error:', err.message);
        process.exit(1);
    }
}

initHierarchicalTables();
