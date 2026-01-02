-- ============================================
-- RESET COMPLETO DATABASE AntigraviPizza
-- ============================================
-- Questo script elimina tutte le tabelle esistenti e le ricrea
-- con la nuova struttura che include Preparations

USE AntigraviPizzaDB;
GO

-- ============================================
-- 1. DROP TABELLE ESISTENTI
-- ============================================

-- Drop in ordine inverso per rispettare le foreign keys (se esistono)
IF OBJECT_ID('Combinations', 'U') IS NOT NULL
    DROP TABLE Combinations;

IF OBJECT_ID('Guests', 'U') IS NOT NULL
    DROP TABLE Guests;

IF OBJECT_ID('PizzaNights', 'U') IS NOT NULL
    DROP TABLE PizzaNights;

IF OBJECT_ID('Recipes', 'U') IS NOT NULL
    DROP TABLE Recipes;

IF OBJECT_ID('Preparations', 'U') IS NOT NULL
    DROP TABLE Preparations;

PRINT 'Tabelle esistenti eliminate';
GO

-- ============================================
-- 2. CREA NUOVE TABELLE
-- ============================================

-- Tabella Recipes
CREATE TABLE Recipes (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    pizzaiolo NVARCHAR(100),
    source NVARCHAR(500),
    description NVARCHAR(1000),
    baseIngredients NVARCHAR(MAX), -- JSON
    preparations NVARCHAR(MAX), -- JSON
    instructions NVARCHAR(MAX), -- JSON
    imageUrl NVARCHAR(500),
    dough NVARCHAR(100),
    suggestedDough NVARCHAR(100),
    tags NVARCHAR(MAX), -- JSON
    dateAdded BIGINT,
    isFavorite BIT DEFAULT 0,
    archetype NVARCHAR(50)
);

CREATE INDEX IX_Recipes_Name ON Recipes(name);
CREATE INDEX IX_Recipes_Pizzaiolo ON Recipes(pizzaiolo);
CREATE INDEX IX_Recipes_DateAdded ON Recipes(dateAdded);
CREATE INDEX IX_Recipes_IsFavorite ON Recipes(isFavorite);

PRINT 'Tabella Recipes creata';
GO

-- Tabella PizzaNights
CREATE TABLE PizzaNights (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    [date] BIGINT,
    guestCount INT DEFAULT 6,
    selectedDough NVARCHAR(100),
    selectedPizzas NVARCHAR(MAX), -- JSON
    selectedGuests NVARCHAR(MAX), -- JSON
    notes NVARCHAR(1000),
    status NVARCHAR(20) DEFAULT 'planned',
    createdAt BIGINT
);

CREATE INDEX IX_PizzaNights_Date ON PizzaNights([date]);
CREATE INDEX IX_PizzaNights_Status ON PizzaNights(status);

PRINT 'Tabella PizzaNights creata';
GO

-- Tabella Guests
CREATE TABLE Guests (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    createdAt BIGINT
);

CREATE INDEX IX_Guests_Name ON Guests(name);

PRINT 'Tabella Guests creata';
GO

-- Tabella Combinations
CREATE TABLE Combinations (
    id NVARCHAR(50) PRIMARY KEY,
    ingredients NVARCHAR(MAX), -- JSON
    createdAt BIGINT
);

PRINT 'Tabella Combinations creata';
GO

-- Tabella Preparations (NUOVA!)
CREATE TABLE Preparations (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    category NVARCHAR(50),
    description NVARCHAR(500),
    [yield] INT DEFAULT 4,
    prepTime NVARCHAR(50),
    difficulty NVARCHAR(20),
    ingredients NVARCHAR(MAX), -- JSON
    instructions NVARCHAR(MAX), -- JSON
    tips NVARCHAR(MAX), -- JSON
    dateAdded BIGINT,
    isCustom BIT DEFAULT 1
);

CREATE INDEX IX_Preparations_Category ON Preparations(category);
CREATE INDEX IX_Preparations_Difficulty ON Preparations(difficulty);
CREATE INDEX IX_Preparations_IsCustom ON Preparations(isCustom);
CREATE INDEX IX_Preparations_Name ON Preparations(name);

PRINT 'Tabella Preparations creata';
GO

-- ============================================
-- 3. VERIFICA
-- ============================================

PRINT '';
PRINT '============================================';
PRINT 'RIEPILOGO TABELLE CREATE:';
PRINT '============================================';

SELECT 
    TABLE_NAME as 'Tabella',
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as 'Colonne'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

PRINT '';
PRINT '✅ Database resettato con successo!';
PRINT '';
PRINT 'PROSSIMI PASSI:';
PRINT '1. Riavvia il server Node.js';
PRINT '2. Avvia l''app con avvia_app_server.bat';
PRINT '3. Le preparazioni seed verranno caricate automaticamente';
PRINT '4. Importa le ricette che desideri';
GO
