-- ============================================
-- SQLite Schema for AntigraviPizza
-- ============================================

-- Recipes Table
CREATE TABLE IF NOT EXISTS Recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pizzaiolo TEXT,
    source TEXT,
    description TEXT,
    ingredients TEXT, -- JSON
    instructions TEXT, -- JSON
    imageUrl TEXT,
    archetype TEXT,
    createdAt INTEGER,
    dateAdded INTEGER,
    isFavorite INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    tags TEXT -- JSON
);

-- Pizza Nights Table
CREATE TABLE IF NOT EXISTS PizzaNights (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date INTEGER,
    guestCount INTEGER DEFAULT 6,
    selectedPizzas TEXT, -- JSON
    selectedGuests TEXT, -- JSON
    notes TEXT,
    status TEXT DEFAULT 'planned',
    createdAt INTEGER
);

-- Guests Table
CREATE TABLE IF NOT EXISTS Guests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt INTEGER
);

-- Combinations Table
CREATE TABLE IF NOT EXISTS Combinations (
    id TEXT PRIMARY KEY,
    ingredients TEXT, -- JSON
    createdAt INTEGER
);

-- Preparations Table (NEW!)
CREATE TABLE IF NOT EXISTS Preparations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    yield INTEGER DEFAULT 4,
    prepTime TEXT,
    difficulty TEXT,
    ingredients TEXT, -- JSON
    instructions TEXT, -- JSON
    tips TEXT, -- JSON
    dateAdded INTEGER,
    isCustom INTEGER DEFAULT 1
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_name ON Recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipes_pizzaiolo ON Recipes(pizzaiolo);
CREATE INDEX IF NOT EXISTS idx_recipes_favorite ON Recipes(isFavorite);
CREATE INDEX IF NOT EXISTS idx_pizzanights_date ON PizzaNights(date);
CREATE INDEX IF NOT EXISTS idx_pizzanights_status ON PizzaNights(status);
CREATE INDEX IF NOT EXISTS idx_preparations_category ON Preparations(category);
CREATE INDEX IF NOT EXISTS idx_preparations_difficulty ON Preparations(difficulty);
CREATE INDEX IF NOT EXISTS idx_preparations_name ON Preparations(name);
