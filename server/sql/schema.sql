IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AntigraviPizza')
BEGIN
    CREATE DATABASE AntigraviPizza;
END
GO

USE AntigraviPizza;
GO

-- Recipes Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recipes')
BEGIN
    CREATE TABLE Recipes (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        pizzaiolo NVARCHAR(255),
        source NVARCHAR(255),
        description NVARCHAR(MAX),
        ingredients NVARCHAR(MAX), -- JSON
        instructions NVARCHAR(MAX), -- JSON
        imageUrl NVARCHAR(MAX),
        archetype NVARCHAR(100),
        createdAt BIGINT,
        dateAdded BIGINT,
        isFavorite BIT DEFAULT 0,
        rating INT DEFAULT 0,
        tags NVARCHAR(MAX) -- JSON
    );
END
GO

-- Pizza Nights Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PizzaNights')
BEGIN
    CREATE TABLE PizzaNights (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(255),
        date BIGINT,
        guestCount INT,
        selectedPizzas NVARCHAR(MAX), -- JSON
        selectedGuests NVARCHAR(MAX), -- JSON
        notes NVARCHAR(MAX),
        status NVARCHAR(50),
        createdAt BIGINT
    );
END
GO

-- Guests Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Guests')
BEGIN
    CREATE TABLE Guests (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(255),
        createdAt BIGINT
    );
END
GO

-- Combinations Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Combinations')
BEGIN
    CREATE TABLE Combinations (
        id NVARCHAR(50) PRIMARY KEY,
        ingredients NVARCHAR(MAX), -- JSON
        createdAt BIGINT
    );
END
GO
