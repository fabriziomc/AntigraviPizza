const Database = require('better-sqlite3').default || require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('\n=== ANALISI INGREDIENTI ===\n');

// Ottieni tutti gli ingredienti
const ingredients = db.prepare(`
  SELECT id, name, description, categoryId 
  FROM Ingredients 
  ORDER BY id
`).all();

console.log(`Totale ingredienti: ${ingredients.length}\n`);

// Parole chiave che indicano istruzioni di preparazione
const preparationKeywords = [
    'stendere', 'spalmare', 'distribuire', 'cospargere', 'aggiungere',
    'cuocere', 'infornare', 'preriscaldare', 'forno', 'temperatura',
    'minuti', 'gradi', 'condire', 'servire', 'tagliare a', 'affettare',
    'grattugiare', 'tritare', 'mescolare', 'amalgamare', 'impastare',
    'lasciar', 'far lievitare', 'riposare', 'marinare', 'soffriggere',
    'rosolare', 'scottare', 'bollire', 'al dente', 'fino a quando',
    'quindi', 'poi poi', 'infine', 'a questo punto', 'quando', 'prima di'
];

// Cerca ingredienti sospetti
const suspiciousIngredients = [];

ingredients.forEach(ing => {
    const text = `${ing.name} ${ing.description || ''}`.toLowerCase();

    // Controlla se contiene parole chiave di preparazione
    const foundKeywords = preparationKeywords.filter(keyword =>
        text.includes(keyword.toLowerCase())
    );

    // Se il nome è molto lungo (più di 50 caratteri) o la descrizione è molto lunga
    const nameTooLong = ing.name.length > 50;
    const descriptionTooLong = ing.description && ing.description.length > 200;

    // Se contiene frasi tipiche delle istruzioni
    const hasInstructionPhrases =
        text.includes('stendere la pasta') ||
        text.includes('mettere in forno') ||
        text.includes('cuocere per') ||
        text.includes('distribuire sulla') ||
        text.includes('aggiungere il') ||
        text.includes('cospargere con') ||
        text.includes('minuti a') ||
        text.includes('gradi');

    if (foundKeywords.length > 2 || nameTooLong || descriptionTooLong || hasInstructionPhrases) {
        suspiciousIngredients.push({
            ...ing,
            reasons: {
                keywords: foundKeywords,
                nameTooLong,
                descriptionTooLong,
                hasInstructionPhrases
            }
        });
    }
});

console.log(`\n=== INGREDIENTI SOSPETTI (${suspiciousIngredients.length}) ===\n`);

if (suspiciousIngredients.length === 0) {
    console.log('Nessun ingrediente sospetto trovato!');
} else {
    suspiciousIngredients.forEach((ing, index) => {
        console.log(`\n--- ${index + 1}. ID: ${ing.id} ---`);
        console.log(`Nome: ${ing.name}`);
        if (ing.description) {
            console.log(`Descrizione: ${ing.description}`);
        }
        console.log(`Categoria ID: ${ing.categoryId}`);
        console.log('Motivi sospetti:');
        if (ing.reasons.keywords.length > 0) {
            console.log(`  - Contiene parole chiave di preparazione: ${ing.reasons.keywords.join(', ')}`);
        }
        if (ing.reasons.nameTooLong) {
            console.log(`  - Nome troppo lungo (${ing.name.length} caratteri)`);
        }
        if (ing.reasons.descriptionTooLong) {
            console.log(`  - Descrizione troppo lunga (${ing.description.length} caratteri)`);
        }
        if (ing.reasons.hasInstructionPhrases) {
            console.log(`  - Contiene frasi tipiche delle istruzioni`);
        }
    });

    // Stampa lista di ID da eliminare
    console.log('\n\n=== ID DA ELIMINARE ===');
    console.log(suspiciousIngredients.map(ing => ing.id).join(', '));
}

db.close();
