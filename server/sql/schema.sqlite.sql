-- SQLite Schema for AntigraviPizza
-- SQLite uses slightly different syntax than SQL Server

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
    createdAt INTEGER, -- Unix timestamp
    dateAdded INTEGER, -- Unix timestamp
    isFavorite INTEGER DEFAULT 0, -- SQLite uses INTEGER for boolean (0/1)
    rating INTEGER DEFAULT 0,
    tags TEXT -- JSON
);

-- Pizza Nights Table
CREATE TABLE IF NOT EXISTS PizzaNights (
    id TEXT PRIMARY KEY,
    name TEXT,
    date INTEGER, -- Unix timestamp
    guestCount INTEGER,
    selectedPizzas TEXT, -- JSON
    selectedGuests TEXT, -- JSON
    notes TEXT,
    status TEXT,
    createdAt INTEGER -- Unix timestamp
);

-- Guests Table
CREATE TABLE IF NOT EXISTS Guests (
    id TEXT PRIMARY KEY,
    name TEXT,
    createdAt INTEGER -- Unix timestamp
);

-- Combinations Table
CREATE TABLE IF NOT EXISTS Combinations (
    id TEXT PRIMARY KEY,
    ingredients TEXT, -- JSON
    createdAt INTEGER -- Unix timestamp
);
