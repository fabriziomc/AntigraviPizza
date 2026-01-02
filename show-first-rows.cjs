const XLSX = require('xlsx');
const fs = require('fs');

const excelPath = './MENU\' PIZZE.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = 'Ricette dei preparati';
const worksheet = workbook.Sheets[sheetName];

// Get range
const range = XLSX.utils.decode_range(worksheet['!ref']);

// Extract first 30 rows
const rows = [];
for (let R = range.s.r; R <= Math.min(range.s.r + 29, range.e.r); ++R) {
    let row = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        row.push(cell ? cell.v : null);
    }
    rows.push(row);
}

// Display
console.log('First 30 rows:\n');
rows.forEach((row, idx) => {
    const rowStr = row.map(v => v !== null ? String(v).padEnd(25).substring(0, 25) : ''.padEnd(25)).join(' |  ');
    console.log(`${String(idx + 1).padStart(3)}: ${rowStr}`);
});

// Save to file for easier viewing
fs.writeFileSync('excel-preview.txt', rows.map((row, idx) =>
    `${String(idx + 1).padStart(3)}: ${row.map(v => v !== null ? String(v) : '').join('  |  ')}`
).join('\n'));

console.log('\n✅ Saved to excel-preview.txt for easier viewing');
