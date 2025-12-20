const XLSX = require('xlsx');

const excelPath = './MENU\' PIZZE.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = 'Ricette dei preparati';
const worksheet = workbook.Sheets[sheetName];

// Get range
const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log(`📊 Sheet range: ${worksheet['!ref']}`);
console.log(`   Rows: ${range.s.r} to ${range.e.r} (${range.e.r - range.s.r + 1} rows)`);
console.log(`   Cols: ${range.s.c} to ${range.e.c} (${range.e.c - range.s.c + 1} cols)\n`);

// Show first few rows and columns
console.log('🔍 First 10 rows x 6 columns:\n');

for (let R = range.s.r; R <= Math.min(range.s.r + 9, range.e.r); ++R) {
    let row = [];
    for (let C = range.s.c; C <= Math.min(range.s.c + 5, range.e.c); ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        row.push(cell ? String(cell.v).substring(0, 20) : '');
    }
    console.log(`Row ${R + 1}: ${row.map(v => (v || '').padEnd(22)).join(' | ')}`);
}

console.log('\n✅ Mostra struttura completata!');
