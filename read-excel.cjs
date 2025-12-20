const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔍 Looking for Excel file...\n');

// Try different possible locations
const possiblePaths = [
    './MENU\' PIZZE.xlsx',
    './menu\'pizze.xlsx',
    './menupizze.xlsx',
    './menu pizze.xlsx',
    './MENU\' PIZZE.xls',
    './menu\'pizze.xls'
];

let excelPath = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        excelPath = p;
        break;
    }
}

if (!excelPath) {
    console.log('❌ File Excel non trovato!');
    console.log('Percorsi cercati:');
    possiblePaths.forEach(p => console.log(`  - ${p}`));
    console.log('\nSe il file è altrove, copialo nella cartella del progetto.');
    process.exit(1);
}

console.log(`✅ File trovato: ${excelPath}\n`);

// Read Excel file
const workbook = XLSX.readFile(excelPath);
console.log('📊 Fogli disponibili:', workbook.SheetNames.join(', '));

// Find the correct sheet
const sheetName = workbook.SheetNames.find(name =>
    name.toLowerCase().includes('ricette') ||
    name.toLowerCase().includes('preparati')
);

if (!sheetName) {
    console.log('\n❌ Foglio "ricette preparati" non trovato!');
    console.log('Fogli disponibili:', workbook.SheetNames);
    process.exit(1);
}

console.log(`✅ Foglio trovato: "${sheetName}"\n`);

// Read sheet
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`📋 Righe trovate: ${data.length}\n`);

// Show first few rows to understand structure
console.log('🔍 Prime 3 righe per capire la struttura:\n');
data.slice(0, 3).forEach((row, idx) => {
    console.log(`Riga ${idx + 1}:`);
    console.log(JSON.stringify(row, null, 2));
    console.log('---');
});

console.log('\n✅ Analisi completata!');
console.log('Controlla la struttura sopra e dimmi come procedere.');
