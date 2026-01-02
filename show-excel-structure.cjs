const XLSX = require('xlsx');

const excelPath = './MENU\' PIZZE.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = 'Ricette dei preparati';
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`📊 Total rows: ${data.length}\n`);

if (data.length > 0) {
    console.log('📋 Columns found:');
    Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}`);
    });

    console.log('\n🔍 First 3 rows:\n');
    data.slice(0, 3).forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`);
        console.log(JSON.stringify(row, null, 2));
        console.log('---\n');
    });
}
