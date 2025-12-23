const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('server/preparations-export.json', 'utf8'));

// Create CSV header
const csvLines = ['Nome Preparazione,Ingredienti'];

// Process each preparation
data.preparations.forEach(prep => {
    const name = prep.name;

    // Format ingredients list
    const ingredients = prep.ingredients
        .map(ing => `${ing.name} (${ing.quantity}${ing.unit})`)
        .join('; ');

    // Add row to CSV (handle commas and quotes in data)
    const escapedName = name.includes(',') || name.includes('"') ? `"${name.replace(/"/g, '""')}"` : name;
    const escapedIngredients = ingredients.includes(',') || ingredients.includes('"') ? `"${ingredients.replace(/"/g, '""')}"` : ingredients;

    csvLines.push(`${escapedName},${escapedIngredients}`);
});

// Write CSV file
const csvContent = csvLines.join('\n');
fs.writeFileSync('server/preparations-ingredients.csv', csvContent, 'utf8');

console.log(`✅ CSV creato con successo: server/preparations-ingredients.csv`);
console.log(`   - ${data.preparations.length} preparazioni esportate`);
