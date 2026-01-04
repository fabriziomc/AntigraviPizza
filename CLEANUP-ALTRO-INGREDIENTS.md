# Cleanup Script per Ingredienti in Categoria "Altro"

Esegui queste query SQL direttamente dalla dashboard di Turso (https://turso.tech/app)

## 1. Elimina ingrediente fake

```sql
DELETE FROM Ingredients WHERE name = 'Pulire gamberi, unire lime';
```

## 2. Ri-categorizza ingredienti

```sql
-- Frutta
UPDATE Ingredients SET category = 'Frutta e Frutta Secca' WHERE name = 'Cocco' AND category = 'Altro';
UPDATE Ingredients SET category = 'Frutta e Frutta Secca' WHERE name = 'Ananas' AND category = 'Altro';

-- Pesce
UPDATE Ingredients SET category = 'Pesce e Frutti di Mare' WHERE name = 'Calamari' AND category = 'Altro';
UPDATE Ingredients SET category = 'Pesce e Frutti di Mare' WHERE name = 'Gamberi' AND category = 'Altro';
```

## Verifica

Dopo aver eseguito le query, verifica con:

```sql
SELECT name, category FROM Ingredients WHERE category = 'Altro' ORDER BY name;
```

La categoria "Altro" dovrebbe essere vuota o contenere solo ingredienti veramente generici.
